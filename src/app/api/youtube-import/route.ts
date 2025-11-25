
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

// Custom function to parse ISO 8601 duration format from YouTube
function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    return (hours * 3600) + (minutes * 60) + seconds;
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

        let playlistId: string | null = getPlaylistIdFromUrl(url);
        let channelDetails: any = null;

        // If it's not a playlist URL, try to treat it as a channel URL
        if (!playlistId) {
            const channelId = await getChannelIdFromUrl(url, youtube);
            if (channelId) {
                 const channelResponse = await youtube.channels.list({
                    part: ['contentDetails', 'snippet'],
                    id: [channelId]
                });
                
                if (channelResponse.data.items && channelResponse.data.items.length > 0) {
                    channelDetails = channelResponse.data.items[0];
                    playlistId = channelDetails.contentDetails?.relatedPlaylists?.uploads || null;
                }
            }
        }
        
        if (!playlistId) {
            return NextResponse.json({ message: "لم يتم العثور على قائمة تشغيل أو قناة صالحة في الرابط." }, { status: 400 });
        }
        
        let allVideos: any[] = [];
        let nextPageToken: string | undefined = undefined;

        // Loop to get all pages of results
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
        

        const formattedVideos = allVideos.map(item => ({
            videoId: item.id,
            title: item.snippet?.title || 'بدون عنوان',
            description: item.snippet?.description || '',
            // Convert ISO 8601 duration to seconds
            durationInSeconds: item.contentDetails?.duration ? parseISO8601Duration(item.contentDetails.duration) : 0,
        }));
        
        const responseData: any = { videos: formattedVideos };
        if (channelDetails) {
            responseData.channelInfo = {
                name: channelDetails.snippet.title,
                description: channelDetails.snippet.description,
                imageUrl: channelDetails.snippet.thumbnails.high?.url || channelDetails.snippet.thumbnails.default?.url,
            };
        }


        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error("YouTube API Error:", error);
        // Provide more specific feedback for common errors
        if (error.code === 403) {
             return NextResponse.json({ message: "تم رفض الطلب من قبل يوتيوب. قد يكون مفتاح الـ API غير صحيح أو مقيد." }, { status: 403 });
        }
        if (error.code === 404) {
             return NextResponse.json({ message: "لم يتم العثور على القناة أو قائمة التشغيل." }, { status: 404 });
        }
        return NextResponse.json({ message: error.message || "حدث خطأ غير متوقع أثناء الاتصال بواجهة يوتيوب." }, { status: 500 });
    }
}
