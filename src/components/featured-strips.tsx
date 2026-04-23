'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Clock, Headphones, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { getVideoIdFromUrl, formatDuration } from '@/lib/utils';
import type { Lecture } from '@/lib/types';

interface FeaturedStrip {
  title: string;
  subtitle?: string;
  accentColor: string;
  lectures: Lecture[];
  viewAllHref?: string;
}

interface FeaturedStripsProps {
  strips: FeaturedStrip[];
}

function StripCard({ lecture, accentColor }: { lecture: Lecture; accentColor: string }) {
  const { playTrack, playIframe } = useAudioPlayer();
  const [isHovered, setIsHovered] = useState(false);

  const videoId = getVideoIdFromUrl(lecture.youtubeUrl);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : `https://picsum.photos/seed/${lecture.slug}/400/225`;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (videoId) {
      playIframe({
        type: 'youtube',
        src: videoId,
        title: lecture.title,
        lectureId: lecture.id,
        seriesId: lecture.seriesId,
      });
    } else if (lecture.audioSrc) {
      playTrack({
        id: lecture.id,
        title: lecture.title,
        audioSrc: lecture.audioSrc,
        imageId: lecture.imageId,
        seriesId: lecture.seriesId,
        seriesSlug: lecture.seriesSlug,
        seriesTitle: lecture.seriesTitle,
        slug: lecture.slug,
        programName: lecture.programName,
      });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative flex-shrink-0 w-[260px] md:w-[300px] group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black/40">
        <Image
          src={thumbnailUrl}
          alt={lecture.title}
          fill
          className={cn(
            'object-cover transition-all duration-700',
            isHovered ? 'scale-110 brightness-75' : 'scale-100 brightness-90'
          )}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play Button */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <button
                onClick={handlePlay}
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/20 transition-all',
                  'bg-white/20 hover:bg-white/30 hover:scale-110'
                )}
                aria-label={`تشغيل: ${lecture.title}`}
              >
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Duration badge */}
        {lecture.duration > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">
            <Clock className="w-2.5 h-2.5" />
            {formatDuration(lecture.duration)}
          </div>
        )}

        {/* Video/Audio indicator */}
        <div
          className={cn(
            'absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full border',
            videoId
              ? 'bg-red-600/80 border-red-500/50 text-white'
              : 'bg-primary/80 border-primary/50 text-primary-foreground'
          )}
        >
          {videoId ? '▶ فيديو' : '🎧 صوت'}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-1 space-y-1">
        <h4 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {lecture.title}
        </h4>
        {lecture.programName && (
          <p className="text-[11px] text-muted-foreground font-medium opacity-70 flex items-center gap-1">
            <Headphones className="w-3 h-3" />
            {lecture.programName}
          </p>
        )}
      </div>

      {/* Clickable link overlay */}
      <Link
        href={`/lectures/${lecture.slug}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={lecture.title}
        onClick={(e) => {
          // Allow navigation but also support direct play
        }}
      />
    </motion.div>
  );
}

function SingleStrip({ strip }: { strip: FeaturedStrip }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  if (!strip.lectures || strip.lectures.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Strip Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {/* Accent line */}
            <div
              className="w-1 h-8 rounded-full shrink-0"
              style={{ background: strip.accentColor }}
            />
            <div>
              <h3 className="text-xl md:text-2xl font-black font-headline tracking-tight">
                {strip.title}
              </h3>
              {strip.subtitle && (
                <p className="text-xs text-muted-foreground font-medium opacity-70 mt-0.5">
                  {strip.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Scroll buttons */}
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110 text-muted-foreground hover:text-foreground"
            aria-label="التالي"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110 text-muted-foreground hover:text-foreground"
            aria-label="السابق"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {strip.viewAllHref && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-muted-foreground hover:text-primary rounded-xl gap-1.5"
            >
              <Link href={strip.viewAllHref}>
                <span>عرض الكل</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Cards Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 no-scrollbar scroll-smooth"
        dir="rtl"
      >
        {strip.lectures.map((lecture) => (
          <StripCard
            key={lecture.id}
            lecture={lecture}
            accentColor={strip.accentColor}
          />
        ))}
      </div>
    </div>
  );
}

export function FeaturedStrips({ strips }: FeaturedStripsProps) {
  if (!strips || strips.length === 0) return null;

  return (
    <section className="space-y-12">
      {strips.map((strip, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
        >
          <SingleStrip strip={strip} />
        </motion.div>
      ))}
    </section>
  );
}
