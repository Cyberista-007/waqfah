
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');
    const title = searchParams.get('title') || 'video';
    const container = searchParams.get('container') || 'mp4';

    if (!videoUrl) {
        return new NextResponse('Missing video URL', { status: 400 });
    }

    try {
        // Use native fetch in Next.js 13+ Edge/Node runtimes
        const response = await fetch(videoUrl);

        if (!response.ok) {
            // Passthrough Youtube's error if possible
            const errorBody = await response.text();
            console.error(`Upstream fetch error: ${response.status}`, errorBody);
            return new NextResponse(errorBody || response.statusText, { status: response.status });
        }
        
        // We can stream the response body directly to the client.
        const readableStream = response.body;

        const headers = new Headers();
        // This header is crucial for forcing the browser to download the file.
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.${container}"`);
        
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
            headers.set('Content-Type', contentType);
        }

        const contentLength = response.headers.get('Content-Length');
        if (contentLength) {
            headers.set('Content-Length', contentLength);
        }

        return new NextResponse(readableStream, { status: 200, headers });

    } catch (error: any) {
        console.error('Download proxy error:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}
