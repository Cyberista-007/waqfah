
import { NextRequest, NextResponse } from 'next/server';
import { google, youtube_v3 } from 'googleapis';
import { z } from 'zod';
import play from 'play-dl';
import { YoutubeTranscript } from 'youtube-transcript';
import { getVideoIdFromUrl } from '@/lib/utils';

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

function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    return (hours * 3600) + (minutes * 60) + seconds;
}

async function getChannelIdFromUrl(url: string, youtube: youtube_v3.Youtube): Promise<string | null> {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;

        // Case 1: Video URL -> extract channelId from video details
        const videoId = getVideoIdFromUrl(url);
        if (videoId) {
            const videoResponse = await youtube.videos.list({ part: ['snippet'], id: [videoId] });
            if (videoResponse.data.items?.[0]?.snippet?.channelId) {
                return videoResponse.data.items[0].snippet.channelId;
            }
        }

        // Case 2: Playlist URL -> extract channelId from playlist details
        const playlistId = urlObj.searchParams.get('list');
        if (playlistId) {
            const playlistResponse = await youtube.playlists.list({ part: ['snippet'], id: [playlistId] });
            if (playlistResponse.data.items?.[0]?.snippet?.channelId) {
                return playlistResponse.data.items[0].snippet.channelId;
            }
        }

        // Case 3: Direct channel ID URL (e.g., /channel/UC...)
        if (pathname.startsWith('/channel/')) {
            const channelId = pathname.split('/channel/')[1].split('/')[0];
            if (channelId) return channelId;
        }

        // Case 4 (Fallback): Handle, legacy, or custom URL (e.g., /@handle, /c/name, /user/name, /name)
        const pathParts = pathname.split('/').filter(p => p && p !== 'c' && p !== 'user');
        if (pathParts.length > 0) {
            let potentialName = pathParts[pathParts.length - 1];
            // The search API works better without the '@'
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
                return searchResponse.data.items[0].id.channelId;
            }
        }
    } catch (e) {
        console.error("Error parsing URL to get channel ID:", e);
    }
    return null;
}


