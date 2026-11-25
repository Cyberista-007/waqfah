import { NextRequest, NextResponse } from 'next/server';
import { google, youtube_v3 } from 'googleapis';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
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
  increment as clientIncrement,
  serverTimestamp,
} from 'firebase/firestore';
import { getVideoIdFromUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

function makeSlug(title: string, fallbackId: string): string {
  const cleaned = title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `video-${fallbackId}`;
}

async function resolvePlaylistAndChannel(
  program: any,
  youtube: youtube_v3.Youtube,
  saveChannelId: (channelId: string) => Promise<void>
): Promise<{ playlistId: string | null; channelId: string | null }> {
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
        } else {
          const pathParts = pathname.split('/').filter((p) => p && p !== 'c' && p !== 'user');
          if (pathParts.length > 0) {
            const rawSegment = decodeURIComponent(pathParts[pathParts.length - 1]);
            const handle = rawSegment.startsWith('@') ? rawSegment.slice(1) : rawSegment;

            // Try exact handle lookup first
            if (rawSegment.startsWith('@')) {
              const handleRes = await youtube.channels.list({
                part: ['id', 'contentDetails'],
                forHandle: handle,
              });
              const ch = handleRes.data.items?.[0];
              if (ch?.id) {
                channelId = ch.id;
                await saveChannelId(channelId);
                const uploadsId = ch.contentDetails?.relatedPlaylists?.uploads || null;
                return { playlistId: explicitPlaylistId || uploadsId, channelId };
              }
            }

            // Fallback to channel search
            const searchRes = await youtube.search.list({
              part: ['id'],
              q: handle,
              type: ['channel'],
              maxResults: 1,
            });
            const foundId = searchRes.data.items?.[0]?.id?.channelId || null;
            if (foundId) {
              channelId = foundId;
              await saveChannelId(channelId);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Failed to parse youtubeUrl for program: ${program.name}`, err);
    }
  }

  if (explicitPlaylistId) {
    return { playlistId: explicitPlaylistId, channelId };
  }

  if (!channelId) {
    return { playlistId: null, channelId: null };
  }

  // Fetch official uploads playlist ID from channels.list
  try {
    const chRes = await youtube.channels.list({
      part: ['contentDetails'],
      id: [channelId],
    });
    const uploadsId = chRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (uploadsId) {
      return { playlistId: uploadsId, channelId };
    }
  } catch (err) {
    console.error(`Failed to fetch channel uploads playlist for ${channelId}`, err);
  }

  // Fallback for UC... channel IDs
  if (channelId.startsWith('UC')) {
    return { playlistId: 'UU' + channelId.substring(2), channelId };
  }

  return { playlistId: null, channelId };
}

async function runYoutubeSync(targetProgramId?: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'YOUTUBE_API_KEY is not set in environment variables.' },
      { status: 500 }
    );
  }

  let adminFirestore: FirebaseFirestore.Firestore | null = null;
  let clientDb: any = null;

  try {
    const adminApp = initializeAdminApp();
    adminFirestore = adminApp.firestore;
  } catch {
    adminFirestore = null;
  }

  if (!adminFirestore) {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    clientDb = getClientFirestore(app);
  }

  const youtube = google.youtube({ version: 'v3', auth: apiKey });

  try {
    let programs: any[] = [];
    if (adminFirestore) {
      const snap = await adminFirestore.collection('programs').get();
      programs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } else {
      const snap = await getDocs(collection(clientDb, 'programs'));
      programs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }

    if (targetProgramId) {
      programs = programs.filter((p) => p.id === targetProgramId);
    }

    if (programs.length === 0) {
      return NextResponse.json(
        { success: true, message: 'لا توجد برامج للمزامنة.', totalImported: 0, results: [] },
        { status: 200 }
      );
    }

    // Preload existing lecture video IDs and slugs once to avoid N+1 duplicate queries
    const existingVideoIds = new Set<string>();
    const existingSlugs = new Set<string>();

    if (adminFirestore) {
      const lecSnap = await adminFirestore.collection('lectures').select('youtubeUrl', 'slug').get();
      lecSnap.docs.forEach((d) => {
        const data = d.data();
        const vid = getVideoIdFromUrl(data.youtubeUrl);
        if (vid) existingVideoIds.add(vid);
        if (data.slug) existingSlugs.add(data.slug);
      });
    } else {
      const lecSnap = await getDocs(collection(clientDb, 'lectures'));
      lecSnap.docs.forEach((d) => {
        const data = d.data();
        const vid = getVideoIdFromUrl(data.youtubeUrl);
        if (vid) existingVideoIds.add(vid);
        if (data.slug) existingSlugs.add(data.slug);
      });
    }

    const syncResults: any[] = [];
    let totalImported = 0;

    for (const program of programs) {
      const saveChannelId = async (newChannelId: string) => {
        if (adminFirestore) {
          await adminFirestore.collection('programs').doc(program.id).update({ channelId: newChannelId });
        } else {
          await updateDoc(doc(clientDb, 'programs', program.id), { channelId: newChannelId });
        }
      };

      const { playlistId } = await resolvePlaylistAndChannel(program, youtube, saveChannelId);
      if (!playlistId) {
        syncResults.push({
          programName: program.name,
          importedCount: 0,
          skipped: true,
          reason: 'تعذر تحديد معرف القناة أو قائمة التشغيل',
        });
        continue;
      }

      try {
        const playlistItemsResponse = await youtube.playlistItems.list({
          part: ['contentDetails', 'snippet'],
          playlistId,
          maxResults: 15,
        });

        const items = playlistItemsResponse.data.items || [];
        const newItems = items.filter((item) => {
          const videoId = item.contentDetails?.videoId;
          const title = item.snippet?.title;
          if (!videoId || !title) return false;
          if (title === 'Private video' || title === 'Deleted video') return false;
          return !existingVideoIds.has(videoId);
        });

        if (newItems.length === 0) {
          continue;
        }

        // Batch-fetch video details (duration & views) in a single API call
        const videoIds = newItems
          .map((item) => item.contentDetails?.videoId)
          .filter((id): id is string => Boolean(id));

        const detailsMap = new Map<string, { duration: number; viewCount: number }>();
        if (videoIds.length > 0) {
          try {
            const videoDetails = await youtube.videos.list({
              part: ['contentDetails', 'statistics'],
              id: videoIds,
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
          } catch (detailErr) {
            console.error(`Failed to batch-fetch video details for program: ${program.name}`, detailErr);
          }
        }

        const importedForThisProgram: string[] = [];

        for (const item of newItems) {
          const videoId = item.contentDetails!.videoId!;
          const title = item.snippet!.title!;
          const description = item.snippet?.description || '';
          const publishedAtStr = item.snippet?.publishedAt || new Date().toISOString();
          const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

          let slug = makeSlug(title, videoId);
          if (existingSlugs.has(slug)) {
            slug = `${slug}-${videoId.slice(0, 5)}`;
          }

          const meta = detailsMap.get(videoId) || { duration: 0, viewCount: 0 };

          const lectureData: any = {
            title,
            slug,
            description,
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

          if (adminFirestore) {
            lectureData.createdAt = Timestamp.now();
            lectureData.publishedAt = Timestamp.fromDate(new Date(publishedAtStr));
            await adminFirestore.collection('lectures').add(lectureData);
          } else {
            lectureData.createdAt = serverTimestamp();
            lectureData.publishedAt = new Date(publishedAtStr);
            await addDoc(collection(clientDb, 'lectures'), lectureData);
          }

          existingVideoIds.add(videoId);
          existingSlugs.add(slug);
          importedForThisProgram.push(title);
          totalImported++;
        }

        if (importedForThisProgram.length > 0) {
          syncResults.push({
            programName: program.name,
            importedCount: importedForThisProgram.length,
            importedLectures: importedForThisProgram,
          });
        }
      } catch (playlistErr: any) {
        console.error(`Failed to sync channel uploads for program: ${program.name}`, playlistErr);
        syncResults.push({
          programName: program.name,
          importedCount: 0,
          error: playlistErr?.message || 'فشل جلب الحلقات',
        });
      }
    }

    if (totalImported > 0) {
      if (adminFirestore) {
        await adminFirestore.doc('stats/global').set(
          { lectures: FieldValue.increment(totalImported) },
          { merge: true }
        );
      } else {
        await setDoc(
          doc(clientDb, 'stats', 'global'),
          { lectures: clientIncrement(totalImported) },
          { merge: true }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        totalImported,
        syncedProgramsCount: programs.length,
        results: syncResults,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('YouTube Cron Sync Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred during sync.',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return runYoutubeSync();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const programId = typeof body?.programId === 'string' ? body.programId : undefined;
    return runYoutubeSync(programId);
  } catch {
    return runYoutubeSync();
  }
}
