import { google, youtube_v3 } from 'googleapis';
import { NextRequest } from 'next/server';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { Timestamp as AdminTimestamp, FieldValue } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore as getClientFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  increment as clientIncrement,
  serverTimestamp,
} from 'firebase/firestore';
import { getVideoIdFromUrl } from '@/lib/utils';

export type SyncDb = {
  adminDb: FirebaseFirestore.Firestore | null;
  clientDb: ReturnType<typeof getClientFirestore> | null;
};

export interface SyncVideoCandidate {
  videoId: string;
  channelId?: string;
  title: string;
  description: string;
  publishedAt: string;
}

const WEBSUB_HUB_URL = 'https://pubsubhubbub.appspot.com/subscribe';
const WEBSUB_RENEW_INTERVAL_MS = 4 * 24 * 60 * 60 * 1000; // Renew every 4 days

export function getSyncDb(): SyncDb {
  let adminDb: FirebaseFirestore.Firestore | null = null;
  try {
    adminDb = initializeAdminApp().firestore;
  } catch {
    adminDb = null;
  }

  if (adminDb) {
    return { adminDb, clientDb: null };
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return { adminDb: null, clientDb: getClientFirestore(app) };
}

export function getPublicOrigin(req?: NextRequest): string | null {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  if (req) {
    const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
      return `${proto}://${forwardedHost}`;
    }
  }

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }

  return null;
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .trim();
}

