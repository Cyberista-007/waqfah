import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawText = searchParams.get('text');

    if (!rawText || !rawText.trim()) {
      return new Response('Missing or empty text parameter', { status: 400 });
    }

    // Google Translate TTS accepts max ~200 characters per segment
    const text = rawText.trim().slice(0, 250);

    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodeURIComponent(text)}`;

    const res = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!res.ok) {
      return new Response(`Failed to fetch from Google Translate: ${res.statusText}`, { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('[tts API error]', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}


// ترغب في تحويله إلى تطبيق أندرويد حقيقي (باستخدام Capacitor لإنتاج ملف APK لمتجر جوجل بلاي)، يمكنني البدء معك في خطوات التثبيت والإعداد وتجهيز البيئة لإنشاء التطبيق فورًا
