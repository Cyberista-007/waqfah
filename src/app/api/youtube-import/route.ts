
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { z } from 'zod';

const youtubeImportSchema = z.object({
  url: z.string().url("الرجاء إدخال رابط صحيح."),
});

function getPlaylistIdFromUrl(url: string): string | null {
    try {
        const parsedUrl = new URL(url);
        const playlistId = parsedUrl.searchParams.get('list');
        return playlistId;
    } catch (error) {
        return null;
    }
}

async function getChannelIdFromUrl(url: string, youtube: any): Promise<string | null> {
    try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

        let channelId: string | null = null;
        
        if (pathParts[0] === 'channel' && pathParts[1]) {
            channelId = pathParts[1];
        } else if (pathParts[0]?.startsWith('@')) {
            const handle = pathParts[0].substring(1); // Remove "@"
            const response = await youtube.channels.list({
                part: ['id'],
                forHandle: handle,
            });
            channelId = response.data.items?.[0]?.id || null;
        } else if (pathParts[0] === 'user' && pathParts[1]) {
            const username = pathParts[1];
            const response = await youtube.channels.list({
                part: ['id'],
                forUsername: username,
            });
            channelId = response.data.items?.[0]?.id || null;
        }

        return channelId;

    } catch (error) {
        console.error("Error parsing channel URL:", error);
        return null;
    }
}

function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    return (hours * 3600) + (minutes * 60) + seconds;
}

async function fetchPlaylistVideos(youtube: any, playlistId: string) {
    let allVideos: any[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
        const playlistResponse = await youtube.playlistItems.list({
            part: ['snippet'],
            playlistId: playlistId,
            maxResults: 50,
            pageToken: nextPageToken,
        });

        const videoIds = playlistResponse.data.items?.map(item => item.snippet?.resourceId?.videoId).filter(Boolean) as string[];
        
        if (videoIds.length > 0) {
             const videoDetailsResponse = await youtube.videos.list({
                part: ['snippet', 'contentDetails'],
                id: videoIds,
            });

            if (videoDetailsResponse.data.items) {
                allVideos.push(...videoDetailsResponse.data.items);
            }
        }
        nextPageToken = playlistResponse.data.nextPageToken || undefined;
    } while (nextPageToken);
    
    return allVideos;
}


export async function POST(req: NextRequest) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ message: "مفتاح واجهة برمجة تطبيقات يوتيوب غير موجود. يرجى إضافته إلى ملف .env." }, { status: 500 });
    }

    try {
        const body = await req.json();
        const validation = youtubeImportSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
        }
        
        const url = validation.data.url;

        const youtube = google.youtube({
            version: 'v3',
            auth: apiKey,
        });

        let allVideos: any[] = [];
        let allPlaylists: any[] = [];

        const playlistIdFromUrl = getPlaylistIdFromUrl(url);

        if (playlistIdFromUrl) {
            // It's a playlist URL, fetch its videos
            allVideos = await fetchPlaylistVideos(youtube, playlistIdFromUrl);
        } else {
            // Assume it's a channel URL
            const channelId = await getChannelIdFromUrl(url, youtube);
            if (channelId) {
                 const channelResponse = await youtube.channels.list({
                    part: ['contentDetails'],
                    id: [channelId]
                });
                
                const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
                if (uploadsPlaylistId) {
                    allVideos = await fetchPlaylistVideos(youtube, uploadsPlaylistId);
                }

                // Fetch channel's playlists
                let nextPageToken: string | undefined = undefined;
                do {
                    const playlistsResponse = await youtube.playlists.list({
                        part: ['snippet', 'contentDetails'],
                        channelId: channelId,
                        maxResults: 50,
                        pageToken: nextPageToken,
                    });
                    if (playlistsResponse.data.items) {
                        allPlaylists.push(...playlistsResponse.data.items);
                    }
                    nextPageToken = playlistsResponse.data.nextPageToken || undefined;
                } while (nextPageToken);

            } else {
                 return NextResponse.json({ message: "لم يتم العثور على قناة أو قائمة تشغيل صالحة في الرابط." }, { status: 400 });
            }
        }
        
        const videos: any[] = [];
        const shorts: any[] = [];

        allVideos.forEach(item => {
            const durationInSeconds = item.contentDetails?.duration ? parseISO8601Duration(item.contentDetails.duration) : 0;
            const videoData = {
                videoId: item.id,
                title: item.snippet?.title || 'بدون عنوان',
                description: item.snippet?.description || '',
                durationInSeconds,
            };

            if (durationInSeconds > 0 && durationInSeconds <= 60) {
                shorts.push(videoData);
            } else {
                videos.push(videoData);
            }
        });
        
        const formattedPlaylists = allPlaylists.map(item => ({
            id: item.id,
            title: item.snippet.title,
            videoCount: item.contentDetails.itemCount,
        }));
        
        return NextResponse.json({ videos, shorts, playlists: formattedPlaylists });

    } catch (error: any) {
        console.error("YouTube API Error:", error);
        if (error.code === 403) {
             return NextResponse.json({ message: "تم رفض الطلب من قبل يوتيوب. قد يكون مفتاح الـ API غير صحيح أو مقيد." }, { status: 403 });
        }
        if (error.code === 404) {
             return NextResponse.json({ message: "لم يتم العثور على القناة أو قائمة التشغيل." }, { status: 404 });
        }
        return NextResponse.json({ message: error.message || "حدث خطأ غير متوقع أثناء الاتصال بواجهة يوتيوب." }, { status: 500 });
    }
}

    