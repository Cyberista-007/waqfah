import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import {
  createYoutubeClient,
  fetchChannelRssVideos,
  getPublicOrigin,
  getSyncDb,
  importNewChannelVideos,
  incrementGlobalLectureStat,
  needsWebSubRenewal,
  resolveChannelAndPlaylist,
  subscribeChannelToWebSub,
  updateProgramSyncMarkers,
  type SyncVideoCandidate,
} from '@/lib/youtube-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function runYoutubeSync(req: NextRequest, targetProgramId?: string, forceResubscribe = false) {
  const db = getSyncDb();
  const youtube = createYoutubeClient();
  const origin = getPublicOrigin(req);

  try {
    let programs: any[] = [];
    if (db.adminDb) {
      const snap = await db.adminDb.collection('programs').get();
      programs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } else if (db.clientDb) {
      const snap = await getDocs(collection(db.clientDb, 'programs'));
      programs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }

    if (targetProgramId) {
      programs = programs.filter((p) => p.id === targetProgramId);
    }

    if (programs.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'لا توجد برامج للمزامنة.',
          totalImported: 0,
          syncedProgramsCount: 0,
          websubRenewedCount: 0,
          results: [],
        },
        { status: 200 }
      );
    }

    const syncResults: any[] = [];
    let totalImported = 0;
    let websubRenewedCount = 0;

    for (const program of programs) {
      try {
        const { channelId, explicitPlaylistId } = await resolveChannelAndPlaylist(
          program,
          youtube,
          async (newChannelId) => {
            if (db.adminDb) {
              await db.adminDb.collection('programs').doc(program.id).update({ channelId: newChannelId });
            } else if (db.clientDb) {
              const { doc, updateDoc } = await import('firebase/firestore');
              await updateDoc(doc(db.clientDb, 'programs', program.id), { channelId: newChannelId });
            }
          }
        );

        // Renew / initialize instant YouTube WebSub webhook if running on a public HTTPS origin
        let subscribedNow = false;
        if (channelId && origin && (forceResubscribe || needsWebSubRenewal(program.websubSubscribedAt))) {
          subscribedNow = await subscribeChannelToWebSub(channelId, origin);
          if (subscribedNow) {
            websubRenewedCount++;
          }
        }

        let candidates: SyncVideoCandidate[] = [];
        let usedRss = false;

        // Fast zero-quota path: check channel RSS feed first unless an explicit playlist URL is configured
        if (channelId && !explicitPlaylistId) {
          try {
            candidates = await fetchChannelRssVideos(channelId);
            usedRss = true;
          } catch (rssErr) {
            console.warn(`RSS check failed for ${program.name}, falling back to API if configured:`, rssErr);
          }
        }

        // Fast early-exit: top RSS video matches lastSyncedVideoId -> zero Firestore lecture queries!
        const newestCandidateId = candidates[0]?.videoId;
        if (usedRss && newestCandidateId && program.lastSyncedVideoId === newestCandidateId) {
          if (subscribedNow) {
            await updateProgramSyncMarkers(db, program.id, { websubSubscribedAt: Date.now() });
          }
          continue;
        }

        // Fallback to YouTube Data API playlistItems if RSS wasn't used (e.g., explicit ?list= playlist)
        if (!usedRss) {
          if (!youtube) {
            syncResults.push({
              programName: program.name,
              importedCount: 0,
              skipped: true,
              reason: 'تعذر قراءة RSS بدون YOUTUBE_API_KEY',
            });
            continue;
          }

          let playlistId = explicitPlaylistId;
          if (!playlistId && channelId) {
            const chRes = await youtube.channels.list({
              part: ['contentDetails'],
              id: [channelId],
            });
            playlistId =
              chRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ||
              (channelId.startsWith('UC') ? 'UU' + channelId.substring(2) : null);
          }

          if (!playlistId) {
            syncResults.push({
              programName: program.name,
              importedCount: 0,
              skipped: true,
              reason: 'تعذر تحديد معرف القناة أو قائمة التشغيل',
            });
            continue;
          }

          const playlistItemsRes = await youtube.playlistItems.list({
            part: ['contentDetails', 'snippet'],
            playlistId,
            maxResults: 15,
          });

          candidates = (playlistItemsRes.data.items || [])
            .map((item) => ({
              videoId: item.contentDetails?.videoId || '',
              channelId: channelId || undefined,
              title: item.snippet?.title || '',
              description: item.snippet?.description || '',
              publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
            }))
            .filter(
              (c) =>
                Boolean(c.videoId) &&
                Boolean(c.title) &&
                c.title !== 'Private video' &&
                c.title !== 'Deleted video'
            );

          if (candidates[0]?.videoId && program.lastSyncedVideoId === candidates[0].videoId) {
            if (subscribedNow) {
              await updateProgramSyncMarkers(db, program.id, { websubSubscribedAt: Date.now() });
            }
            continue;
          }
        }

        const { importedTitles } = await importNewChannelVideos(db, program, candidates, youtube);
        totalImported += importedTitles.length;

        const markers: { lastSyncedVideoId?: string; websubSubscribedAt?: number } = {};
        if (candidates[0]?.videoId && candidates[0].videoId !== program.lastSyncedVideoId) {
          markers.lastSyncedVideoId = candidates[0].videoId;
        }
        if (subscribedNow) {
          markers.websubSubscribedAt = Date.now();
        }
        await updateProgramSyncMarkers(db, program.id, markers);

        if (importedTitles.length > 0) {
          syncResults.push({
            programName: program.name,
            importedCount: importedTitles.length,
            importedLectures: importedTitles,
          });
        }
      } catch (progErr: any) {
        console.error(`Failed syncing program ${program.name}:`, progErr);
        syncResults.push({
          programName: program.name,
          importedCount: 0,
          error: progErr?.message || 'فشل جلب الحلقات',
        });
      }
    }

    if (totalImported > 0) {
      await incrementGlobalLectureStat(db, totalImported);
    }

    return NextResponse.json(
      {
        success: true,
        totalImported,
        syncedProgramsCount: programs.length,
        websubRenewedCount,
        diagnostics: {
          hasAdminSdk: Boolean(db.adminDb),
          hasYoutubeApiKey: Boolean(youtube),
          hasCronSecret: Boolean(process.env.CRON_SECRET),
          webhookUrl: origin ? `${origin}/api/youtube/webhook` : null,
        },
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
  const querySecret = req.nextUrl.searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const renew = req.nextUrl.searchParams.get('renew') === '1';
  return runYoutubeSync(req, undefined, renew);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const programId = typeof body?.programId === 'string' ? body.programId : undefined;
    const renew = Boolean(body?.renewWebSub);
    return runYoutubeSync(req, programId, renew);
  } catch {
    return runYoutubeSync(req);
  }
}
