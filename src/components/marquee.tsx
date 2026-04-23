'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  speed?: number;
  className?: string;
}

/**
 * A cinematic horizontal marquee for logos, titles, or messages.
 */
export function Marquee({
  children,
  direction = 'left',
  pauseOnHover = true,
  speed = 40,
  className,
}: MarqueeProps) {
  return (
    <div className={cn('group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row', className)}>
      <motion.div
        className="flex shrink-0 justify-around [gap:var(--gap)] min-w-full"
        animate={{
          x: direction === 'left' ? [0, '-50%'] : ['-50%', 0],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
        // Pause on hover via CSS class on parent + selection
        style={{
          display: 'flex',
          animationPlayState: pauseOnHover ? 'paused' : 'running',
        }}
      >
        {/* Render children twice for seamless loop */}
        <div className="flex shrink-0 justify-around [gap:var(--gap)] items-center">
            {children}
        </div>
        <div className="flex shrink-0 justify-around [gap:var(--gap)] items-center">
            {children}
        </div>
        <div className="flex shrink-0 justify-around [gap:var(--gap)] items-center">
            {children}
        </div>
        <div className="flex shrink-0 justify-around [gap:var(--gap)] items-center">
            {children}
        </div>
      </motion.div>
    </div>
  );
}
