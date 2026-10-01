'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Headphones, ExternalLink } from 'lucide-react';
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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-full group cursor-pointer flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black/40 border border-white/5">
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
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
            <Clock className="w-3 h-3 text-white/80" />
            <span>{formatDuration(lecture.duration)}</span>
          </div>
        )}

        {/* Video/Audio indicator */}
        <div
          className={cn(
            'absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-md',
            videoId
              ? 'bg-red-600 border-red-500/40 text-white'
              : 'bg-primary/80 border-primary/50 text-primary-foreground'
          )}
        >
          {videoId && <Play className="w-2.5 h-2.5 fill-white text-white rotate-180" />}
          <span>{videoId ? 'فيديو' : '🎧 صوت'}</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-1 space-y-1.5 text-right">
        <h4 className="font-bold text-sm md:text-[15px] leading-snug line-clamp-2 text-white group-hover:text-primary transition-colors">
          {lecture.title}
        </h4>
        {lecture.programName && (
          <p className="text-xs text-white/50 font-medium flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-white/40" />
            <span>{lecture.programName}</span>
          </p>
        )}
      </div>

      {/* Clickable link overlay */}
      <Link
        href={`/lectures/${lecture.slug}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={lecture.title}
      />
    </motion.div>
  );
}

function SingleStrip({ strip }: { strip: FeaturedStrip }) {
  const [showAll, setShowAll] = useState(false);

  if (!strip.lectures || strip.lectures.length === 0) return null;

  const hasMore = strip.lectures.length > 4;
  const displayLectures = showAll ? strip.lectures : strip.lectures.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Strip Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {/* Accent line */}
            <div
              className="w-1.5 h-7 rounded-full shrink-0"
              style={{ background: strip.accentColor }}
            />
            <div>
              <h3 className="text-xl md:text-2xl font-black font-headline tracking-tight text-white">
                {strip.title}
              </h3>
              {strip.subtitle && (
                <p className="text-xs text-white/50 font-medium mt-0.5">
                  {strip.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {strip.viewAllHref ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-white/60 hover:text-primary hover:bg-white/5 rounded-xl gap-1.5"
            >
              <Link href={strip.viewAllHref}>
                <span>عرض الكل</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          ) : hasMore ? (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-bold text-white/60 hover:text-primary px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              {showAll ? 'عرض أقل' : `عرض المزيد (${strip.lectures.length - 4})`}
            </button>
          ) : null}
        </div>
      </div>

      {/* Responsive 4-Column Grid: perfectly aligned edge-to-edge */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
        dir="rtl"
      >
        {displayLectures.map((lecture) => (
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
