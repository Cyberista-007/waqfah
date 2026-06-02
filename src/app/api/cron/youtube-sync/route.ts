import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    return (hours * 3600) + (minutes * 60) + seconds;
}

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Optional security: Validate request against a secret key if set
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'YOUTUBE_API_KEY is not set.' }, { status: 500 });
    }

    const { firestore } = initializeAdminApp();
    if (!firestore) {
        return NextResponse.json({ error: 'Firebase Admin Firestore is not initialized.' }, { status: 500 });
    }

    const youtube = google.youtube({
        version: 'v3',
        auth: apiKey,
    });

    try {
        // 1. Fetch all programs that have a channel ID
        const programsSnapshot = await firestore.collection('programs').get();
        if (programsSnapshot.empty) {
            return NextResponse.json({ message: 'No programs found to sync.' }, { status: 200 });
        }

        const programs = programsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];

        const syncResults: any[] = [];
        let totalImported = 0;

        for (const program of programs) {
            let channelId = program.channelId;

            // If channelId is missing but we have a youtubeUrl, try to extract channelId
            if (!channelId && program.youtubeUrl) {
                try {
                    const urlObj = new URL(program.youtubeUrl);
                    const pathname = urlObj.pathname;
                    if (pathname.startsWith('/channel/')) {
                        channelId = pathname.split('/channel/')[1].split('/')[0];
                    } else {
                        // Fallback search by handle/name
                        const pathParts = pathname.split('/').filter(p => p && p !== 'c' && p !== 'user');
                        if (pathParts.length > 0) {
                            let potentialName = pathParts[pathParts.length - 1];
                            if (potentialName.startsWith('@')) {
                                potentialName = potentialName.substring(1);
                            }
                            const searchResponse = await youtube.search.list({
                                part: ['id'],
                                q: potentialName,
                                type: ['channel'],
                                maxResults: 1
                            });
                            if (searchResponse.data.items?.[0]?.id?.channelId) {
                                channelId = searchResponse.data.items[0].id.channelId;
                                // Save channel ID back to the program to optimize future runs
                                await firestore.collection('programs').doc(program.id).update({ channelId });
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Failed to extract channelId for program: ${program.name}`, err);
                }
            }

            if (!channelId) {
                continue; // Skip programs with no channel associated
            }

            // 2. Fetch the uploads playlist ID (UU prefix instead of UC prefix)
            const uploadsPlaylistId = 'UU' + channelId.substring(2);

            try {
                // Fetch the latest 5 videos from the channel uploads playlist
                const playlistItemsResponse = await youtube.playlistItems.list({
                    part: ['contentDetails', 'snippet'],
                    playlistId: uploadsPlaylistId,
                    maxResults: 5,
                });

                const items = playlistItemsResponse.data.items || [];
                const importedForThisProgram: string[] = [];

                for (const item of items) {
                    const videoId = item.contentDetails?.videoId;
                    const title = item.snippet?.title;
                    const description = item.snippet?.description || '';
                    const publishedAtStr = item.snippet?.publishedAt || new Date().toISOString();

                    if (!videoId || !title) continue;

                    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

                    // Check if this video is already imported in lectures
                    const duplicateCheck = await firestore.collection('lectures')
                        .where('youtubeUrl', '==', youtubeUrl)
                        .limit(1)
                        .get();

                    if (!duplicateCheck.empty) {
                        continue; // Already imported
                    }

                    // Fetch full video details to obtain accurate duration and views
                    let durationInSeconds = 0;
                    let youtubeViewCount = 0;
                    try {
                        const videoDetails = await youtube.videos.list({
                            part: ['contentDetails', 'statistics'],
                            id: [videoId]
                        });
                        const details = videoDetails.data.items?.[0];
                        if (details) {
                            if (details.contentDetails?.duration) {
                                durationInSeconds = parseISO8601Duration(details.contentDetails.duration);
                            }
                            if (details.statistics?.viewCount) {
                                youtubeViewCount = parseInt(details.statistics.viewCount, 10) || 0;
                            }
                        }
                    } catch (detailErr) {
                        console.error(`Failed to fetch details for video: ${videoId}`, detailErr);
                    }

                    // Clean and build slug
                    let slug = title
                        .trim()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');

                    // Ensure slug is unique
                    const slugCheck = await firestore.collection('lectures')
                        .where('slug', '==', slug)
                        .limit(1)
                        .get();

                    if (!slugCheck.empty) {
                        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
                    }

                    const lectureData = {
                        title,
                        slug,
                        description,
                        programId: program.id,
                        programName: program.name,
                        programSlug: program.slug,
                        audioSrc: youtubeUrl,
                        youtubeUrl,
                        duration: durationInSeconds,
                        imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
                        rating: 0,
                        ratingCount: 0,
                        viewCount: 0,
                        youtubeViewCount,
                        transcript: [],
                        createdAt: Timestamp.now(),
                        publishedAt: Timestamp.fromDate(new Date(publishedAtStr)),
                        language: 'ar',
                    };

                    // Add to lectures collection
                    await firestore.collection('lectures').add(lectureData);
                    importedForThisProgram.push(title);
                    totalImported++;
                }

                if (importedForThisProgram.length > 0) {
                    syncResults.push({
                        programName: program.name,
                        importedCount: importedForThisProgram.length,
                        importedLectures: importedForThisProgram
                    });
                }
            } catch (playlistErr) {
                console.error(`Failed to sync channel uploads for program: ${program.name}`, playlistErr);
            }
        }

        // If any lectures were imported, update the global stats counter
        if (totalImported > 0) {
            const statsRef = firestore.doc('stats/global');
            await statsRef.set({
                lectures: FieldValue.increment(totalImported)
            }, { merge: true });
        }

        return NextResponse.json({
            success: true,
            totalImported,
            results: syncResults
        }, { status: 200 });

    } catch (error: any) {
        console.error("YouTube Cron Sync Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || 'An unexpected error occurred during sync.'
        }, { status: 500 });
    }
}
