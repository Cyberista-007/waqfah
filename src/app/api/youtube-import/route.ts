
import { NextRequest, NextResponse } from 'next/server';
import { google, youtube_v3 } from 'googleapis';
import { z } from 'zod';
import play from 'play-dl';

const youtubeImportSchema = z.object({
  url: z.string().url("الرجاء إدخال رابط صحيح."),
  fetchChannelInfo: z.boolean().optional(),
  fetchVideoInfo: z.boolean().optional(),
  getFormats: z.boolean().optional(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
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
        return NextResponse.json({ message: "مفتاح واجهة برمجة تطبيقات يوتيوب غير موجود. لتفعيل هذه الميزة، يرجى اتباع التعليمات في ملف 'docs/youtube-api-key.md' لإضافة المفتاح إلى مشروعك." }, { status: 500, headers: corsHeaders });
    }

    try {
        const body = await req.json();

        if (body.url && typeof body.url === 'string' && !/^https?:\/\//i.test(body.url)) {
            body.url = 'https://' + body.url;
        }
        
        const validation = youtubeImportSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400, headers: corsHeaders });
        }
        
        const { url, fetchChannelInfo, fetchVideoInfo, getFormats } = validation.data;
        const videoIdForInfo = getVideoIdFromUrl(url);

        const youtube = google.youtube({
            version: 'v3',
            auth: apiKey,
        });
        
        if (getFormats) {
            if (!videoIdForInfo) {
                return NextResponse.json({ message: "رابط الفيديو غير صالح." }, { status: 400, headers: corsHeaders });
            }
             try {
                const cleanUrl = `https://www.youtube.com/watch?v=${videoIdForInfo}`;
                await play.setToken({ youtube: { cookie: process.env.YOUTUBE_COOKIE || '' } });
                const info = await play.video_info(cleanUrl, { htmldata: false });
                
                const videoFormats = info.format.filter(f => f.qualityLabel && f.audio_channels && f.audio_channels > 0).map(f => ({ itag: f.itag, qualityLabel: f.qualityLabel, container: f.mimeType?.includes('webm') ? 'webm' : 'mp4', contentLength: f.content_length, type: 'video' }));
                const audioFormats = info.format.filter(f => f.mimeType?.startsWith('audio/') && !f.video_channels).map(f => ({ itag: f.itag, qualityLabel: null, container: f.mimeType?.includes('webm') ? 'weba' : 'm4a', contentLength: f.content_length, type: 'audio' }));
                
                const combinedFormats = [...videoFormats, ...audioFormats].filter(f => f.itag);

                return NextResponse.json({ formats: combinedFormats }, { headers: corsHeaders });
            } catch (error: any) {
                 console.error("play-dl Error:", error);
                 const errorMessage = (error.message || '').toLowerCase();
                 let description: string;
                 if (errorMessage.includes("sign in")) {
                    description = "يوتيوب يطلب التحقق. قد يحدث هذا بسبب كثرة الطلبات. حاول مرة أخرى بعد فترة.";
                 } else if (errorMessage.includes('private')) {
                     description = 'هذا الفيديو خاص ولا يمكن تحميله.';
                 } else if (errorMessage.includes('age-restricted')) {
                     description = 'هذا الفيديو محمي بقيود عمرية ويتطلب تسجيل الدخول.';
                 } else {
                    description = 'حدث خطأ غير متوقع أثناء التواصل مع يوتيوب. قد يكون الفيديو مقيدًا.';
                 }
                 return NextResponse.json({ message: "فشل في جلب صيغ التنزيل", description }, { status: 500, headers: corsHeaders });
            }
        }
        
        if (fetchVideoInfo) {
            if (!videoIdForInfo) return NextResponse.json({ message: "رابط الفيديو غير صالح." }, { status: 400, headers: corsHeaders });
            const videoResponse = await youtube.videos.list({ part: ['snippet', 'contentDetails', 'statistics'], id: [videoIdForInfo] });
            const videoData = videoResponse.data.items?.[0];
            if (videoData) {
                return NextResponse.json({ videoInfo: { title: videoData.snippet?.title, description: videoData.snippet?.description, durationInSeconds: videoData.contentDetails?.duration ? parseISO8601Duration(videoData.contentDetails.duration) : 0, viewCount: videoData.statistics?.viewCount ? parseInt(videoData.statistics.viewCount, 10) : 0, publishedAt: videoData.snippet?.publishedAt } }, { headers: corsHeaders });
            } else {
                return NextResponse.json({ message: "لم يتم العثور على الفيديو." }, { status: 404, headers: corsHeaders });
            }
        }

        if (fetchChannelInfo) {
            const searchResults = await play.search(url, { limit: 1, source: { youtube: 'channel' } });
            const channelData = searchResults[0];
            if (channelData) {
                return NextResponse.json({ channelInfo: { name: channelData.title, description: channelData.description || '', imageUrl: channelData.thumbnails?.[0]?.url, bannerUrl: (channelData as any).banner?.[0]?.url } }, { headers: corsHeaders });
            } else {
                return NextResponse.json({ message: "لم يتم العثور على معلومات القناة." }, { status: 404, headers: corsHeaders });
            }
        }

        // --- Default behavior: Fetch videos and playlists ---
        let info; // playlist_info result
        let channelIdForPlaylists: string | undefined = undefined;

        if (url.includes('playlist?list=')) {
            info = await play.playlist_info(url, { incomplete: true });
            channelIdForPlaylists = info.channel?.id;
        } else {
            // It's likely a channel URL. Search for it, get uploads playlist.
            const searchResults = await play.search(url, { limit: 1, source: { youtube: 'channel' } });
            const channel = searchResults?.[0];
            if (channel?.id) {
                channelIdForPlaylists = channel.id;
                const uploadsPlaylistId = channel.id.replace(/^UC/, 'UU');
                const playlistUrl = `https://www.youtube.com/playlist?list=${uploadsPlaylistId}`;
                info = await play.playlist_info(playlistUrl, { incomplete: true });
            }
        }
        
        if (!info) {
             return NextResponse.json({ message: "لم نتمكن من جلب البيانات. قد يكون الرابط غير صحيح أو القناة لا تحتوي على فيديوهات." }, { status: 404, headers: corsHeaders });
        }
        
        const all_videos = await info.all_videos();
        const videoIds = all_videos.map(v => v.id).filter((id): id is string => !!id);

        if (videoIds.length === 0) {
             return NextResponse.json({ videos: [], shorts: [], playlists: [] }, { headers: corsHeaders });
        }
        
        let allVideosDetails: youtube_v3.Schema$Video[] = [];
        for (let i = 0; i < videoIds.length; i += 50) {
            const chunk = videoIds.slice(i, i + 50);
            const videoDetailsResponse = await youtube.videos.list({ part: ['snippet', 'contentDetails', 'statistics'], id: chunk });
            if (videoDetailsResponse.data.items) {
                allVideosDetails.push(...videoDetailsResponse.data.items);
            }
        }
        
        const videos: any[] = [];
        const shorts: any[] = [];
        allVideosDetails.forEach(item => {
            const durationInSeconds = item.contentDetails?.duration ? parseISO8601Duration(item.contentDetails.duration) : 0;
            const videoData = { videoId: item.id, title: item.snippet?.title || 'بدون عنوان', description: item.snippet?.description || '', durationInSeconds, viewCount: item.statistics?.viewCount ? parseInt(item.statistics.viewCount, 10) : 0, publishedAt: item.snippet?.publishedAt };
            if (durationInSeconds > 0 && durationInSeconds <= 180) {
                shorts.push(videoData);
            } else {
                videos.push(videoData);
            }
        });

        let formattedPlaylists: any[] = [];
        if (channelIdForPlaylists) {
            let nextPageToken: string | undefined = undefined;
            do {
                const playlistsResponse = await youtube.playlists.list({ part: ['snippet', 'contentDetails'], channelId: channelIdForPlaylists, maxResults: 50, pageToken: nextPageToken });
                if (playlistsResponse.data.items) {
                    formattedPlaylists.push(...playlistsResponse.data.items.map(item => ({ id: item.id, title: item.snippet?.title, description: item.snippet?.description || '', videoCount: item.contentDetails?.itemCount })));
                }
                nextPageToken = playlistsResponse.data.nextPageToken || undefined;
            } while (nextPageToken);
        }
        
        return NextResponse.json({ videos, shorts, playlists: formattedPlaylists }, { headers: corsHeaders });

    } catch (error: any) {
        console.error("YouTube Import API Error:", error);
        let message = "حدث خطأ غير متوقع أثناء الاتصال بواجهة يوتيوب.";
        if (error.message) {
            if (error.message.includes('404')) message = "لم يتم العثور على القناة أو قائمة التشغيل. يرجى التحقق من الرابط.";
            else if (error.message.toLowerCase().includes('private') || error.message.toLowerCase().includes('unavailable')) message = "هذا المحتوى خاص أو غير متوفر.";
            else if (error.message.toLowerCase().includes('no videos found')) message = "لم يتم العثور على فيديوهات في هذا الرابط.";
            else message = "فشل جلب البيانات. حاول مرة أخرى أو تأكد من صحة الرابط.";
        }
        return NextResponse.json({ message }, { status: 500, headers: corsHeaders });
    }
}
