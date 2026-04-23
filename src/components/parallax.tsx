'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  /** How much the element moves relative to scroll. 0.1 = subtle, 0.5 = strong */
  speed?: number;
  direction?: 'up' | 'down';
}

/**
 * Wraps children in a scroll-based parallax container.
 * The parent must have overflow-hidden for the effect to be visible.
 */
export function Parallax({
  children,
  className,
  speed = 0.15,
  direction = 'up',
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const range = speed * 100;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'up' ? [range, -range] : [-range, range]
  );

  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
