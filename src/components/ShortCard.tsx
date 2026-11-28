
'use client';

import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { MediaThumbnail } from './media-thumbnail';
import type { Lecture } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/images';
import { formatViews, getVideoIdFromUrl } from '@/lib/utils';
import { useAudioPlayer } from './audio-player-provider';

interface ShortCardProps {
  lecture: Lecture;
  index?: number;
}

export function ShortCard({ lecture, index = 0 }: ShortCardProps) {
  const { playIframe } = useAudioPlayer();
  const videoId = getVideoIdFromUrl(lecture.youtubeUrl);
  const placeholder = getPlaceholderImage(lecture.imageId);
  const imageUrl = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/270/480`;

  const handlePlay = () => {
    if (videoId) {
        playIframe({ type: 'youtube', src: videoId, title: lecture.title, lectureId: lecture.id, seriesId: lecture.seriesId, programName: lecture.programName, slug: lecture.slug });
    }
  };

  return (
    <div className="w-full animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
      <div onClick={handlePlay} className="group cursor-pointer">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-muted">
          <MediaThumbnail
            src={imageUrl}
            videoId={videoId}
            alt={lecture.title}
            fallbackTitle={lecture.title}
            className="transition-transform duration-300 group-hover:scale-105 image-theme-filter"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        </div>
      </div>
      <div className="mt-2 px-1">
          <div className="flex justify-between items-start gap-2">
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                <Link href={`/lectures/${lecture.slug}`} className="hover:underline">
                  {lecture.title}
                </Link>
              </h3>
              <button className="h-6 w-6 flex-shrink-0 text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
              </button>
          </div>
          {lecture.youtubeViewCount && lecture.youtubeViewCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                  {formatViews(lecture.youtubeViewCount)}
              </p>
          )}
      </div>
    </div>
  );
}
