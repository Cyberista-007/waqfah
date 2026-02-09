
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MoreVertical } from 'lucide-react';
import type { Lecture } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/images';
import { formatViews } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ShortCardProps {
  lecture: Lecture;
  index?: number;
}

function getYoutubeVideoId(url: string | undefined): string | null {
    if (!url) return null;
    try {
      const videoUrl = new URL(url);
      if (videoUrl.hostname === 'youtu.be') {
        return videoUrl.pathname.slice(1);
      }
      if (videoUrl.hostname.includes('youtube.com')) {
        const videoId = videoUrl.searchParams.get('v');
        if (videoId) {
          return videoId;
        }
      }
    } catch (error) {
      console.error("Invalid YouTube URL", error);
      return null;
    }
    return null;
  }
  

export function ShortCard({ lecture, index = 0 }: ShortCardProps) {
  const videoId = getYoutubeVideoId(lecture.youtubeUrl);
  const placeholder = getPlaceholderImage(lecture.imageId);
  const imageUrl = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/270/480`;

  return (
    <div className="w-full animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
      <Link href={`/lectures/${lecture.slug}`} className="group">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={imageUrl}
            alt={lecture.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 image-theme-filter"
            data-ai-hint={placeholder?.imageHint || 'video thumbnail'}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        <div className="mt-2 px-1">
            <div className="flex justify-between items-start gap-2">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                    {lecture.title}
                </h3>
                <button className="h-6 w-6 flex-shrink-0 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>
            {lecture.youtubeViewCount && lecture.youtubeViewCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                    {formatViews(lecture.youtubeViewCount)} مشاهدة
                </p>
            )}
        </div>
      </Link>
    </div>
  );
}
