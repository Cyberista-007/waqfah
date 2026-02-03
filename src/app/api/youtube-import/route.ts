

import { NextRequest, NextResponse } from 'next/server';
import { google, youtube_v3 } from 'googleapis';
import { z } from 'zod';

const youtubeImportSchema = z.object({
  url: z.string().url("الرجاء إدخال رابط صحيح."),
  fetchChannelInfo: z.boolean().optional(),
  fetchVideoInfo: z.boolean().optional(),
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

function getVideoIdFromUrl(url: string): string | null {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname === 'youtu.be') {
          return parsedUrl.pathname.slice(1);
        }
        if (parsedUrl.hostname.includes('youtube.com')) {
          const videoId = parsedUrl.searchParams.get('v');
          if (videoId) {
            return videoId;
          }
        }
    } catch (error) {
        console.error("Invalid YouTube video URL", error);
    }
    return null;
}


async function getChannelIdFromUrl(url: string, youtube: youtube_v3.Youtube): Promise<string | null> {
    try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

        let channelId: string | null = null;
        
        if (pathParts[0] === 'channel' && pathParts[1]) {
            channelId = pathParts[1];
        } else if (pathParts[0]?.startsWith('@')) {
            const handle = pathParts[0]; // Keep "@"
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

async function fetchPlaylistVideos(youtube: youtube_v3.Youtube, playlistId: string) {
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
                part: ['snippet', 'contentDetails', 'statistics'],
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
        
        const { url, fetchChannelInfo, fetchVideoInfo } = validation.data;

        const youtube = google.youtube({
            version: 'v3',
            auth: apiKey,
        });
        
        // Handle single video info fetch
        if (fetchVideoInfo) {
            const videoId = getVideoIdFromUrl(url);
            if (!videoId) {
                return NextResponse.json({ message: "رابط الفيديو غير صالح." }, { status: 400 });
            }
            const videoResponse = await youtube.videos.list({
                part: ['snippet', 'contentDetails', 'statistics'],
                id: [videoId],
            });
            const videoData = videoResponse.data.items?.[0];
            if (videoData) {
                return NextResponse.json({ videoInfo: {
                    title: videoData.snippet?.title,
                    description: videoData.snippet?.description,
                    durationInSeconds: videoData.contentDetails?.duration ? parseISO8601Duration(videoData.contentDetails.duration) : 0,
                    viewCount: videoData.statistics?.viewCount ? parseInt(videoData.statistics.viewCount, 10) : 0,
                }});
            } else {
                return NextResponse.json({ message: "لم يتم العثور على الفيديو." }, { status: 404 });
            }
        }

        const channelId = await getChannelIdFromUrl(url, youtube);
        
        if (!channelId) {
             return NextResponse.json({ message: "لم يتم العثور على قناة صالحة في الرابط." }, { status: 400 });
        }
        
        // If the only goal is to fetch channel info for the form
        if (fetchChannelInfo) {
            const channelResponse = await youtube.channels.list({
                part: ['snippet'],
                id: [channelId]
            });
            const channelData = channelResponse.data.items?.[0];
            if (channelData?.snippet) {
                return NextResponse.json({ channelInfo: {
                    name: channelData.snippet.title,
                    description: channelData.snippet.description,
                    imageUrl: channelData.snippet.thumbnails?.high?.url || channelData.snippet.thumbnails?.default?.url,
                }});
            } else {
                 return NextResponse.json({ message: "لم يتم العثور على معلومات القناة." }, { status: 404 });
            }
        }


        // --- Default behavior: Fetch videos and playlists ---

        let allVideos: any[] = [];
        let allPlaylists: any[] = [];

        const playlistIdFromUrl = getPlaylistIdFromUrl(url);

        if (playlistIdFromUrl) {
            // It's a playlist URL, fetch its videos
            allVideos = await fetchPlaylistVideos(youtube, playlistIdFromUrl);
        } else {
            // It's a channel URL, fetch uploads and playlists
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
                viewCount: item.statistics?.viewCount ? parseInt(item.statistics.viewCount, 10) : 0,
            };

            // Heuristic to detect shorts, can be adjusted
            if (durationInSeconds > 0 && durationInSeconds <= 90 && (item.snippet?.title?.includes('#shorts') || item.snippet?.description?.includes('#shorts'))) {
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