function extractXmlTag(block: string, tagName: string): string {
  const escaped = tagName.replace(':', '\\:');
  const match = block.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)</${escaped}>`, 'i'));
  return match ? decodeXmlEntities(match[1]) : '';
}

/**
 * Parses YouTube RSS/Atom XML (used both by free RSS feeds and WebSub push webhooks).
 */
export function parseYouTubeAtomEntries(xml: string): SyncVideoCandidate[] {
  if (!xml) return [];
  const entries: SyncVideoCandidate[] = [];
  const entryRegex = /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const videoId = extractXmlTag(block, 'yt:videoId');
    const channelId = extractXmlTag(block, 'yt:channelId');
    const title = extractXmlTag(block, 'title');
    const publishedAt = extractXmlTag(block, 'published') || new Date().toISOString();
    const description = extractXmlTag(block, 'media:description');

    if (!videoId || !title) continue;
    if (title === 'Private video' || title === 'Deleted video') continue;

    entries.push({
      videoId,
      channelId: channelId || undefined,
      title,
      description,
      publishedAt,
    });
  }

  return entries;
}

/**
 * Free YouTube RSS feed fetch — consumes 0 YouTube Data API quota.
 */
export async function fetchChannelRssVideos(channelId: string): Promise<SyncVideoCandidate[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
  const res = await fetch(rssUrl, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`RSS fetch failed (${res.status}) for channel ${channelId}`);
  }
  const xml = await res.text();
  return parseYouTubeAtomEntries(xml);
}

export function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function makeLectureSlug(title: string, fallbackId: string): string {
  const cleaned = title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `video-${fallbackId}`;
}

export async function resolveChannelAndPlaylist(
  program: any,
  youtube: youtube_v3.Youtube | null,
  saveChannelId: (channelId: string) => Promise<void>
): Promise<{ channelId: string | null; explicitPlaylistId: string | null }> {
  let channelId: string | null = program.channelId || null;
  let explicitPlaylistId: string | null = null;

  if (program.youtubeUrl) {
    try {
      const urlObj = new URL(program.youtubeUrl);
      const listParam = urlObj.searchParams.get('list');
      if (listParam) {
        explicitPlaylistId = listParam;
      }

      if (!channelId) {
        const pathname = urlObj.pathname;
        if (pathname.startsWith('/channel/')) {
          channelId = pathname.split('/channel/')[1]?.split('/')[0] || null;
          if (channelId) await saveChannelId(channelId);
        } else if (youtube) {
          const pathParts = pathname.split('/').filter((p) => p && p !== 'c' && p !== 'user');
          if (pathParts.length > 0) {
            const rawSegment = decodeURIComponent(pathParts[pathParts.length - 1]);
            const handle = rawSegment.startsWith('@') ? rawSegment.slice(1) : rawSegment;

            if (rawSegment.startsWith('@')) {
              const handleRes = await youtube.channels.list({
                part: ['id'],
                forHandle: handle,
              });
              const chId = handleRes.data.items?.[0]?.id || null;
              if (chId) {
                channelId = chId;
                await saveChannelId(chId);
              }
            }

            if (!channelId) {
              const searchRes = await youtube.search.list({
                part: ['id'],
                q: handle,
                type: ['channel'],
                maxResults: 1,
              });
              const foundId = searchRes.data.items?.[0]?.id?.channelId || null;
              if (foundId) {
                channelId = foundId;
                await saveChannelId(foundId);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`Failed to parse youtubeUrl for program ${program.name}:`, err);
    }
  }

  return { channelId, explicitPlaylistId };
}

/**
 * Checks only the given candidate video IDs against Firestore instead of scanning all lectures.
 */
async function findExistingVideoIdsAndSlugs(
  db: SyncDb,
  candidates: SyncVideoCandidate[]
): Promise<{ existingVideoIds: Set<string>; existingSlugs: Set<string> }> {
  const existingVideoIds = new Set<string>();
  const existingSlugs = new Set<string>();
  if (candidates.length === 0) return { existingVideoIds, existingSlugs };

  const candidateUrls: string[] = [];
  const candidateSlugs: string[] = [];
  for (const item of candidates) {
    candidateUrls.push(`https://www.youtube.com/watch?v=${item.videoId}`);
    candidateUrls.push(`https://youtu.be/${item.videoId}`);
    candidateSlugs.push(makeLectureSlug(item.title, item.videoId));
  }

  // Firestore `in` queries accept up to 10 (or 30) values; 10 works across all SDK versions
  const chunkSize = 10;
  for (let i = 0; i < candidateUrls.length; i += chunkSize) {
    const chunk = candidateUrls.slice(i, i + chunkSize);
    if (db.adminDb) {
      const snap = await db.adminDb
        .collection('lectures')
        .where('youtubeUrl', 'in', chunk)
        .select('youtubeUrl')
        .get();
      snap.docs.forEach((d) => {
        const vid = getVideoIdFromUrl(d.data().youtubeUrl);
        if (vid) existingVideoIds.add(vid);
      });
    } else if (db.clientDb) {
      const q = query(collection(db.clientDb, 'lectures'), where('youtubeUrl', 'in', chunk));
      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        const vid = getVideoIdFromUrl(d.data().youtubeUrl);
        if (vid) existingVideoIds.add(vid);
      });
    }
  }

  for (let i = 0; i < candidateSlugs.length; i += chunkSize) {
    const chunk = candidateSlugs.slice(i, i + chunkSize);
    if (db.adminDb) {
      const snap = await db.adminDb
        .collection('lectures')
        .where('slug', 'in', chunk)
        .select('slug')
        .get();
      snap.docs.forEach((d) => {
        if (d.data().slug) existingSlugs.add(d.data().slug);
      });
    } else if (db.clientDb) {
      const q = query(collection(db.clientDb, 'lectures'), where('slug', 'in', chunk));
      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        if (d.data().slug) existingSlugs.add(d.data().slug);
      });
    }
  }

  return { existingVideoIds, existingSlugs };
}

/**
 * Deduplicates and imports only truly new videos for a program,
 * enriching metadata with YouTube Data API in 1 batch call if an API key is configured.
 */
