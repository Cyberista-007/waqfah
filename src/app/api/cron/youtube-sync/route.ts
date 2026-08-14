import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getFirestore as getClientFirestore,
    collection,
    getDocs,
    doc,
    addDoc,
    updateDoc,
    setDoc,
    query,
    where,
    limit,
    increment as clientIncrement,
    serverTimestamp
} from 'firebase/firestore';

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

    // Optional security check if CRON_SECRET is set
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'YOUTUBE_API_KEY is not set.' }, { status: 500 });
    }

    // Try Admin Firestore first, or seamlessly fallback to Client Firestore SDK (Web API Key)
    let adminFirestore: FirebaseFirestore.Firestore | null = null;
    let clientDb: any = null;

    try {
        const adminApp = initializeAdminApp();
        adminFirestore = adminApp.firestore;
    } catch {
        adminFirestore = null;
    }

    if (!adminFirestore) {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        clientDb = getClientFirestore(app);
    }

    const youtube = google.youtube({
        version: 'v3',
        auth: apiKey,
    });

    try {
        let programs: any[] = [];

        if (adminFirestore) {
            const programsSnapshot = await adminFirestore.collection('programs').get();
            programs = programsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
            const programsSnapshot = await getDocs(collection(clientDb, 'programs'));
            programs = programsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        if (programs.length === 0) {
            return NextResponse.json({ success: true, message: 'No programs found to sync.', totalImported: 0 }, { status: 200 });
        }

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
                        // Search channel by handle or name
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

                                // Save channel ID back to the program
                                if (adminFirestore) {
                                    await adminFirestore.collection('programs').doc(program.id).update({ channelId });
                                } else {
                                    await updateDoc(doc(clientDb, 'programs', program.id), { channelId });
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Failed to extract channelId for program: ${program.name}`, err);
                }
            }

            if (!channelId) {
                continue;
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
                    let isDuplicate = false;
                    if (adminFirestore) {
                        const duplicateCheck = await adminFirestore.collection('lectures')
                            .where('youtubeUrl', '==', youtubeUrl)
                            .limit(1)
                            .get();
                        isDuplicate = !duplicateCheck.empty;
                    } else {
                        const duplicateQuery = query(collection(clientDb, 'lectures'), where('youtubeUrl', '==', youtubeUrl), limit(1));
                        const duplicateSnap = await getDocs(duplicateQuery);
                        isDuplicate = !duplicateSnap.empty;
                    }

                    if (isDuplicate) {
                        continue;
                    }

                    // Fetch full video details for duration & view count
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

                    // Generate clean unique slug
                    let slug = title
                        .trim()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');

                    let isSlugTaken = false;
                    if (adminFirestore) {
                        const slugCheck = await adminFirestore.collection('lectures')
                            .where('slug', '==', slug)
                            .limit(1)
                            .get();
                        isSlugTaken = !slugCheck.empty;
                    } else {
                        const slugQuery = query(collection(clientDb, 'lectures'), where('slug', '==', slug), limit(1));
                        const slugSnap = await getDocs(slugQuery);
                        isSlugTaken = !slugSnap.empty;
                    }

                    if (isSlugTaken) {
                        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
                    }

                    const lectureData: any = {
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
                        language: 'ar',
                    };

                    if (adminFirestore) {
                        lectureData.createdAt = Timestamp.now();
                        lectureData.publishedAt = Timestamp.fromDate(new Date(publishedAtStr));
                        await adminFirestore.collection('lectures').add(lectureData);
                    } else {
                        lectureData.createdAt = serverTimestamp();
                        lectureData.publishedAt = new Date(publishedAtStr);
                        await addDoc(collection(clientDb, 'lectures'), lectureData);
                    }

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

        // Update global lecture count stat
        if (totalImported > 0) {
            if (adminFirestore) {
                const statsRef = adminFirestore.doc('stats/global');
                await statsRef.set({
                    lectures: FieldValue.increment(totalImported)
                }, { merge: true });
            } else {
                const statsRef = doc(clientDb, 'stats', 'global');
                await setDoc(statsRef, {
                    lectures: clientIncrement(totalImported)
                }, { merge: true });
            }
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
