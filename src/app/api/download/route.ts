
import { NextRequest, NextResponse } from 'next/server';
import play from 'play-dl';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const itag = searchParams.get('itag');
    const title = searchParams.get('title') || 'video';
    const container = searchParams.get('container') || 'mp4';

    if (!videoId || !itag) {
        return new NextResponse('Missing videoId or itag', { status: 400 });
    }

    try {
        const itagNum = parseInt(itag, 10);
        
        // Attempt to use cookie if available to bypass throttling
        await play.setToken({ youtube: { cookie: process.env.YOUTUBE_COOKIE || '' } });

        const streamData = await play.stream(`https://www.youtube.com/watch?v=${videoId}`, {
            quality: itagNum,
        });

        const headers = new Headers();
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.${container}"`);
        headers.set('Content-Type', streamData.type);
        if (streamData.content_length) {
            headers.set('Content-Length', streamData.content_length);
        }

        // The 'as any' is a concession to the potential type mismatch between Node.js and Web streams.
        // In modern Node/Next.js environments, this often works out of the box.
        return new NextResponse(streamData.stream as any, { status: 200, headers });

    } catch (error: any) {
        console.error('Download stream error:', error);
        // Provide a more structured error response
        const errorBody = {
            message: 'Failed to stream video.',
            error: error.message || 'Unknown error',
        };
        return new NextResponse(JSON.stringify(errorBody), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
