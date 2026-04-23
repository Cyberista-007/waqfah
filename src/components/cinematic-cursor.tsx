'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CinematicCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const springConfig = { damping: 25, stiffness: 350, mass: 0.5 };
  const trailConfig = { damping: 50, stiffness: 150, mass: 1 };

  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);
  const trailX = useSpring(cursorX, trailConfig);
  const trailY = useSpring(cursorY, trailConfig);

  useEffect(() => {
    // Only on non-touch devices (Optional: relaxed for touch-enabled desktops)
    // if (window.matchMedia('(pointer: coarse)').matches) return;

    // Hide native cursor globally
    document.body.classList.add('cursor-cinematic');

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        const style = window.getComputedStyle(el);
        const isClickable =
          style.cursor === 'pointer' ||
          el.tagName === 'BUTTON' ||
          el.tagName === 'A' ||
          el.closest('button') ||
          el.closest('a') ||
          el.getAttribute('role') === 'button';
        setIsPointer(!!isClickable);
      }
    };

    const hide = () => setIsHidden(true);
    const show = () => setIsHidden(false);
    const down = () => setIsClicking(true);
    const up = () => setIsClicking(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', hide);
    window.addEventListener('mouseenter', show);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    return () => {
      document.body.classList.remove('cursor-cinematic');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseleave', hide);
      window.removeEventListener('mouseenter', show);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Trailing glow */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-screen"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isPointer ? 64 : 40,
          height: isPointer ? 64 : 40,
          opacity: isHidden ? 0 : isPointer ? 0.15 : 0.08,
          backgroundColor: isPointer ? 'hsl(var(--primary))' : 'hsl(var(--primary))',
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          backgroundColor: 'hsl(var(--primary))',
        }}
        animate={{
          width: isClicking ? 6 : isPointer ? 8 : 8,
          height: isClicking ? 6 : isPointer ? 8 : 8,
          opacity: isHidden ? 0 : 1,
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Ring when hovering */}
      {isPointer && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border-2"
          style={{
            x: springX,
            y: springY,
            translateX: '-50%',
            translateY: '-50%',
            borderColor: 'hsl(var(--primary))',
          }}
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{
            width: 36,
            height: 36,
            opacity: isHidden ? 0 : 0.6,
            scale: isClicking ? 0.9 : 1,
          }}
          exit={{ width: 0, height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </>
  );
}
