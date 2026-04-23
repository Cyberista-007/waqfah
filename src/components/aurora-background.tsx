'use client';

import { useEffect, useRef } from 'react';

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /** Parse a CSS HSL variable like "217 91% 60%" → [h, s, l] */
    const readHSL = (varName: string): [number, number, number] => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      if (!raw) return [217, 91, 60];
      const parts = raw.split(/\s+/).map(p => parseFloat(p.replace(/[^0-9.]/g, '')) || 0);
      return [parts[0] ?? 217, parts[1] ?? 91, parts[2] ?? 60];
    };

    const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
      h = ((h % 360) + 360) % 360;
      s = Math.max(0, Math.min(100, s));
      l = Math.max(0, Math.min(100, l));
      s /= 100; l /= 100;
      const k = (n: number) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
    };

    const draw = () => {
      t += 0.002;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const [ph, ps, pl] = readHSL('--primary');
      const [ah, as_, al] = readHSL('--accent');
      const compH = (ph + 60) % 360;

      const [r1, g1, b1] = hslToRgb(ph, ps, pl);
      const [r2, g2, b2] = hslToRgb(ah, as_, al);
      const [r3, g3, b3] = hslToRgb(compH, ps * 0.7, pl * 0.85);

      const blobs = [
        { x: 0.15 + Math.sin(t) * 0.18,         y: 0.25 + Math.cos(t * 0.6) * 0.22,  r: 0.45, rgb: [r1, g1, b1] as [number, number, number], alpha: 0.09 },
        { x: 0.75 + Math.cos(t * 0.7) * 0.16,   y: 0.2  + Math.sin(t * 0.8) * 0.18,  r: 0.38, rgb: [r2, g2, b2] as [number, number, number], alpha: 0.07 },
        { x: 0.45 + Math.sin(t * 0.9) * 0.22,   y: 0.75 + Math.cos(t * 0.5) * 0.12,  r: 0.50, rgb: [r3, g3, b3] as [number, number, number], alpha: 0.06 },
        { x: 0.85 + Math.cos(t * 1.1) * 0.10,   y: 0.65 + Math.sin(t * 0.7) * 0.15,  r: 0.30, rgb: [r1, g1, b1] as [number, number, number], alpha: 0.05 },
      ];

      blobs.forEach(blob => {
        const gx = canvas.width  * blob.x;
        const gy = canvas.height * blob.y;
        const gr = Math.max(canvas.width, canvas.height) * blob.r;
        const [cr, cg, cb] = blob.rgb;
        if (isNaN(cr) || isNaN(cg) || isNaN(cb)) return;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        grad.addColorStop(0,   `rgba(${cr},${cg},${cb},${blob.alpha})`);
        grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${blob.alpha * 0.3})`);
        grad.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
