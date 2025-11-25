
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { z } from 'zod';
import { parse } from 'iso8601-duration';

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
        }

        return channelId;

    } catch (error) {
        console.error("Error parsing channel URL:", error);
        return null;
    }
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

        // If it's not a playlist URL, try to treat it as a channel URL
        if (!playlistId) {
            const channelId = await getChannelIdFromUrl(url, youtube);
            if (channelId) {
                // Every channel has a special "uploads" playlist. 
                // Its ID is the channel ID with 'UC' replaced by 'UU'.
                if (channelId.startsWith('UC')) {
                    playlistId = channelId.replace('UC', 'UU');
                } else {
                     // Fallback for non-standard channel IDs: fetch the channel details
                    const channelResponse = await youtube.channels.list({
                        part: ['contentDetails'],
                        id: [channelId]
                    });
                    playlistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
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
            // Convert ISO 8601 duration to minutes
            duration: item.contentDetails?.duration ? Math.ceil(parse(item.contentDetails.duration).seconds / 60) : 0,
        }));


        return NextResponse.json({ videos: formattedVideos });

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
