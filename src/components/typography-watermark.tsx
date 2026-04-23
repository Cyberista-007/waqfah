'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypographyWatermarkProps {
  text: string;
  className?: string;
  /** Which edge to anchor the text to */
  side?: 'left' | 'right' | 'center';
}

/**
 * Oversized background text that drifts slowly on scroll.
 * Wrap any `relative` / `overflow-hidden` container with this inside.
 * Already uses very low opacity (controlled via CSS .typography-watermark class).
 */
export function TypographyWatermark({
  text,
  className,
  side = 'right',
}: TypographyWatermarkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    side === 'right' ? ['0%', '-6%'] : side === 'left' ? ['0%', '6%'] : ['0%', '0%']
  );

  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 0.035, 0.035, 0]);

  return (
    <div
      ref={ref}
      className={cn('absolute inset-0 overflow-hidden pointer-events-none select-none', className)}
      aria-hidden="true"
    >
      <motion.span
        style={{ x, opacity }}
        className={cn(
          'typography-watermark',
          side === 'right' && 'right-0',
          side === 'left' && 'left-0',
          side === 'center' && 'left-1/2 -translate-x-1/2',
        )}
      >
        {text}
      </motion.span>
    </div>
  );
}
