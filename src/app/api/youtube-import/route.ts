
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { z } from 'zod';
import { parse } from 'iso8601-duration';

const youtubeImportSchema = z.object({
  playlistUrl: z.string().url("الرجاء إدخال رابط صحيح."),
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

        const playlistId = getPlaylistIdFromUrl(validation.data.playlistUrl);

        if (!playlistId) {
            return NextResponse.json({ message: "لم يتم العثور على معرف قائمة التشغيل في الرابط." }, { status: 400 });
        }

        const youtube = google.youtube({
            version: 'v3',
            auth: apiKey,
        });

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
        return NextResponse.json({ message: error.message || "حدث خطأ غير متوقع أثناء الاتصال بواجهة يوتيوب." }, { status: 500 });
    }
}
