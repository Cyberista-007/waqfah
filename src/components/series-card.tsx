'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  MessageSquare,
  Play,
  Podcast,
} from 'lucide-react';

import { useCollection } from '@/firebase';
import { getPlaceholderImage } from '@/lib/images';
import type { Lecture, Series } from '@/lib/types';
import { cn, getVideoIdFromUrl } from '@/lib/utils';

interface SeriesCardProps {
  series: Series;
  index?: number;
  pinnedMessage?: string;
}

const SeriesCardComponent = ({ series, pinnedMessage }: SeriesCardProps) => {
  const placeholder = getPlaceholderImage(series.imageId);
  const shouldFetchThumb = !placeholder?.imageUrl;
  const [imgFailed, setImgFailed] = useState(false);

  const { data: lectures } = useCollection<Lecture>(
    shouldFetchThumb ? 'lectures' : null,
    {
      where: ['seriesId', '==', series.id],
      limit: 1,
      once: true,
    }
  );

  const firstLecture = lectures?.[0];
  const videoId = firstLecture ? getVideoIdFromUrl(firstLecture.youtubeUrl) : null;
  const thumbnailUrl = !imgFailed
    ? placeholder?.imageUrl ||
      (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '')
    : '';

  const lectureCount = series.lectureCount || 0;

  return (
    <Link
      href={`/series/${series.slug}`}
      dir="rtl"
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      <article
        className={cn(
          'relative h-full flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm',
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-lg'
        )}
      >
        {/* Top Playlist Cover Area */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted border-b border-border/60">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={series.title}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-card p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary mb-2">
                <Layers className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                سلسلة علمية
              </span>
            </div>
          )}

          {/* Subtle Bottom Scrim for Pill Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

          {/* Top Status Pill */}
          <div className="absolute top-3 right-3 z-10">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md shadow-sm',
                series.isCompleted
                  ? 'bg-emerald-600/90 text-white'
                  : 'bg-black/65 text-white border border-white/15'
              )}
            >
              {series.isCompleted ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3 text-primary" />
              )}
              <span>{series.isCompleted ? 'مكتملة' : 'قيد النشر'}</span>
            </span>
          </div>

          {/* Bottom Episode Count Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 px-2.5 py-1 text-xs font-black text-white shadow-sm">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>{lectureCount.toLocaleString('ar-EG')} محاضرة</span>
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 gap-4">
          <div className="space-y-2">
            {series.programName && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary">
                <Podcast className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{series.programName}</span>
              </div>
            )}

            <h3 className="font-headline text-base sm:text-lg font-black text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {series.title}
            </h3>

            <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.4rem]">
              {series.description ||
                'سلسلة علمية ودعوية منظمة تضم مجموعة مترابطة من الدروس والمحاضرات.'}
            </p>

            {pinnedMessage && (
              <div className="mt-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 flex items-start gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-primary line-clamp-2 leading-relaxed">
                  {pinnedMessage}
                </p>
              </div>
            )}
          </div>

          {/* Footer Action Row */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Play className="h-3.5 w-3.5 text-primary fill-primary/20" />
              <span>{lectureCount.toLocaleString('ar-EG')} حلقة</span>
            </span>

            <span className="inline-flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
              <span>تصفح السلسلة</span>
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export const SeriesCard = memo(SeriesCardComponent);
