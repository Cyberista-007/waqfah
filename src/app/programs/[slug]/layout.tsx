'use client';

import { useParams, notFound, usePathname } from 'next/navigation';
import type { Program, Lecture, Series } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/images';
import { getInitials } from '@/lib/utils';
import { Users, Video, Clapperboard, ListVideo, Home, Play, Bell, Share2, Verified, TrendingUp, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { FollowButton } from '@/components/follow-button';
import { useCollection } from '@/firebase';
import { CinematicAppLoader } from '@/components/skeletons';
import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Player } from '@/components/html5-player';
import { getVideoIdFromUrl } from '@/lib/utils';

function StatBadge({ value, label, icon: Icon, color }: { value: string | number; label: string; icon: any; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 group w-24">
      <div className={cn("flex items-center justify-center gap-2 font-black text-3xl md:text-4xl drop-shadow-md", color)}>
        <span>{value}</span>
        <Icon className="w-5 h-5 opacity-80" />
      </div>
      <span className="text-[11px] font-bold text-zinc-400">{label}</span>
    </div>
  );
}

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
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const [statsRef] = useEmblaCarousel({ dragFree: true, direction: "rtl", align: "start" });
  const [navRef] = useEmblaCarousel({ dragFree: true, direction: "rtl", align: "center", containScroll: "keepSnaps" });

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
    if (program.youtubeUrl) {
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
    }
  }, [program.youtubeUrl]);

  return (
    <div ref={headerRef} className="container mx-auto px-2 sm:px-4 lg:px-6 mt-4 lg:mt-8" dir="rtl">
      {/* ─── CINEMATIC BANNER ─── */}
      <div className="relative min-h-[360px] md:min-h-[420px] max-h-[600px] mb-8 md:mb-12">
        {/* Background & Gradients (Clipped to oval) */}
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] border border-border/20 shadow-2xl frosted-glass group">
          <div className="absolute inset-0">
            <img
              src={bannerUrl || featuredThumbnail}
              alt={program.name}
              className="w-full h-full object-cover object-top scale-105 transition-transform hover:scale-100"
              style={{ transitionDuration: '10s' }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />

          <div className="absolute top-8 left-8 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-16 right-16 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        </div>

        {/* Header Content (Allowed to pop out) */}
        <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-12 pb-0 pointer-events-none">
          <div className="container mx-auto pointer-events-auto">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 translate-y-6 md:translate-y-4">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="relative shrink-0 z-10"
              >
                <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full scale-150" />
                <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background/50 shadow-2xl ring-4 ring-primary/20 relative backdrop-blur-sm group-hover:scale-105 transition-transform duration-500">
                  {imageUrl && <AvatarImage src={imageUrl} alt={program.name} className="object-cover" />}
                  <AvatarFallback className="text-5xl font-black bg-gradient-to-br from-primary/30 to-primary/60 text-primary">
                    {getInitials(program.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Verified Badge */}
                <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg ring-2 ring-background">
                  <Verified className="w-4 h-4 text-white fill-white" />
                </div>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex-1 min-w-0 pb-4 md:pb-12 flex flex-col items-center md:items-start text-center md:text-start"
              >
                <div className="flex items-center gap-3 mb-2 md:mb-3">
                  <div className="px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-primary flex items-center gap-2 hover-glow w-fit shadow-md">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    قناة علمية
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black font-headline tracking-tighter leading-[1.1] text-foreground drop-shadow-lg mb-3">
                  {program.name}
                </h1>
                <p className="text-zinc-400 text-base md:text-lg max-w-2xl line-clamp-2 leading-relaxed mb-6">
                  {program.bio}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 md:gap-3 max-w-lg mt-3 md:mt-4 w-full px-2 md:px-0">
                  <FollowButton programId={program.id} className="w-full h-12 md:h-[52px] rounded-2xl text-base md:text-lg font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] btn-magnetic text-primary-foreground" />
                  
                  <div className="flex items-center gap-3 w-full">
                    {featuredVideoId && (
                      <button
                        onClick={() => setShowPlayer(true)}
                        className="flex-1 flex justify-center items-center gap-2 h-12 md:h-[52px] px-4 md:px-6 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white font-bold text-xs md:text-sm hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Play className="w-5 h-5" />
                        مشاهدة أحدث محاضرة
                      </button>
                    )}
                    <button className="w-12 h-12 md:w-[52px] md:h-[52px] shrink-0 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-white/20 transition-all hover:scale-105">
                      <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:flex flex-col gap-6 pb-6 md:pb-12 pr-4 shrink-0 items-end"
              >
                <StatBadge value={program.followerCount || 0} label="متابع" icon={Users} color="text-primary" />
                <StatBadge value={contentCounts.lectures} label="محاضرة" icon={Clapperboard} color="text-blue-400" />
                <StatBadge value={contentCounts.series} label="سلسلة" icon={ListVideo} color="text-emerald-400" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FEATURED PLAYER MODAL ─── */}
      <AnimatePresence>
        {showPlayer && featuredVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setShowPlayer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">{featuredLecture?.title}</h2>
                <button
                  onClick={() => setShowPlayer(false)}
                  className="text-zinc-400 hover:text-white transition-colors text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/10"
                >
                  إغلاق ✕
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

      {/* ─── MOBILE STATS ─── */}
      <div className="lg:hidden container mx-auto px-4 pb-6 mt-8 md:mt-2">
        <div className="bg-card/50 backdrop-blur-xl border border-border/20 shadow-inner rounded-[2rem] p-4 cursor-grab active:cursor-grabbing overflow-hidden" ref={statsRef}>
          <div className="flex items-center gap-2">
            <div className="shrink-0 w-24"><StatBadge value={program.followerCount || 0} label="متابع"   icon={Users}      color="text-primary"    /></div>
            <div className="w-px h-10 bg-border/50 shrink-0" />
            <div className="shrink-0 w-24"><StatBadge value={contentCounts.lectures}    label="محاضرة"   icon={Clapperboard} color="text-blue-400"  /></div>
            <div className="w-px h-10 bg-border/50 shrink-0" />
            <div className="shrink-0 w-24"><StatBadge value={contentCounts.series}      label="سلسلة"    icon={ListVideo}  color="text-emerald-400" /></div>
            <div className="w-px h-10 bg-border/50 shrink-0" />
            <div className="shrink-0 w-24"><StatBadge value={contentCounts.shorts}      label="مقطع قصير" icon={Video}     color="text-orange-400" /></div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TABS (Floating Oval Dock) ─── */}
      <div className="sticky top-24 z-40 w-full px-4 flex justify-center mt-6 mb-10 pointer-events-none">
        <div className="bg-card/70 backdrop-blur-3xl border border-border/50 shadow-2xl shadow-primary/5 rounded-full p-2 pointer-events-auto frosted-glass ring-1 ring-white/10 max-w-full overflow-hidden cursor-grab active:cursor-grabbing" ref={navRef} dir="rtl">
          <nav className="flex items-center gap-1.5 w-max" aria-label="Program sections">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'group relative inline-flex items-center gap-2 py-2.5 px-6 text-sm font-bold font-headline whitespace-nowrap rounded-full transition-all duration-300 z-10',
                    isActive
                      ? 'text-primary-foreground drop-shadow-md'
                      : 'text-foreground/80 hover:text-primary hover:bg-primary/10'
                  )}
                >
                  {/* Active Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeProgramTab"
                      className="absolute inset-0 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <tab.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-primary")} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-full transition-colors",
                      isActive ? "bg-background/20 text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>
        </div>
      </div>
    </div>
  );
}


export default function ProgramLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = decodeURIComponent(slugParam as string);

  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');

  const isLoading = programsLoading || lecturesLoading || seriesLoading;

  const programData = useMemo(() => {
    if (isLoading || !allPrograms || !allLectures || !allSeries) {
      return { program: null, contentCounts: { lectures: 0, shorts: 0, series: 0 }, featuredLecture: null };
    }

    const program = allPrograms.find((p) => p.slug === slug);
    if (!program) return { program: null, contentCounts: { lectures: 0, shorts: 0, series: 0 }, featuredLecture: null };

    const seriesForProgram = allSeries.filter((s) => s.programId === program.id || s.programSlug === program.slug);
    const seriesIds = new Set(seriesForProgram.map((s) => s.id));

    let lectureCount = 0;
    let shortCount = 0;
    let featuredLecture: Lecture | null = null;

    // Sort by date descending
    const sortedLectures = [...allLectures].sort((a, b) => {
      const toMs = (ts: any) => ts?.toDate ? ts.toDate().getTime() : new Date(ts || 0).getTime();
      return toMs(b.createdAt) - toMs(a.createdAt);
    });

    sortedLectures.forEach((l) => {
      const belongsToProgram =
        l.programId === program.id ||
        l.programSlug === program.slug ||
        (l.seriesId && seriesIds.has(l.seriesId));

      if (belongsToProgram) {
        if (l.duration <= 180) {
          shortCount++;
        } else {
          lectureCount++;
          // Pick a lecture with YouTube URL as featured
          if (!featuredLecture && l.youtubeUrl) {
            featuredLecture = l;
          }
        }
      }
    });

    return {
      program,
      contentCounts: { lectures: lectureCount, shorts: shortCount, series: seriesForProgram.length },
      featuredLecture,
    };
  }, [isLoading, allPrograms, allLectures, allSeries, slug]);

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
      <main className="container mx-auto px-6 py-10" dir="rtl">
        {children}
      </main>
    </div>
  );
}
