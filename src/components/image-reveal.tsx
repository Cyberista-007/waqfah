'use client';

import { useState } from 'react';
import NextImage, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

type ImageRevealProps = ImageProps & {
  wrapperClassName?: string;
};

/**
 * Drop-in replacement for next/image with a blur-to-sharp reveal on load.
 * Usage: <ImageReveal src="..." alt="..." fill />
 */
export function ImageReveal({ className, wrapperClassName, onLoad, ...props }: ImageRevealProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-white/5', wrapperClassName)}>
      <NextImage
        {...props}
        className={cn(
          'transition-all duration-1000 ease-out',
          loaded
            ? 'blur-0 scale-100 opacity-100'
            : 'blur-md scale-105 opacity-80',
          className
        )}
        onLoad={() => setLoaded(true)}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
}
