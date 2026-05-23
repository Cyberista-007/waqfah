import { NextRequest, NextResponse } from 'next/server';
import play from 'play-dl';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const itag = searchParams.get('itag');
    const title = searchParams.get('title') || 'video';
    const container = searchParams.get('container') || 'mp4';

    if (!videoId || !itag || !videoId.trim()) {
        return new NextResponse('Missing videoId or itag', { status: 400 });
    }

    try {
        let cleanVideoId = videoId.trim();
        
        // Comprehensive Regex for YouTube IDs
        const idRegex = /(?:v=|\/|embed\/|youtu\.be\/|\/v\/|\/e\/|watch\?v=|&v=)([0-9A-Za-z_-]{11})/;
        const match = cleanVideoId.match(idRegex);
        if (match) {
            cleanVideoId = match[1];
        }

        const videoUrl = `https://www.youtube.com/watch?v=${cleanVideoId}`;
        const itagNum = parseInt(itag, 10);

        // Validate the URL via play-dl
        const validation = await play.validate(videoUrl);
        if (validation !== 'yt_video') {
             return NextResponse.json({
                message: 'رابط يوتيوب غير صالح من وجهة نظر المحرك.',
                error: `Validation failed: ${validation} (URL: ${videoUrl})`,
            }, { status: 400 });
        }

        // Only set token if cookie is actually provided
        if (process.env.YOUTUBE_COOKIE) {
            await play.setToken({ youtube: { cookie: process.env.YOUTUBE_COOKIE } });
        }

        console.log(`[Download] Validating video info for: ${videoUrl}`);
        const videoInfo = await play.video_info(videoUrl).catch(e => {
            console.error('[play-dl video_info error]:', e);
            throw new Error(`فشل في التعرف على الفيديو (خطأ من يوتيوب: ${e.message})`);
        });

        console.log(`[Download] Starting stream for itag ${itagNum}`);
        const streamData = await play.stream(videoUrl, {
            quality: itagNum,
        });

        if (!streamData || !streamData.stream) {
            throw new Error('فشل في جلب تيار البيانات (No Stream Found)');
        }

        const headers = new Headers();
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.${container}"`);
        headers.set('Content-Type', streamData.type || 'video/mp4');
        headers.set('Accept-Ranges', 'bytes');
        
        if ((streamData as any).content_length) {
            headers.set('Content-Length', (streamData as any).content_length.toString());
        }

        return new NextResponse(streamData.stream as any, { 
            status: 200, 
            headers 
        });

    } catch (error: any) {
        console.error('[Download API Error]:', error);
        
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const errorMessage = (error.message || '').toLowerCase();
        let message = 'فشل في تشغيل الفيديو أو تحميله.';
        let detailedError = `${error.message || 'Unknown error'} (URL: ${videoUrl})`;

        if (errorMessage.includes("sign in")) {
            message = "يوتيوب يطلب تسجيل الدخول. (هذا الفيديو يتطلب برمجياً إضافة YOUTUBE_COOKIE لملف .env)";
        } else if (errorMessage.includes("forbidden") || error.status === 403) {
            message = "يوتيوب حظر الطلب مؤقتاً بالـ IP الحالي. يرجى إضافة YOUTUBE_COOKIE لملف .env لتجاوز هذا.";
        } else if (errorMessage.includes("private")) {
             message = "هذا الفيديو خاص ولا يمكن الوصول إليه.";
        } else if (errorMessage.includes("not found")) {
             message = "لم يتم العثور على الفيديو أو الجودة المطلوبة.";
        } else if (errorMessage.includes("invalid url")) {
             message = `رابط غير صالح للجلب. (تأكد من الـ ID للرابط: ${videoId})`;
        }

        return NextResponse.json({
            message,
            error: detailedError,
        }, { status: 500 });
    }
}
