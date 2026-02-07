
import { NextRequest, NextResponse } from 'next/server';
import play from 'play-dl';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');
  const itag = searchParams.get('itag');
  const title = searchParams.get('title') || 'video';
  const container = searchParams.get('container') || 'mp4';

  if (!videoUrl || !itag) {
    return new NextResponse('Missing video URL or itag', { status: 400 });
  }

  try {
    const stream = await play.stream(videoUrl, {
      quality: parseInt(itag, 10),
    });

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', stream.type);
    if (stream.content_length) {
        responseHeaders.set('Content-Length', stream.content_length);
    }
    responseHeaders.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(title)}.${container}"`
    );

    // Create a new ReadableStream from the Node.js stream
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream.stream) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[Download API] Error streaming video:`, error);
    return new NextResponse(JSON.stringify({ message: 'Failed to stream video', error: (error as Error).message }), { status: 500 });
  }
}
