import { NextResponse } from 'next/server';
import { getSeriesBySlug, getLecturesBySeries } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/images';
import { getVideoIdFromUrl } from '@/lib/utils';

// Helper to format date to RFC 2822
function getRfcDate(dateInput: any): string {
  if (!dateInput) return new Date().toUTCString();
  if (typeof dateInput.toDate === 'function') {
    return dateInput.toDate().toUTCString();
  }
  if (dateInput.seconds) {
    return new Date(dateInput.seconds * 1000).toUTCString();
  }
  const parsed = new Date(dateInput);
  if (!isNaN(parsed.getTime())) {
    return parsed.toUTCString();
  }
  return new Date().toUTCString();
}

// Helper to format duration in HH:MM:SS
function formatDuration(seconds: number): string {
  if (!seconds) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

// Helper to escape XML special characters
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ seriesSlug: string }> }
) {
  try {
    const { seriesSlug } = await params;
    
    // 1. Fetch series details
    const series = await getSeriesBySlug(seriesSlug);
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    // 2. Fetch lectures in this series
    const lectures = await getLecturesBySeries(series.id);

    // 3. Resolve series image URL
    const placeholder = getPlaceholderImage(series.imageId);
    
    // Resolve first lecture's YouTube video thumbnail if available
    let seriesImageUrl = '';
    if (lectures.length > 0) {
      const firstLecture = lectures[0];
      const videoId = firstLecture.youtubeUrl ? getVideoIdFromUrl(firstLecture.youtubeUrl) : null;
      seriesImageUrl = videoId 
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
        : (placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/1200/675`);
    } else {
      seriesImageUrl = placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/1200/675`;
    }

    // Create absolute URL if needed (podcast apps prefer absolute URLs)
    const host = request.headers.get('host') || 'waqfah.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const siteUrl = `${protocol}://${host}`;
    const podcastFeedUrl = `${siteUrl}/api/podcasts/${seriesSlug}`;

    // 4. Construct RSS XML
    let itemsXml = '';
    
    for (const lecture of lectures) {
      // Audio source must be present to be included in a podcast
      if (!lecture.audioSrc) continue;

      const lecturePlaceholder = getPlaceholderImage(lecture.imageId);
      const lectureVideoId = lecture.youtubeUrl ? getVideoIdFromUrl(lecture.youtubeUrl) : null;
      const lectureImageUrl = lectureVideoId
        ? `https://img.youtube.com/vi/${lectureVideoId}/maxresdefault.jpg`
        : (lecturePlaceholder?.imageUrl || seriesImageUrl);

      const pubDate = getRfcDate(lecture.createdAt);
      const durationStr = formatDuration(lecture.duration);
      const fileLength = lecture.duration ? Math.round(lecture.duration * 16000) : 0; // Estimated 128kbps size in bytes

      itemsXml += `
    <item>
      <title>${escapeXml(lecture.title)}</title>
      <description>${escapeXml(lecture.description || 'لا يوجد وصف للمحاضرة')}</description>
      <link>${escapeXml(`${siteUrl}/lectures/${lecture.slug}`)}</link>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${escapeXml(lecture.audioSrc)}" length="${fileLength}" type="audio/mpeg" />
      <guid isPermaLink="false">${escapeXml(lecture.id)}</guid>
      <itunes:author>${escapeXml(series.programName || 'منصة وقفة العلمية')}</itunes:author>
      <itunes:subtitle>${escapeXml(lecture.title)}</itunes:subtitle>
      <itunes:summary>${escapeXml(lecture.description || 'لا يوجد وصف للمحاضرة')}</itunes:summary>
      <itunes:image href="${escapeXml(lectureImageUrl)}" />
      <itunes:duration>${durationStr}</itunes:duration>
      <itunes:explicit>no</itunes:explicit>
    </item>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <atom:link href="${escapeXml(podcastFeedUrl)}" rel="self" type="application/rss+xml" />
    <title>${escapeXml(series.title)}</title>
    <description>${escapeXml(series.description || 'سلسلة علمية من منصة وقفة')}</description>
    <link>${escapeXml(`${siteUrl}/series/${series.slug}`)}</link>
    <language>ar</language>
    <copyright>جميع الحقوق محفوظة لمنصة وقفة العلمية</copyright>
    <itunes:author>${escapeXml(series.programName || 'منصة وقفة العلمية')}</itunes:author>
    <itunes:subtitle>${escapeXml(series.title)}</itunes:subtitle>
    <itunes:summary>${escapeXml(series.description || 'سلسلة علمية من منصة وقفة')}</itunes:summary>
    <itunes:owner>
      <itunes:name>منصة وقفة العلمية</itunes:name>
      <itunes:email>contact@waqfah.com</itunes:email>
    </itunes:owner>
    <itunes:image href="${escapeXml(seriesImageUrl)}" />
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Islam" />
    </itunes:category>
    <itunes:explicit>no</itunes:explicit>
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });

  } catch (error: any) {
    console.error('Error generating podcast RSS:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
