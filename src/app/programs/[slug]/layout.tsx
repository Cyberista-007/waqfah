'use client';

import { useParams, notFound, usePathname } from 'next/navigation';
import type { Program, Lecture, Series } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getPlaceholderImage } from '@/lib/images';
import { getInitials, getVideoIdFromUrl, cn } from '@/lib/utils';
import {
  Users,
  Video,
  Clapperboard,
  ListVideo,
  Home,
  Play,
  Share2,
  Verified,
  Sparkles,
  X,
} from 'lucide-react';
import { FollowButton } from '@/components/follow-button';
import { useCollection } from '@/firebase';
import { CinematicAppLoader } from '@/components/skeletons';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Player } from '@/components/html5-player';
import { useToast } from '@/hooks/use-toast';

function ProgramHeader({
  program,
  contentCounts,
  featuredLecture,
}: {
  program: Program;
  contentCounts: { lectures: number; shorts: number; series: number };
  featuredLecture: Lecture | null;
}) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const placeholder = getPlaceholderImage(program.imageId);
  const imageUrl = program.imageUrl || placeholder?.imageUrl;

  const featuredVideoId = featuredLecture ? getVideoIdFromUrl(featuredLecture.youtubeUrl) : null;
  const featuredThumbnail = featuredVideoId
    ? `https://img.youtube.com/vi/${featuredVideoId}/maxresdefault.jpg`
    : bannerUrl || `https://picsum.photos/seed/${program.slug}-banner/1920/600`;

  const tabs = [
    { href: `/programs/${program.slug}`, label: 'الرئيسية', icon: Home },
    { href: `/programs/${program.slug}/lectures`, label: 'المحاضرات', icon: Clapperboard, count: contentCounts.lectures },
    { href: `/programs/${program.slug}/shorts`, label: 'مقاطع قصيرة', icon: Video, count: contentCounts.shorts },
    { href: `/programs/${program.slug}/series`, label: 'السلاسل', icon: ListVideo, count: contentCounts.series },
  ];

  useEffect(() => {
    if (!program.youtubeUrl) return;
    const fetchBanner = async () => {
      try {
        const response = await fetch(`${window.location.origin}/api/youtube-import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: program.youtubeUrl, fetchChannelInfo: true }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.channelInfo?.bannerUrl) {
            setBannerUrl(data.channelInfo.bannerUrl.replace('=w1060', '=w2560'));
          }
        }
      } catch (e) {
        console.error('Failed to fetch YouTube banner:', e);
      }
    };
    fetchBanner();
  }, [program.youtubeUrl]);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: program.name, text: program.bio || program.name, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'تم نسخ رابط القناة!' });
    } catch {
      toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
    }
  };

  return (
    <header className="w-full" dir="rtl">
      <div className="container mx-auto px-3 sm:px-6 pt-4 md:pt-6 space-y-6">
        {/* ─── CLEAN CHANNEL BANNER ─── */}
        <div className="relative h-40 sm:h-52 md:h-64 w-full rounded-2xl md:rounded-3xl overflow-hidden border border-border/60 bg-muted shadow-sm">
          <img
            src={bannerUrl || featuredThumbnail}
            alt={program.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />
        </div>

        {/* ─── CHANNEL IDENTITY & ACTIONS ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-xl ring-2 ring-primary/20">
                {imageUrl && <AvatarImage src={imageUrl} alt={program.name} className="object-cover" />}
                <AvatarFallback className="text-3xl font-black bg-primary/15 text-primary">
                  {getInitials(program.name)}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute bottom-1 left-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md ring-2 ring-background"
                title="قناة موثقة"
              >
                <Verified className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            </div>

            {/* Name, Bio & Stats */}
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline text-foreground tracking-tight">
                  {program.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  قناة علمية
                </span>
              </div>

              {program.bio && (
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-2">
                  {program.bio}
                </p>
              )}

              {/* Compact Stats Pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-foreground">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>{program.followerCount || 0} متابع</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/60">
                  <Clapperboard className="w-3.5 h-3.5 text-blue-500" />
                  <span>{contentCounts.lectures} محاضرة</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/60">
                  <ListVideo className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{contentCounts.series} سلسلة</span>
                </span>
                {contentCounts.shorts > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/60">
                    <Video className="w-3.5 h-3.5 text-orange-500" />
                    <span>{contentCounts.shorts} مقطع قصير</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 shrink-0">
            <FollowButton
              programId={program.id}
              className="h-11 px-6 rounded-xl text-sm font-bold shadow-sm"
            />

            {featuredVideoId && (
              <Button
                onClick={() => setShowPlayer(true)}
                variant="outline"
                className="h-11 px-4 rounded-xl text-sm font-bold gap-2"
              >
                <Play className="w-4 h-4 fill-current text-primary" />
                <span>أحدث محاضرة</span>
              </Button>
            )}

            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              aria-label="مشاركة القناة"
              title="مشاركة القناة"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── CHANNEL NAVIGATION TABS ─── */}
      <div className="sticky top-16 z-30 mt-6 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-6">
          <nav
            className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2"
            aria-label="أقسام القناة"
          >
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'relative inline-flex items-center gap-2 px-4 py-2 text-sm font-bold whitespace-nowrap rounded-xl transition-all',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeProgramTab"
                      className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={cn(
                        'text-[11px] font-bold px-2 py-0.5 rounded-full',
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ─── FEATURED PLAYER MODAL ─── */}
      <AnimatePresence>
        {showPlayer && featuredVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setShowPlayer(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              className="w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-white font-bold text-base md:text-lg line-clamp-1">
                  {featuredLecture?.title}
                </h2>
                <button
                  onClick={() => setShowPlayer(false)}
                  className="text-white/70 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10 shrink-0"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Html5Player
                videoId={featuredVideoId}
                title={featuredLecture?.title}
                thumbnailUrl={`https://img.youtube.com/vi/${featuredVideoId}/maxresdefault.jpg`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default function ProgramLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = decodeURIComponent(slugParam as string);

  const { data: matchedPrograms, isLoading: programsLoading } = useCollection<Program>('programs', {
    where: ['slug', '==', slug],
    limit: 1,
    once: true,
  });
  const matchedProgram = matchedPrograms?.[0] || null;

  const { data: programLectures, isLoading: lecturesLoading } = useCollection<Lecture>(
    matchedProgram ? 'lectures' : null,
    matchedProgram ? { where: ['programId', '==', matchedProgram.id], limit: 200, once: true } : undefined
  );
  const { data: programSeries, isLoading: seriesLoading } = useCollection<Series>(
    matchedProgram ? 'series' : null,
    matchedProgram ? { where: ['programId', '==', matchedProgram.id], limit: 50, once: true } : undefined
  );

  const isLoading = programsLoading || (!!matchedProgram && (lecturesLoading || seriesLoading));

  const programData = useMemo(() => {
    if (isLoading || !matchedProgram) {
      return { program: null, contentCounts: { lectures: 0, shorts: 0, series: 0 }, featuredLecture: null };
    }

    const lecturesList = programLectures || [];
    const seriesList = programSeries || [];

    let lectureCount = 0;
    let shortCount = 0;
    let featuredLecture: Lecture | null = null;

    const toMs = (ts: any) => {
      if (!ts) return 0;
      if (typeof ts.toDate === 'function') return ts.toDate().getTime();
      if (typeof ts.seconds === 'number') return ts.seconds * 1000;
      if (typeof ts._seconds === 'number') return ts._seconds * 1000;
      const d = new Date(ts);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };

    const sortedLectures = [...lecturesList].sort(
      (a, b) => toMs(b.publishedAt || b.createdAt) - toMs(a.publishedAt || a.createdAt)
    );

    sortedLectures.forEach((l) => {
      if (l.duration <= 180) {
        shortCount++;
      } else {
        lectureCount++;
        if (!featuredLecture && l.youtubeUrl) {
          featuredLecture = l;
        }
      }
    });

    return {
      program: matchedProgram,
      contentCounts: { lectures: lectureCount, shorts: shortCount, series: seriesList.length },
      featuredLecture,
    };
  }, [isLoading, matchedProgram, programLectures, programSeries]);

  const { program, contentCounts, featuredLecture } = programData;

  if (isLoading) {
    return <CinematicAppLoader />;
  }

  if (!program) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen">
      <ProgramHeader program={program} contentCounts={contentCounts} featuredLecture={featuredLecture} />
      <main className="container mx-auto px-3 sm:px-6 py-8" dir="rtl">
        {children}
      </main>
    </div>
  );
}
