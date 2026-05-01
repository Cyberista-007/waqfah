'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stars, X } from 'lucide-react';

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  brightness: number;
}

const COLORS = ['255,255,255', '180,210,255', '255,230,180', '200,240,255'];

function createStars(w: number, h: number, count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.6 + 0.4,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 1.2 + 0.5,
    brightness: Math.random() * 0.5 + 0.3,
  }));
}

export function SeerahStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const configRef = useRef({ density: 400, brightness: 0.85 });

  const [density, setDensity] = useState(400);
  const [brightness, setBrightness] = useState(85);
  const [showPanel, setShowPanel] = useState(false);

  // Build / rebuild stars
  const rebuild = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    starsRef.current = createStars(c.width, c.height, configRef.current.density);
  }, []);

  // Resize → keep canvas = viewport
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const onResize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      rebuild();
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [rebuild]);

  // Animation loop
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    let t0 = performance.now();

    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      const cfg = configRef.current;

      // Background
      ctx.clearRect(0, 0, c.width, c.height);
      const bg = ctx.createRadialGradient(c.width / 2, c.height * 0.6, 0, c.width / 2, c.height * 0.6, c.height * 1.2);
      bg.addColorStop(0, '#06090f');
      bg.addColorStop(0.5, '#02050a');
      bg.addColorStop(1, '#010204');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, c.width, c.height);

      // Stars
      for (const s of starsRef.current) {
        const osc = Math.sin(t * s.speed + s.phase);          // -1..1
        const alpha = (s.brightness + osc * 0.4) * cfg.brightness; // twinkle
        const a = Math.max(0, Math.min(1, alpha));
        const colorIdx = Math.floor((s.x + s.y) % COLORS.length);

        // soft glow for bigger stars
        if (s.r > 1.1) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
          g.addColorStop(0, `rgba(${COLORS[colorIdx]},${(a * 0.6).toFixed(3)})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // solid core
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgb(${COLORS[colorIdx]})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleDensity = (v: number) => {
    setDensity(v);
    configRef.current.density = v;
    rebuild();
  };

  const handleBrightness = (v: number) => {
    setBrightness(v);
    configRef.current.brightness = v / 100;
    // No rebuild needed, loop reads config live
  };

  const applyPreset = (d: number, b: number) => {
    handleDensity(d);
    handleBrightness(b);
  };

  return (
    <>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          display: 'block',
          width: '100vw',
          height: '100vh',
        }}
      />

      {/* Control button */}
      <motion.button
        onClick={() => setShowPanel(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ zIndex: 110 }}
        className="fixed bottom-6 left-6 flex items-center gap-2 px-4 py-2.5 rounded-full
          bg-black/50 border border-white/15 backdrop-blur-xl text-white/70 hover:text-white
          hover:border-white/30 hover:bg-black/70 transition-all duration-300 shadow-xl text-sm font-bold"
      >
        <Stars className="w-4 h-4 text-amber-400" />
        <span>سماء النجوم</span>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ zIndex: 110 }}
            className="fixed bottom-20 left-6 w-72 rounded-3xl
              bg-black/75 border border-white/10 backdrop-blur-3xl p-6
              shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Stars className="w-4 h-4 text-amber-400" />
                <span className="text-white font-black text-sm">إعدادات السماء</span>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white/60" />
              </button>
            </div>

            {/* Density */}
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-white/50 text-xs font-bold uppercase tracking-widest">كثافة النجوم</span>
                <span className="text-amber-400 font-black text-sm">{density}</span>
              </div>
              <input type="range" min={50} max={1200} step={25} value={density}
                onChange={e => handleDensity(+e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(251,191,36,0.9)]"
                style={{ background: `linear-gradient(to right,#f59e0b ${((density-50)/1150)*100}%,rgba(255,255,255,0.1) 0%)` }}
              />
              <div className="flex justify-between mt-1 text-[10px] text-white/25">
                <span>قليلة</span><span>مجرة</span>
              </div>
            </div>

            {/* Brightness */}
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-white/50 text-xs font-bold uppercase tracking-widest">شدة السطوع</span>
                <span className="text-blue-400 font-black text-sm">{brightness}%</span>
              </div>
              <input type="range" min={10} max={100} step={5} value={brightness}
                onChange={e => handleBrightness(+e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(96,165,250,0.9)]"
                style={{ background: `linear-gradient(to right,#60a5fa ${brightness}%,rgba(255,255,255,0.1) 0%)` }}
              />
              <div className="flex justify-between mt-1 text-[10px] text-white/25">
                <span>خافتة</span><span>ساطعة</span>
              </div>
            </div>

            {/* Presets */}
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2 font-bold">إعدادات جاهزة</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { label: '🌙 هادئة',   d: 120,  b: 40 },
                  { label: '⭐ طبيعية',  d: 400,  b: 85 },
                  { label: '🌌 مجرة',    d: 1000, b: 100 },
                ] as const).map(p => (
                  <button key={p.label}
                    onClick={() => applyPreset(p.d, p.b)}
                    className="py-2 rounded-xl bg-white/5 border border-white/10 text-white/60
                      hover:bg-white/10 hover:text-white hover:border-amber-400/40
                      text-xs font-bold transition-all duration-200"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
