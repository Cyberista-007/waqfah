'use client';

import React, { useEffect, useState } from 'react';
import { Tv } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

const OPTIMIZABLE_HOSTS = new Set([
  'yt3.ggpht.com',
  'yt3.googleusercontent.com',
  'lh3.googleusercontent.com',
  'i.ytimg.com',
  'img.youtube.com',
]);

function getNextImageFallbackUrl(src: string): string | null {
  try {
    const parsed = new URL(src);
    if (OPTIMIZABLE_HOSTS.has(parsed.hostname)) {
      return `/_next/image?url=${encodeURIComponent(src)}&w=384&q=80`;
    }
  } catch {
    // Ignore relative or invalid URLs
  }
  return null;
}

interface ProgramArtworkProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  compactFallback?: boolean;
}

/**
 * Renders program/channel artwork with `no-referrer`, automatic `/_next/image` retry
 * for YouTube/Google CDNs if blocked by the browser, and a clean tile fallback if unavailable.
 */
export function ProgramArtwork({
  src,
  alt,
  className,
  fallbackText,
  compactFallback = false,
}: ProgramArtworkProps) {
  const [stage, setStage] = useState<'direct' | 'proxy' | 'failed'>('direct');

  useEffect(() => {
    setStage('direct');
  }, [src]);

  const resolvedSrc =
    stage === 'direct'
      ? src
      : stage === 'proxy' && src
      ? getNextImageFallbackUrl(src)
      : null;

  if (!resolvedSrc || stage === 'failed') {
    return (
      <div
        className={cn(
          'h-full w-full flex flex-col items-center justify-center bg-muted/80 text-foreground text-center',
          compactFallback ? 'p-2' : 'p-4'
        )}
      >
        <Tv className={cn('text-primary', compactFallback ? 'w-5 h-5 mb-1' : 'w-7 h-7 mb-2')} />
        <span
          className={cn(
            'font-headline font-black line-clamp-2 leading-snug',
            compactFallback ? 'text-[10px]' : 'text-sm'
          )}
        >
          {compactFallback ? getInitials(fallbackText || alt) : fallbackText || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (stage === 'direct' && src && getNextImageFallbackUrl(src)) {
          setStage('proxy');
        } else {
          setStage('failed');
        }
      }}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
