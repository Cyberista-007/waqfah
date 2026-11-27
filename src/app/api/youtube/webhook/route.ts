import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  createYoutubeClient,
  getSyncDb,
  importNewChannelVideos,
  incrementGlobalLectureStat,
  parseYouTubeAtomEntries,
  updateProgramSyncMarkers,
} from '@/lib/youtube-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * PubSubHubbub verification endpoint called by Google's YouTube hub on subscribe/unsubscribe.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const challenge = searchParams.get('hub.challenge');

  if ((mode === 'subscribe' || mode === 'unsubscribe') && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ status: 'ok', service: 'youtube-websub-webhook' }, { status: 200 });
}

function verifyHubSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const [algo, providedHex] = signatureHeader.split('=');
  if (algo !== 'sha1' || !providedHex) return false;

  const expectedHex = createHmac('sha1', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(providedHex, 'hex'), Buffer.from(expectedHex, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Instant push receiver called by YouTube whenever a subscribed channel uploads a video.
 */
export async function POST(req: NextRequest) {
  try {
    const rawXml = await req.text();
    const secret = process.env.YOUTUBE_WEBHOOK_SECRET || process.env.CRON_SECRET;

    if (secret) {
      const signature = req.headers.get('x-hub-signature');
      if (signature && !verifyHubSignature(rawXml, signature, secret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    const entries = parseYouTubeAtomEntries(rawXml);
    if (entries.length === 0) {
      return NextResponse.json({ received: true, imported: 0 }, { status: 200 });
    }

    const db = getSyncDb();
    const youtube = createYoutubeClient();

    // Group entries by channelId (almost always 1 entry / 1 channel per notification)
    const entriesByChannel = new Map<string, typeof entries>();
    for (const entry of entries) {
      if (!entry.channelId) continue;
      const list = entriesByChannel.get(entry.channelId) || [];
      list.push(entry);
      entriesByChannel.set(entry.channelId, list);
    }

    let totalImported = 0;

    for (const [channelId, candidates] of entriesByChannel.entries()) {
      let programs: any[] = [];
      if (db.adminDb) {
        const snap = await db.adminDb
          .collection('programs')
          .where('channelId', '==', channelId)
          .get();
        programs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } else if (db.clientDb) {
        const q = query(
          collection(db.clientDb, 'programs'),
          where('channelId', '==', channelId)
        );
        const snap = await getDocs(q);
        programs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      if (programs.length === 0) continue;

      for (const program of programs) {
        const { importedTitles } = await importNewChannelVideos(db, program, candidates, youtube);
        totalImported += importedTitles.length;

        const newestId = candidates[0]?.videoId;
        if (newestId && program.lastSyncedVideoId !== newestId) {
          await updateProgramSyncMarkers(db, program.id, { lastSyncedVideoId: newestId });
        }
      }
    }

    if (totalImported > 0) {
      await incrementGlobalLectureStat(db, totalImported);
    }

    return NextResponse.json({ received: true, totalImported }, { status: 200 });
  } catch (err: any) {
    console.error('[YouTube Webhook Error]:', err);
    return NextResponse.json(
      { received: false, error: err?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