export async function POST(req: NextRequest) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ message: "مفتاح واجهة برمجة تطبيقات يوتيوب غير موجود. لتفعيل هذه الميزة، يرجى اتباع التعليمات في ملف 'docs/youtube-api-key.md' لإضافة المفتاح إلى مشروعك." }, { status: 500, headers: corsHeaders });
    }

    // Use cookie to bypass potential throttling/blocking on play-dl
    if (process.env.YOUTUBE_COOKIE) {
        await play.setToken({ youtube: { cookie: process.env.YOUTUBE_COOKIE } });
    }

    try {
        const body = await req.json();

        if (body.url && typeof body.url === 'string') {
            if (!/^https?:\/\//i.test(body.url)) {
                body.url = 'https://' + body.url;
            }
        }
        
        const validation = youtubeImportSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400, headers: corsHeaders });
        }
        
        const { url, fetchVideoInfo, getFormats } = validation.data;
        
        const youtube = google.youtube({
            version: 'v3',
            auth: apiKey,
        });
        
        if (getFormats) {
            const videoIdForInfo = getVideoIdFromUrl(url);
            if (!videoIdForInfo) {
                return NextResponse.json({ message: "رابط الفيديو غير صالح." }, { status: 400, headers: corsHeaders });
            }
             try {
                const cleanUrl = `https://www.youtube.com/watch?v=${videoIdForInfo}`;
                const info = await play.video_info(cleanUrl, { htmldata: false });
                
                // Get all video formats
                const videoFormats = info.format
                    .filter(f => f.qualityLabel)
                    .map(f => ({
                        itag: f.itag,
                        qualityLabel: f.qualityLabel,
                        container: f.mimeType?.includes('webm') ? 'webm' : 'mp4',
                        contentLength: f.contentLength,
                        type: 'video',
                        hasAudio: !!(f.audioChannels && f.audioChannels > 0)
                    }));

                // Get all audio formats
                const audioFormats = info.format
                    .filter(f => f.mimeType?.startsWith('audio/') && !f.qualityLabel)
                    .map(f => ({
                        itag: f.itag,
                        qualityLabel: null,
                        container: f.mimeType?.includes('webm') ? 'weba' : 'm4a',
                        contentLength: f.contentLength,
                        type: 'audio',
                        hasAudio: true
                    }));
                
                // Sort videos by quality, prioritizing muxed (with audio)
                const sortedVideoFormats = videoFormats.sort((a, b) => {
                    const qA = parseInt(a.qualityLabel || '0');
                    const qB = parseInt(b.qualityLabel || '0');
                    if (qB !== qA) return qB - qA;
                    // If same quality, put muxed first
                    return (b.hasAudio ? 1 : 0) - (a.hasAudio ? 1 : 0);
                });

                const combinedFormats = [...sortedVideoFormats, ...audioFormats].filter(f => f.itag);

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
            const videoIdForInfo = getVideoIdFromUrl(url);
            if (!videoIdForInfo) return NextResponse.json({ message: "رابط الفيديو غير صالح." }, { status: 400, headers: corsHeaders });
            const videoResponse = await youtube.videos.list({ part: ['snippet', 'contentDetails', 'statistics'], id: [videoIdForInfo] });
            const videoData = videoResponse.data.items?.[0];
            if (videoData) {
                let transcript: any[] = [];
                try {
                    const ytTranscriptRaw = await YoutubeTranscript.fetchTranscript(videoIdForInfo, { lang: 'ar' });
                    // Map to our generic format: { text: string, timestamp: number }
                    transcript = ytTranscriptRaw.map(item => ({
                        text: item.text,
                        timestamp: Math.floor(item.offset / 1000)
                    }));
                } catch (tError) {
                    console.log(`No Arabic transcript found or failed to fetch transcript for video: ${videoIdForInfo}`, tError);
                    // Try without lang constraint if Arabic fails
                    try {
                        const fallBackRefRaw = await YoutubeTranscript.fetchTranscript(videoIdForInfo);
                        transcript = fallBackRefRaw.map(item => ({
                            text: item.text,
                            timestamp: Math.floor(item.offset / 1000)
                        }));
                    } catch (e) {
                         console.log(`Failed to fetch any transcript for video: ${videoIdForInfo}`);
                    }
                }

                return NextResponse.json({ videoInfo: { 
                    title: videoData.snippet?.title, 
                    description: videoData.snippet?.description, 
                    durationInSeconds: videoData.contentDetails?.duration ? parseISO8601Duration(videoData.contentDetails.duration) : 0, 
                    viewCount: videoData.statistics?.viewCount ? parseInt(videoData.statistics.viewCount, 10) : 0, 
                    publishedAt: videoData.snippet?.publishedAt,
                    channelId: videoData.snippet?.channelId,
                    channelTitle: videoData.snippet?.channelTitle,
                    transcript: transcript
                } }, { headers: corsHeaders });
            } else {
                return NextResponse.json({ message: "لم يتم العثور على الفيديو." }, { status: 404, headers: corsHeaders });
            }
        }

        // --- UNIFIED MAIN FLOW ---
        // 1. Get Channel ID robustly from any URL type
        const channelId = await getChannelIdFromUrl(url, youtube);

        if (!channelId) {
            return NextResponse.json({ message: "لم نتمكن من تحديد القناة من الرابط المقدم. يرجى التأكد من أن الرابط صحيح." }, { status: 404, headers: corsHeaders });
        }

        // 2. Fetch Channel Info, Uploads Playlist ID, and other playlists
        let channelInfo: any = null;
        let uploadsPlaylistId: string | undefined = undefined;
        let formattedPlaylists: any[] = [];

        const channelResponse = await youtube.channels.list({
            part: ['snippet', 'contentDetails', 'brandingSettings'],
            id: [channelId],
        });
        const channelAPIData = channelResponse.data.items?.[0];

        if (!channelAPIData) {
            return NextResponse.json({ message: "لم يتم العثور على القناة باستخدام المعرف المستخرج." }, { status: 404, headers: corsHeaders });
        }

        channelInfo = {
            id: channelAPIData.id, // Store channel ID for later
            name: channelAPIData.snippet?.title || '',
            description: channelAPIData.snippet?.description || '',
            imageUrl: channelAPIData.snippet?.thumbnails?.high?.url || channelAPIData.snippet?.thumbnails?.default?.url || '',
            bannerUrl: channelAPIData.brandingSettings?.image?.bannerExternalUrl || ''
        };
        uploadsPlaylistId = channelAPIData.contentDetails?.relatedPlaylists?.uploads;

        // Fetch playlists for the channel
        let nextPageToken: string | undefined = undefined;
        do {
            const playlistsResponse: any = await youtube.playlists.list({ part: ['snippet', 'contentDetails'], channelId: channelId, maxResults: 50, pageToken: nextPageToken });
            if (playlistsResponse.data.items) {
                formattedPlaylists.push(...playlistsResponse.data.items.map((item: any) => ({ id: item.id, title: item.snippet?.title, description: item.snippet?.description || '', videoCount: item.contentDetails?.itemCount })));
            }
            nextPageToken = playlistsResponse.data.nextPageToken || undefined;
        } while (nextPageToken);

        // 3. Determine which videos to fetch
        const playlistIdFromUrl = new URL(url).searchParams.get('list');
        const targetPlaylistId = playlistIdFromUrl || uploadsPlaylistId;
        
        let videoIds: string[] = [];
        
        if (targetPlaylistId) { // Fetching a playlist or all channel uploads
            nextPageToken = undefined;
            do {
                const playlistItemsResponse: any = await youtube.playlistItems.list({
                    part: ['contentDetails'],
                    playlistId: targetPlaylistId,
                    maxResults: 50,
                    pageToken: nextPageToken,
                });
                if (playlistItemsResponse.data.items) {
                    videoIds.push(...playlistItemsResponse.data.items
                        .map((item: any) => item.contentDetails?.videoId)
                        .filter((id: any): id is string => !!id)
                    );
                }
                nextPageToken = playlistItemsResponse.data.nextPageToken || undefined;
            } while (nextPageToken);
        } else { // Fallback for single video or channel URL without an uploads playlist
            const videoIdFromUrl = getVideoIdFromUrl(url);
            if (videoIdFromUrl) {
                videoIds.push(videoIdFromUrl);
            }
        }
        
        // 4. Handle cases with no videos found
        if (videoIds.length === 0) {
             return NextResponse.json({ channelInfo, videos: [], shorts: [], playlists: formattedPlaylists }, { headers: corsHeaders });
        }
        
        // 5. Fetch details for all collected video IDs
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
            const videoData = { 
                videoId: item.id, 
                title: item.snippet?.title || 'بدون عنوان', 
                description: item.snippet?.description || '', 
                durationInSeconds, 
                viewCount: item.statistics?.viewCount ? parseInt(item.statistics.viewCount, 10) : 0, 
                publishedAt: item.snippet?.publishedAt,
                channelId: item.snippet?.channelId,
                channelTitle: item.snippet?.channelTitle
            };
            if (durationInSeconds > 0 && durationInSeconds <= 180) {
                shorts.push(videoData);
            } else {
                videos.push(videoData);
            }
        });

        // 7. Return everything
        return NextResponse.json({ videos, shorts, playlists: formattedPlaylists, channelInfo }, { headers: corsHeaders });

    } catch (error: any) {
        console.error("YouTube Import API Error:", error);
        let message = "فشل جلب البيانات. حاول مرة أخرى أو تأكد من صحة الرابط.";
        if (error.message) {
            if (error.message.includes('404')) message = "لم يتم العثور على القناة أو قائمة التشغيل. يرجى التحقق من الرابط.";
            else if (error.message.toLowerCase().includes('private') || error.message.toLowerCase().includes('unavailable')) message = "هذا المحتوى خاص أو غير متوفر.";
            else if (error.message.toLowerCase().includes('no videos found')) message = "لم يتم العثور على فيديوهات في هذا الرابط.";
            else if (error.response?.data?.error?.message) {
                message = error.response.data.error.message;
            } else {
                message = "فشل جلب البيانات بسبب خطأ في الخادم. قد تكون هناك مشكلة في مفتاح API الخاص بك.";
            }
        }
        return NextResponse.json({ message }, { status: 500, headers: corsHeaders });
    }
}
