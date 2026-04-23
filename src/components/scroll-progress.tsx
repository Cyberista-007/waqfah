'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gradient-mid, var(--primary))), hsl(var(--gradient-end, var(--primary))))',
        boxShadow: '0 0 8px hsl(var(--primary) / 0.8), 0 0 20px hsl(var(--primary) / 0.4)',
      }}
    />
  );
}