export async function importNewChannelVideos(
  db: SyncDb,
  program: any,
  candidates: SyncVideoCandidate[],
  youtube: youtube_v3.Youtube | null
): Promise<{ importedTitles: string[] }> {
  if (candidates.length === 0) return { importedTitles: [] };

  const { existingVideoIds, existingSlugs } = await findExistingVideoIdsAndSlugs(db, candidates);

  const newItems = candidates.filter((item) => !existingVideoIds.has(item.videoId));
  if (newItems.length === 0) {
    return { importedTitles: [] };
  }

  const detailsMap = new Map<string, { duration: number; viewCount: number }>();
  if (youtube) {
    try {
      const videoDetails = await youtube.videos.list({
        part: ['contentDetails', 'statistics'],
        id: newItems.map((i) => i.videoId),
      });
      for (const details of videoDetails.data.items || []) {
        if (!details.id) continue;
        detailsMap.set(details.id, {
          duration: details.contentDetails?.duration
            ? parseISO8601Duration(details.contentDetails.duration)
            : 0,
          viewCount: details.statistics?.viewCount
            ? parseInt(details.statistics.viewCount, 10) || 0
            : 0,
        });
      }
    } catch (err) {
      console.warn(`Batch video details lookup failed for ${program.name}:`, err);
    }
  }

  const importedTitles: string[] = [];

  for (const item of newItems) {
    const youtubeUrl = `https://www.youtube.com/watch?v=${item.videoId}`;
    let slug = makeLectureSlug(item.title, item.videoId);
    if (existingSlugs.has(slug)) {
      slug = `${slug}-${item.videoId.slice(0, 6)}`;
    }

    const meta = detailsMap.get(item.videoId) || { duration: 0, viewCount: 0 };
    const pubDate = item.publishedAt ? new Date(item.publishedAt) : new Date();
    const safePubDate = isNaN(pubDate.getTime()) ? new Date() : pubDate;

    const lectureData: any = {
      title: item.title,
      slug,
      description: item.description || '',
      programId: program.id,
      programName: program.name || '',
      programSlug: program.slug || '',
      audioSrc: youtubeUrl,
      youtubeUrl,
      duration: meta.duration,
      imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
      rating: 0,
      ratingCount: 0,
      viewCount: 0,
      youtubeViewCount: meta.viewCount,
      transcript: [],
      language: 'ar',
    };

    if (db.adminDb) {
      lectureData.createdAt = AdminTimestamp.now();
      lectureData.publishedAt = AdminTimestamp.fromDate(safePubDate);
      await db.adminDb.collection('lectures').add(lectureData);
    } else if (db.clientDb) {
      lectureData.createdAt = serverTimestamp();
      lectureData.publishedAt = safePubDate;
      await addDoc(collection(db.clientDb, 'lectures'), lectureData);
    }

    existingVideoIds.add(item.videoId);
    existingSlugs.add(slug);
    importedTitles.push(item.title);
  }

  return { importedTitles };
}

export async function updateProgramSyncMarkers(
  db: SyncDb,
  programId: string,
  updates: { lastSyncedVideoId?: string; websubSubscribedAt?: number }
) {
  const payload: Record<string, any> = {};
  if (updates.lastSyncedVideoId) payload.lastSyncedVideoId = updates.lastSyncedVideoId;
  if (updates.websubSubscribedAt) payload.websubSubscribedAt = updates.websubSubscribedAt;
  if (Object.keys(payload).length === 0) return;

  if (db.adminDb) {
    await db.adminDb.collection('programs').doc(programId).update(payload);
  } else if (db.clientDb) {
    await updateDoc(doc(db.clientDb, 'programs', programId), payload);
  }
}

export async function incrementGlobalLectureStat(db: SyncDb, count: number) {
  if (count <= 0) return;
  if (db.adminDb) {
    await db.adminDb
      .doc('stats/global')
      .set({ lectures: FieldValue.increment(count) }, { merge: true });
  } else if (db.clientDb) {
    await setDoc(
      doc(db.clientDb, 'stats', 'global'),
      { lectures: clientIncrement(count) },
      { merge: true }
    );
  }
}

/**
 * Subscribes a YouTube channel to PubSubHubbub WebSub notifications (100% free).
 */
export async function subscribeChannelToWebSub(
  channelId: string,
  origin: string
): Promise<boolean> {
  try {
    const callbackUrl = `${origin}/api/youtube/webhook`;
    const topicUrl = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;

    const form = new URLSearchParams();
    form.set('hub.mode', 'subscribe');
    form.set('hub.topic', topicUrl);
    form.set('hub.callback', callbackUrl);
    form.set('hub.verify', 'async');

    const secret = process.env.YOUTUBE_WEBHOOK_SECRET || process.env.CRON_SECRET;
    if (secret) {
      form.set('hub.secret', secret);
    }

    const res = await fetch(WEBSUB_HUB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      signal: AbortSignal.timeout(8000),
    });

    return res.ok || res.status === 202 || res.status === 204;
  } catch (err) {
    console.warn(`WebSub subscription failed for channel ${channelId}:`, err);
    return false;
  }
}

export function needsWebSubRenewal(websubSubscribedAt?: any): boolean {
  if (!websubSubscribedAt) return true;
  const ts = typeof websubSubscribedAt === 'number' ? websubSubscribedAt : Number(websubSubscribedAt);
  if (!Number.isFinite(ts)) return true;
  return Date.now() - ts > WEBSUB_RENEW_INTERVAL_MS;
}

export function createYoutubeClient(): youtube_v3.Youtube | null {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;
  return google.youtube({ version: 'v3', auth: apiKey });
}
