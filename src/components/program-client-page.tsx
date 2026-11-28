'use client';

import type { Program, Lecture, Series } from '@/lib/types';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import { ArrowLeft, Play, Sparkles, Clock, ChevronLeft, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShortsCarousel } from '@/components/ShortsCarousel';
import { motion, Variants } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn, getVideoIdFromUrl } from '@/lib/utils';
import { Html5Player } from '@/components/html5-player';
import { useCollection, useUser } from '@/firebase';
import type { ListenHistoryItem, Playlist } from '@/lib/types';

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  index = 0,
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  index?: number;
}) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tighter leading-none">{title}</h2>
        {subtitle && <p className="text-zinc-500 text-sm font-medium">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
        >
          <span>عرض الكل</span>
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

export function ProgramClientPage({ 
    program, 
    lectures, 
    series 
}: { 
    program: Program, 
    lectures: Lecture[], 
    series: Series[] 
}) {
  const { shorts, regularLectures } = useMemo(() => {
    const shortsArr: Lecture[] = [];
    const regularArr: Lecture[] = [];
    lectures.forEach((l) => {
      if (l.duration <= 180) shortsArr.push(l);
      else regularArr.push(l);
    });

    return { shorts: shortsArr, regularLectures: regularArr };
  }, [lectures]);

  // Featured lecture (latest with YouTube URL)
  const featuredLecture = useMemo(
    () => regularLectures.find((l) => !!l.youtubeUrl) || null,
    [regularLectures]
  );
  const featuredVideoId = featuredLecture ? getVideoIdFromUrl(featuredLecture.youtubeUrl) : null;

  const { user } = useUser();
  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory } = useCollection<ListenHistoryItem>(listenHistoryPath);
  
  const playlistsPath = user ? `users/${user.uid}/playlists` : null;
  const { data: playlists } = useCollection<Playlist>(playlistsPath);

  const hasContent = shorts.length > 0 || regularLectures.length > 0 || series.length > 0;

  if (!hasContent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-32 border-2 border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse-subtle">
          <Sparkles className="w-9 h-9 text-primary" />
        </div>
        <p className="text-2xl font-black text-muted-foreground mb-3">لا يوجد محتوى حالياً</p>
        <p className="text-muted-foreground/80 font-medium">ترقّب الجديد قريباً من هذا البرنامج!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-20" dir="rtl">
      {/* ── FEATURED LECTURE PLAYER ── */}
      {featuredLecture && featuredVideoId && (
        <motion.section
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <SectionHeader
            title="أحدث المحاضرات"
            subtitle="ابدأ المشاهدة مباشرةً"
            index={0}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-9">
              <Html5Player
                videoId={featuredVideoId}
                title={featuredLecture.title}
                thumbnailUrl={`https://img.youtube.com/vi/${featuredVideoId}/maxresdefault.jpg`}
              />
            </div>

            <div className="lg:col-span-3 flex flex-col bg-card/40 backdrop-blur-2xl rounded-3xl border border-border/50 overflow-hidden shadow-inner h-[350px] lg:h-full">
              <div className="p-4 border-b border-border/20 bg-background/50 backdrop-blur-md z-10">
                <p className="text-xs font-black uppercase tracking-widest text-primary px-1">
                  قائمة التشغيل ({regularLectures.slice(0, 8).length} محاضرة)
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 pointer-events-auto">
              {regularLectures.slice(0, 8).map((lecture, i) => {
                const vid = getVideoIdFromUrl(lecture.youtubeUrl);
                const thumb = vid
                  ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg`
                  : `https://picsum.photos/seed/${lecture.slug}/120/68`;
                const isActive = lecture.id === featuredLecture.id;
                return (
                  <Link
                    key={lecture.id}
                    href={`/lectures/${lecture.slug}`}
                    className={cn(
                      'flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 group hover-glow border',
                      isActive
                        ? 'bg-primary/15 border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]'
                        : 'bg-transparent hover:bg-card/60 border-transparent hover:border-border/50'
                    )}
                  >
                    <div className="relative flex-shrink-0 w-28 h-16 rounded-xl overflow-hidden bg-muted">
                      <img src={thumb} alt={lecture.title} className={cn("w-full h-full object-cover transition-opacity", isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100")} />
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center transition-opacity backdrop-blur-[2px]",
                        isActive ? "opacity-100 bg-black/50" : "opacity-0 group-hover:opacity-100 bg-black/40"
                      )}>
                        <Play className={cn("w-6 h-6", isActive ? "text-primary fill-primary animate-pulse" : "text-white fill-white")} />
                      </div>
                      <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded-md backdrop-blur-md">
                        {Math.floor((lecture.duration || 0) / 60)}:{String((lecture.duration || 0) % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col justify-center h-full pt-1">
                      <p className={cn(
                        "text-sm font-bold line-clamp-2 leading-snug transition-colors",
                        isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                      )}>
                        {lecture.title}
                      </p>
                    </div>
                  </Link>
                );
              })}
              </div>
              {regularLectures.length > 8 && (
                <div className="p-3 bg-background/50 border-t border-border/20">
                  <Link
                    href={`/programs/${program.slug}/lectures`}
                    className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-primary hover:bg-primary/10 rounded-xl transition-colors btn-magnetic"
                  >
                    عرض جميع المحاضرات
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* ── SHORTS ── */}
      {shorts.length > 0 && (
        <motion.div
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <SectionHeader title="مقاطع قصيرة" subtitle={`${shorts.length} مقطع متاح`} index={1} />
          <ShortsCarousel shorts={shorts.slice(0, 12)} />
        </motion.div>
      )}

      {/* ── MORE LECTURES GRID ── */}
      {regularLectures.length > 1 && (
        <motion.section
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <SectionHeader
            title="المحاضرات"
            subtitle="اكتشف المزيد من المحتوى"
            viewAllHref={regularLectures.length > 4 ? `/programs/${program.slug}/lectures` : undefined}
            index={2}
          />
          <div className="mt-8 relative px-2 md:px-0 -my-8">
            <Carousel opts={{ align: "start", direction: "rtl", dragFree: true }} className="w-full">
              <CarouselContent className="-ml-6 py-8">
                {regularLectures.slice(featuredLecture ? 1 : 0, featuredLecture ? 11 : 10).map((l, i) => (
                  <CarouselItem key={l.id} className="pl-6 basis-auto shrink-0">
                    <div className="w-[85vw] sm:w-[320px] md:w-[340px]">
                      <LectureCard 
                        lecture={l} 
                        index={i} 
                        listenHistory={listenHistory || undefined}
                        playlists={playlists || undefined}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute -right-6 top-1/2 -translate-y-1/2 hidden md:flex scale-125 bg-background/80 backdrop-blur-md shadow-lg border-border/50" />
              <CarouselNext className="absolute -left-6 top-1/2 -translate-y-1/2 hidden md:flex scale-125 bg-background/80 backdrop-blur-md shadow-lg border-border/50" />
            </Carousel>
          </div>
        </motion.section>
      )}

      {/* ── SERIES ── */}
      {series.length > 0 && (
        <motion.section
          custom={3}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-16" />
          <SectionHeader
            title="السلاسل العلمية"
            subtitle="تصفح السلاسل الكاملة والمنظمة"
            viewAllHref={series.length > 3 ? `/programs/${program.slug}/series` : undefined}
            index={3}
          />
          <div className="mt-8 relative px-2 md:px-0 -my-8">
            <Carousel opts={{ align: "start", direction: "rtl", dragFree: true }} className="w-full">
              <CarouselContent className="-ml-6 py-8">
                {series.slice(0, 10).map((s, i) => (
                  <CarouselItem key={s.id} className="pl-6 basis-auto shrink-0">
                    <div className="w-[85vw] sm:w-[350px] md:w-[380px]">
                      <SeriesCard series={s} index={i} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute -right-6 top-1/2 -translate-y-1/2 hidden md:flex scale-125 bg-background/80 backdrop-blur-md shadow-lg border-border/50" />
              <CarouselNext className="absolute -left-6 top-1/2 -translate-y-1/2 hidden md:flex scale-125 bg-background/80 backdrop-blur-md shadow-lg border-border/50" />
            </Carousel>
          </div>
        </motion.section>
      )}
    </div>
  );
}
