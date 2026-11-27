'use client';

import { useEffect, useRef } from 'react';

export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const el = barRef.current;
      if (!el) return;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      el.style.transform = `scaleX(${progress})`;
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left pointer-events-none will-change-transform"
      style={{
        transform: 'scaleX(0)',
        background:
          'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gradient-mid, var(--primary))), hsl(var(--gradient-end, var(--primary))))',
      }}
    />
  );
}
