'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** Strength: 0.2 = subtle, 0.5 = strong */
  strength?: number;
  /** Radius in px for magnetic activation */
  radius?: number;
  disabled?: boolean;
}

export default function Magnetic({
  children,
  className,
  strength = 0.35,
  radius = 80,
  disabled = false,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const handleMouse = (e: React.MouseEvent) => {
    if (disabled) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const dist = Math.hypot(clientX - centerX, clientY - centerY);

    if (dist < radius) {
      setPos({
        x: (clientX - centerX) * strength,
        y: (clientY - centerY) * strength,
      });
      setIsActive(true);
    }
  };

  const reset = () => {
    setPos({ x: 0, y: 0 });
    setIsActive(false);
  };

  return (
    <motion.div
      ref={ref}
      className={cn('relative inline-block', className)}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y, scale: isActive ? 1.04 : 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}
