'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Headphones, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

function StripCard({ lecture }: { lecture: Lecture }) {
  const { playTrack, playIframe } = useAudioPlayer();

  const videoId = getVideoIdFromUrl(lecture.youtubeUrl);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://picsum.photos/seed/${lecture.slug}/400/225`;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <article className="relative w-full group flex flex-col">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted border border-border/70">
        <Link
          href={`/lectures/${lecture.slug}`}
          className="absolute inset-0 z-10"
          aria-label={lecture.title}
        />
        <Image
          src={thumbnailUrl}
          alt={lecture.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20 pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={handlePlay}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-900/90 hover:bg-primary border border-white/25 text-white transition-colors cursor-pointer shadow-md"
            aria-label={`تشغيل: ${lecture.title}`}
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>

        {lecture.duration > 0 && (
          <div
            className="absolute bottom-2.5 left-2.5 z-20 text-[11px] font-bold px-2.5 py-0.5 rounded-lg tabular-nums pointer-events-none shadow-sm"
            style={{
              backgroundColor: 'rgba(9, 9, 11, 0.84)',
              color: '#ffffff',
              borderRadius: '8px',
            }}
          >
            {formatDuration(lecture.duration)}
          </div>
        )}

        {!videoId && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-primary text-primary-foreground pointer-events-none">
            <span>🎧 صوت</span>
          </div>
        )}
      </div>

      <div className="mt-3 px-0.5 space-y-1 text-right">
        <h4 className="font-bold text-sm md:text-[15px] leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          <Link href={`/lectures/${lecture.slug}`}>{lecture.title}</Link>
        </h4>
        {lecture.programName && (
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
            <span className="truncate">{lecture.programName}</span>
          </p>
        )}
      </div>
    </article>
  );
}

function SingleStrip({ strip }: { strip: FeaturedStrip }) {
  const [showAll, setShowAll] = useState(false);

  if (!strip.lectures || strip.lectures.length === 0) return null;

  const hasMore = strip.lectures.length > 4;
  const displayLectures = showAll ? strip.lectures : strip.lectures.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-7 rounded-full shrink-0"
            style={{ background: strip.accentColor }}
          />
          <div>
            <h3 className="text-xl md:text-2xl font-black font-headline tracking-tight text-foreground">
              {strip.title}
            </h3>
            {strip.subtitle && (
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {strip.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {strip.viewAllHref ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-muted-foreground hover:text-primary rounded-xl gap-1.5"
            >
              <Link href={strip.viewAllHref}>
                <span>عرض الكل</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          ) : hasMore ? (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-bold text-muted-foreground hover:text-primary px-3 py-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
            >
              {showAll ? 'عرض أقل' : `عرض المزيد (${strip.lectures.length - 4})`}
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
        dir="rtl"
      >
        {displayLectures.map((lecture) => (
          <StripCard key={lecture.id} lecture={lecture} />
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
        <SingleStrip key={idx} strip={strip} />
      ))}
    </section>
  );
}
