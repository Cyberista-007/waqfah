'use client';

import React, { useEffect, useState } from 'react';
import { Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaThumbnailProps {
  src?: string;
  videoId?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackTitle?: string;
}

/**
 * Renders lecture/short thumbnails with `no-referrer`, automatic fallback to `mqdefault.jpg`
 * when YouTube `hqdefault.jpg` fails, and a clean themed placeholder on final error.
 */
export function MediaThumbnail({
  src,
  videoId,
  alt,
  className,
  priority = false,
  fallbackTitle,
}: MediaThumbnailProps) {
  const [stage, setStage] = useState<'primary' | 'secondary' | 'failed'>('primary');

  useEffect(() => {
    setStage('primary');
  }, [src, videoId]);

  const secondarySrc = videoId
    ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
    : null;

  const resolvedSrc =
    stage === 'primary'
      ? src
      : stage === 'secondary' && secondarySrc && secondarySrc !== src
      ? secondarySrc
      : null;

  if (!resolvedSrc || stage === 'failed') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center">
        <Clapperboard className="w-7 h-7 text-primary/70 mb-2 shrink-0" />
        <span className="text-xs font-bold text-foreground/80 line-clamp-2 leading-snug">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (stage === 'primary' && secondarySrc && secondarySrc !== src) {
          setStage('secondary');
        } else {
          setStage('failed');
        }
      }}
      className={cn('absolute inset-0 h-full w-full object-cover', className)}
    />
  );
}
