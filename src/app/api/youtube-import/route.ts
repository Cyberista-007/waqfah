
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
        let fullUrl = url;
        // Ensure the URL has a protocol for the URL constructor to work reliably.
        if (!/^https?:\/\//i.test(fullUrl)) {
            fullUrl = 'https://' + fullUrl;
        }
        
        // 1. Check if it's a video URL first.
        const videoId = getVideoIdFromUrl(fullUrl);
        if (videoId) {
            const { data } = await youtube.videos.list({ part: ['snippet'], id: [videoId] });
            if (data.items && data.items.length > 0) {
              return data.items[0]?.snippet?.channelId || null;
            }
        }

        const parsedUrl = new URL(fullUrl);
        const pathParts = parsedUrl.pathname.split('/').filter(p => p);

        if (pathParts.length === 0) return null;
        
        // Handle modern @handle format
        const handleMatch = pathParts.find(part => part.startsWith('@'));
        if (handleMatch) {
            const handle = handleMatch.substring(1);
            const { data } = await youtube.channels.list({ part: ['id'], forHandle: handle });
            return data.items?.[0]?.id || null;
        }

        // Handle /channel/UC... format
        if (pathParts[0] === 'channel' && pathParts[1]) {
            return pathParts[1];
        }

        // Handle /user/username format
        if (pathParts[0] === 'user' && pathParts[1]) {
            const { data } = await youtube.channels.list({ part: ['id'], forUsername: pathParts[1] });
            return data.items?.[0]?.id || null;
        }
        
        // Final attempt for vanity URLs like /c/channelname which is deprecated
        if(pathParts[0] === 'c' && pathParts[1]) {
           const { data } = await youtube.search.list({ part: ['snippet'], q: pathParts[1], type: ['channel'], maxResults: 1 });
           return data.items?.[0]?.snippet?.channelId || null;
        }
        
        // If none of the above match, it might be an old vanity URL that is the whole path
        if (pathParts.length === 1 && !pathParts[0].startsWith('@')) {
           const { data } = await youtube.search.list({ part: ['snippet'], q: pathParts[0], type: ['channel'], maxResults: 1 });
           return data.items?.[0]?.snippet?.channelId || null;
        }

        return null;

    } catch (error) {
        console.error("Error parsing channel/video URL to get Channel ID:", error);
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
        return NextResponse.json({ message: "مفتاح واجهة برمجة تطبيقات يوتيوب غير موجود. لتفعيل هذه الميزة، يرجى اتباع التعليمات في ملف 'docs/youtube-api-key.md' لإضافة المفتاح إلى مشروعك." }, { status: 500, headers: corsHeaders });
    }

    try {
        const body = await req.json();

        // Prepend protocol if missing before validation
        if (body.url && typeof body.url === 'string' && !/^https?:\/\//i.test(body.url)) {
            body.url = 'https://' + body.url;
        }
        
        const validation = youtubeImportSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400, headers: corsHeaders });
        }
        
        const { url, fetchChannelInfo, fetchVideoInfo, getFormats } = validation.data;
        const videoId = getVideoIdFromUrl(url);

        const youtube = google.youtube({
            version: 'v3',
            auth: apiKey,
        });
        
        // Handle fetching download formats
        if (getFormats) {
            if (!videoId) {
                return NextResponse.json({ message: "رابط الفيديو غير صالح." }, { status: 400, headers: corsHeaders });
            }
             try {
                // play-dl can be picky, so we ensure a clean URL
                const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
                // This tells play-dl to act more like a web browser to avoid getting blocked.
                await play.setToken({ youtube: { cookie: process.env.YOUTUBE_COOKIE || '' } });
                const info = await play.video_info(cleanUrl, { htmldata: false });
                
                 // Progressive formats (video + audio)
                const videoFormats = info.format
                    .filter(f => f.qualityLabel && f.audio_channels && f.audio_channels > 0)
                    .map(f => ({
                        itag: f.itag,
                        qualityLabel: f.qualityLabel,
                        container: f.mimeType?.includes('webm') ? 'webm' : 'mp4',
                        contentLength: f.content_length,
                        type: 'video'
                    }));

                // Audio-only formats
                const audioFormats = info.format
                     .filter(f => f.mimeType?.startsWith('audio/') && !f.video_channels)
                     .map(f => ({
                        itag: f.itag,
                        qualityLabel: null, // no video
                        container: f.mimeType?.includes('webm') ? 'weba' : 'm4a',
                        contentLength: f.content_length,
                        type: 'audio'
                    }));
                
                const combinedFormats = [...videoFormats, ...audioFormats].filter(f => f.itag);


                return NextResponse.json({ formats: combinedFormats }, { headers: corsHeaders });
            } catch (error: any) {
                 console.error("play-dl Error:", error);
                 const errorMessage = (error.message || '').toLowerCase();
                 let description: string;
                 
                if (errorMessage.includes("sign in to confirm you're not a bot")) {
                    description = "يوتيوب يطلب التحقق من أنك لست روبوتًا. هذا يحدث أحيانًا بسبب كثرة الطلبات. يرجى المحاولة مرة أخرى بعد فترة قصيرة.";
                } else if (errorMessage.includes('could not extract signature decipher') || errorMessage.includes('could not extract functions')) {
                   description = 'فشل تحليل بيانات الفيديو من يوتيوب. قد يكون هذا بسبب تغييرات في منصة يوتيوب أو أن الفيديو مقيد. يرجى المحاولة مرة أخرى لاحقًا.';
                } else if (errorMessage.includes('private')) {
                     description = 'هذا الفيديو خاص ولا يمكن تحميله.';
                 } else if (errorMessage.includes('age-restricted') || errorMessage.includes('login required')) {
                     description = 'هذا الفيديو محمي بقيود عمرية ويتطلب تسجيل الدخول، لذا لا يمكن تحميله.';
                 } else if (errorMessage.includes('unavailable')) {
                    description = 'هذا الفيديو غير متاح حاليًا.';
                 } else if (error.message) {
                    description = error.message;
                 }
                 else {
                    description = 'حدث خطأ غير متوقع أثناء التواصل مع يوتيوب. قد يكون الفيديو مقيدًا أو غير متاح للتحميل المباشر.';
                 }
            
                 return NextResponse.json({ message: "فشل في جلب صيغ التنزيل", description }, { status: 500, headers: corsHeaders });
            }
        }
        
        // Handle single video info fetch
        if (fetchVideoInfo) {
            if (!videoId) {
                return NextResponse.json({ message: "رابط الفيديو غير صالح." }, { status: 400, headers: corsHeaders });
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
                    publishedAt: videoData.snippet?.publishedAt,
                }}, { headers: corsHeaders });
            } else {
                return NextResponse.json({ message: "لم يتم العثور على الفيديو." }, { status: 404, headers: corsHeaders });
            }
        }

        // If the only goal is to fetch channel info for the form
        if (fetchChannelInfo) {
            const channelId = await getChannelIdFromUrl(url, youtube);
            if (!channelId) {
                 return NextResponse.json({ message: "لم يتم العثور على قناة صالحة في الرابط." }, { status: 400, headers: corsHeaders });
            }
            const channelResponse = await youtube.channels.list({
                part: ['snippet', 'brandingSettings'],
                id: [channelId]
            });
            const channelData = channelResponse.data.items?.[0];
            if (channelData?.snippet) {
                return NextResponse.json({ channelInfo: {
                    name: channelData.snippet.title,
                    description: channelData.snippet.description,
                    imageUrl: channelData.snippet.thumbnails?.high?.url || channelData.snippet.thumbnails?.default?.url,
                    bannerUrl: channelData.brandingSettings?.image?.bannerExternalUrl,
                }}, { headers: corsHeaders });
            } else {
                 return NextResponse.json({ message: "لم يتم العثور على معلومات القناة." }, { status: 404, headers: corsHeaders });
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
            const channelId = await getChannelIdFromUrl(url, youtube);
            if (!channelId) {
                 return NextResponse.json({ message: "لم يتم العثور على قناة صالحة في الرابط." }, { status: 400, headers: corsHeaders });
            }

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
                publishedAt: item.snippet?.publishedAt,
            };

            // Heuristic to detect shorts, can be adjusted.
            // A video is considered a "short" for import purposes if it is 180 seconds or less.
            if (durationInSeconds > 0 && durationInSeconds <= 180) {
                shorts.push(videoData);
            } else {
                videos.push(videoData);
            }
        });
        
        const formattedPlaylists = allPlaylists.map(item => ({
            id: item.id,
            title: item.snippet?.title,
            description: item.snippet?.description || '',
            videoCount: item.contentDetails?.itemCount,
        }));
        
        return NextResponse.json({ videos, shorts, playlists: formattedPlaylists }, { headers: corsHeaders });

    } catch (error: any) {
        console.error("YouTube API Error:", error);
        if (error.code === 403) {
             return NextResponse.json({ message: "تم رفض الطلب من قبل يوتيوب. تحقق من أن مفتاح الـ API صحيح، وأنه غير مقيد، وأن 'YouTube Data API v3' مُفعَّلة في مشروع Google Cloud." }, { status: 403, headers: corsHeaders });
        }
        if (error.code === 404) {
             return NextResponse.json({ message: "لم يتم العثور على القناة أو قائمة التشغيل." }, { status: 404, headers: corsHeaders });
        }
        return NextResponse.json({ message: error.message || "حدث خطأ غير متوقع أثناء الاتصال بواجهة يوتيوب." }, { status: 500, headers: corsHeaders });
    }
}
