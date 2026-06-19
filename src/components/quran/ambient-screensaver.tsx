'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, VolumeX, Volume2, Pause, Play, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RadioStation } from './quran-constants';

interface AmbientScreenSaverProps {
  isAmbientScreenSaver: boolean;
  setIsAmbientScreenSaver: (val: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  analyserNodeRef?: React.RefObject<AnalyserNode | null>;
  isPlayingRadio: boolean;
  currentRadioStation: RadioStation | null;
  visualizerStyle: 'columns' | 'waves' | 'particles';
  setVisualizerStyle: (style: 'columns' | 'waves' | 'particles') => void;
  isRadioBuffering: boolean;
  radioVolume: number;
  setRadioVolume: (vol: number) => void;
  handlePlayRadio: (station: RadioStation) => void;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number;
}

type AmbientTheme = 'radial' | 'sky' | 'geometry' | 'live_makkah' | 'live_madinah';

export function AmbientScreenSaver({
  isAmbientScreenSaver,
  setIsAmbientScreenSaver,
  canvasRef,
  analyserNodeRef,
  isPlayingRadio,
  currentRadioStation,
  visualizerStyle,
  setVisualizerStyle,
  isRadioBuffering,
  radioVolume,
  setRadioVolume,
  handlePlayRadio,
  sleepTimerMinutes,
  sleepTimerRemaining
}: AmbientScreenSaverProps) {
  const [ambientTheme, setAmbientTheme] = useState<AmbientTheme>('radial');
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load persisted theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('quran_ambient_theme');
      if (savedTheme) {
        setAmbientTheme(savedTheme as AmbientTheme);
      }
    }
  }, []);

  // Animation Loop for Background Canvas (Interactive Astronomy and Islamic Geometry)
  useEffect(() => {
    if (!isAmbientScreenSaver) return;
    if (ambientTheme !== 'sky' && ambientTheme !== 'geometry') return;

    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize Astronomy Theme Stars
    const stars: { x: number; y: number; r: number; baseOpacity: number; phaseOffset: number }[] = [];
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.3,
        baseOpacity: Math.random() * 0.6 + 0.2,
        phaseOffset: Math.random() * Math.PI * 2
      });
    }

    // Astronomy Shooting Stars (Meteors)
    const meteors: {
      x: number;
      y: number;
      len: number;
      speed: number;
      dx: number;
      dy: number;
      opacity: number;
    }[] = [];

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Get real audio frequencies
      let dataArray: Uint8Array | null = null;
      let bufferLength = 0;
      let average = 0;
      let hasRealData = false;

      if (analyserNodeRef?.current) {
        const analyser = analyserNodeRef.current;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray as any);

        let sum = 0;
        let count = 0;
        // Focus on mid-bass frequencies for visual energy
        const limit = Math.floor(bufferLength * 0.7);
        for (let j = 0; j < limit; j++) {
          sum += dataArray[j];
          count++;
        }
        if (count > 0) {
          average = sum / count;
          hasRealData = average > 5;
        }
      }

      // Simulation when no real data but playing
      if (!hasRealData && isPlayingRadio) {
        average = (Math.sin(phase * 1.5) + 1) * 30 + 10;
        hasRealData = true;
      }

      phase += 0.015;
      const intensity = average / 255; // Normalized (0 to 1)

      if (ambientTheme === 'sky') {
        // Space Background
        ctx.fillStyle = '#030303';
        ctx.fillRect(0, 0, width, height);

        // Draw deep galactic cloud base
        const gradCloud = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) * 0.8);
        gradCloud.addColorStop(0, `rgba(16, 185, 129, ${0.03 + intensity * 0.05})`);
        gradCloud.addColorStop(0.5, `rgba(99, 102, 241, ${0.01 + intensity * 0.03})`);
        gradCloud.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradCloud;
        ctx.fillRect(0, 0, width, height);

        // Stars pulsation
        stars.forEach(star => {
          ctx.beginPath();
          const pulse = Math.sin(phase * 2 + star.phaseOffset) * 0.15;
          const scale = 1 + intensity * 2.8 + pulse;
          const opacity = Math.min(1, Math.max(0.1, star.baseOpacity + intensity * 0.5 + pulse));
          
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.arc(star.x, star.y, star.r * scale, 0, Math.PI * 2);
          ctx.fill();
        });

        // Add Shooting Stars/Meteors (Probability scales with audio peaks)
        const meteorSpawnRate = 0.003 + intensity * 0.055;
        if (Math.random() < meteorSpawnRate && meteors.length < 4) {
          meteors.push({
            x: Math.random() * width * 0.8,
            y: Math.random() * height * 0.35,
            len: Math.random() * 90 + 50,
            speed: Math.random() * 10 + 5 + intensity * 10,
            dx: Math.random() * 2.5 + 3.5, // Move rightwards & downwards
            dy: Math.random() * 1.5 + 1.8,
            opacity: 1.0
          });
        }

        // Draw & update shooting stars
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          ctx.beginPath();
          const meteorGrad = ctx.createLinearGradient(m.x, m.y, m.x - m.dx * m.len * 0.25, m.y - m.dy * m.len * 0.25);
          meteorGrad.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`);
          meteorGrad.addColorStop(0.3, `rgba(52, 211, 153, ${m.opacity * 0.6})`);
          meteorGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
          
          ctx.strokeStyle = meteorGrad;
          ctx.lineWidth = 1.8;
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.dx * m.len * 0.2, m.y - m.dy * m.len * 0.2);
          ctx.stroke();

          // Movement
          m.x += m.dx * m.speed;
          m.y += m.dy * m.speed;
          m.opacity -= 0.025; // Fade out

          // Remove old/faded meteors
          if (m.x > width || m.y > height || m.opacity <= 0) {
            meteors.splice(i, 1);
          }
        }
      } else if (ambientTheme === 'geometry') {
        // Islamic Geometric Patterns Theme
        ctx.fillStyle = '#020617'; // Deep dark slate blue
        ctx.fillRect(0, 0, width, height);

        const cX = width / 2;
        const cY = height / 2;

        // Draw Islamic star geometries
        const drawIslamicMandala = (
          x: number,
          y: number,
          size: number,
          points: number,
          angleOffset: number,
          color: string,
          glow: boolean
        ) => {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angleOffset);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2 + intensity * 2;
          
          if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 12 + intensity * 18;
          }

          // Render star polygons
          ctx.beginPath();
          for (let i = 0; i < points * 2; i++) {
            // Alternating radius forms a sharp star
            const r = i % 2 === 0 ? size : size * 0.45;
            const angle = (i * Math.PI) / points;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        };

        const rotationSpeed = phase * 0.12;
        const baseRadius = Math.min(width, height) * 0.22;
        const sizeMultiplier = 1 + intensity * 0.32;

        // Outer pattern lines
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 16; i++) {
          const angle = (i * Math.PI) / 8 + rotationSpeed * 0.25;
          ctx.moveTo(cX, cY);
          ctx.lineTo(cX + Math.cos(angle) * baseRadius * 3, cY + Math.sin(angle) * baseRadius * 3);
        }
        ctx.stroke();

        // 1. Layer: Massive structural background pattern
        drawIslamicMandala(cX, cY, baseRadius * 1.65 * sizeMultiplier, 12, -rotationSpeed * 0.4, 'rgba(99, 102, 241, 0.12)', false);

        // 2. Layer: Middle Islamic 8-point star
        drawIslamicMandala(cX, cY, baseRadius * sizeMultiplier, 8, rotationSpeed, 'rgba(52, 211, 153, 0.45)', true);

        // 3. Layer: Inner high-energy star
        drawIslamicMandala(cX, cY, baseRadius * 0.55 * sizeMultiplier, 8, -rotationSpeed * 1.4, 'rgba(255, 255, 255, 0.7)', true);

        // 4. Center core circle
        ctx.beginPath();
        ctx.arc(cX, cY, baseRadius * 0.08 * sizeMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15 + intensity * 15;
        ctx.fill();

        // Secondary orbiting corner mandalas (4 corner geometries)
        const cornerSize = baseRadius * 0.32 * (1 + intensity * 0.12);
        const distance = baseRadius * 2.3;
        
        ctx.shadowBlur = 0; // Turn off shadow blur for corners to save performance
        drawIslamicMandala(cX - distance, cY - distance, cornerSize, 8, rotationSpeed, 'rgba(52, 211, 153, 0.15)', false);
        drawIslamicMandala(cX + distance, cY - distance, cornerSize, 8, rotationSpeed, 'rgba(52, 211, 153, 0.15)', false);
        drawIslamicMandala(cX - distance, cY + distance, cornerSize, 8, rotationSpeed, 'rgba(52, 211, 153, 0.15)', false);
        drawIslamicMandala(cX + distance, cY + distance, cornerSize, 8, rotationSpeed, 'rgba(52, 211, 153, 0.15)', false);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [ambientTheme, isAmbientScreenSaver, isPlayingRadio, analyserNodeRef]);

  return (
    <AnimatePresence>
      {isAmbientScreenSaver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] bg-[#030303] text-white flex flex-col justify-between p-8 md:p-12 overflow-hidden select-none"
          dir="rtl"
        >
          {/* 1. Default Theme: Animated Radial Light Background */}
          {ambientTheme === 'radial' && (
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.07)_0%,transparent_70%)] animate-pulse pointer-events-none z-0"
              style={{ animationDuration: '6s' }}
            />
          )}

          {/* 2. Interactive Background Canvas (Astronomy & Geometries) */}
          {(ambientTheme === 'sky' || ambientTheme === 'geometry') && (
            <canvas ref={backgroundCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
          )}

          {/* 3. Live Broadcast Feeds (Makkah & Madinah) */}
          {(ambientTheme === 'live_makkah' || ambientTheme === 'live_madinah') && (
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black">
              {/* Dim Dark Premium Vignette Overlay on top of live feed */}
              <div className="absolute inset-0 bg-black/75 z-10" />
              <iframe
                src={
                  ambientTheme === 'live_makkah'
                    ? "https://www.youtube.com/embed/live_stream?channel=UC85Xvrcy_L_0Fwz25Lh_Xsw&autoplay=1&mute=1&controls=0&loop=1&playlist=live_stream&showinfo=0&rel=0&iv_load_policy=3"
                    : "https://www.youtube.com/embed/live_stream?channel=UCB3eI_R8l2X7e6zP-X6N40g&autoplay=1&mute=1&controls=0&loop=1&playlist=live_stream&showinfo=0&rel=0&iv_load_policy=3"
                }
                className="absolute top-1/2 left-1/2 w-[105%] h-[105%] -translate-x-1/2 -translate-y-1/2 scale-110 object-cover opacity-35"
                allow="autoplay; encrypted-media"
                title="Saudi Haramain Live Streams"
              />
            </div>
          )}

          {/* Default Theme Background Dust Particles */}
          {ambientTheme === 'radial' && (
            <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
              <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-1/4 left-1/4 animate-ping" style={{ animationDuration: '4s' }} />
              <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-1/3 left-2/3 animate-ping" style={{ animationDuration: '6s' }} />
              <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-2/3 left-1/3 animate-ping" style={{ animationDuration: '5s' }} />
              <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-3/4 left-3/4 animate-ping" style={{ animationDuration: '7s' }} />
            </div>
          )}

          {/* Header Area */}
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
              <span className="text-xs font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                وضع الاستماع الهادئ <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              </span>
            </div>

            {/* Clock */}
            <div className="text-left font-mono text-white/50 text-sm font-bold">
              <span className="hidden sm:inline-block ml-2">
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <span>{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Center Content: Rotating Vinyl or Audio Waves */}
          <div className="flex flex-col items-center justify-center gap-8 my-auto relative z-10">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer Glow Ring */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full border border-primary/20 blur-xl opacity-50 scale-110 transition-all duration-[3s]",
                  isPlayingRadio ? "animate-pulse" : ""
                )}
              />

              <div
                className={cn(
                  "absolute inset-0 rounded-full border border-white/5 bg-black/60 shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-all duration-[10s] flex items-center justify-center",
                  isPlayingRadio ? "animate-spin" : ""
                )}
                style={{ animationDuration: '16s' }}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-4 rounded-full border border-dashed border-white/5" />
                <div className="absolute inset-8 rounded-full border border-white/5" />
                <div className="absolute inset-16 rounded-full border border-dashed border-white/5" />
                <div className="absolute inset-24 rounded-full border border-white/5" />
              </div>

              {/* Vinyl Center Sticker */}
              <div
                className={cn(
                  "w-28 h-28 rounded-full bg-gradient-to-tr flex flex-col items-center justify-center border-[8px] border-[#0a0a0a] shadow-2xl relative z-10",
                  currentRadioStation ? currentRadioStation.color : "from-zinc-800 to-zinc-900"
                )}
              >
                <span className="text-4xl">{currentRadioStation ? currentRadioStation.icon : '📻'}</span>
              </div>
            </div>

            {/* Station Details */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-black text-white max-w-lg mx-auto leading-tight drop-shadow-md">
                {currentRadioStation ? currentRadioStation.name : 'إذاعة القرآن الكريم'}
              </h2>
              <p className="text-white/40 text-xs md:text-sm font-bold tracking-wide">
                {currentRadioStation ? currentRadioStation.subtitle : 'استماع مباشر بدون تشتيت'}
              </p>
            </div>

            {/* Active Countdown or Visual Wave */}
            <div className="w-full max-w-md h-16 relative overflow-hidden rounded-xl border border-white/5 bg-black/40 group/viz mx-auto">
              <canvas ref={isAmbientScreenSaver ? (canvasRef as any) : undefined} className="w-full h-full" />

              <div className="absolute top-1.5 left-2 z-20 flex gap-1 bg-black/70 p-0.5 rounded-lg border border-white/10 opacity-0 group-hover/viz:opacity-100 transition-opacity">
                {([
                  { id: 'columns', name: 'أعمدة' },
                  { id: 'waves', name: 'موجات' },
                  { id: 'particles', name: 'نبضات' }
                ] as const).map(style => (
                  <button
                    key={style.id}
                    onClick={() => setVisualizerStyle(style.id)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-black transition-all whitespace-nowrap",
                      visualizerStyle === style.id ? "bg-primary text-black font-black" : "text-white/40 hover:text-white"
                    )}
                  >
                    {style.name}
                  </button>
                ))}
              </div>

              {isRadioBuffering && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 text-white/60 text-[10px] font-black backdrop-blur-[1px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>جاري الاتصال بالبث المباشر...</span>
                </div>
              )}

              {!isPlayingRadio && !isRadioBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white/40 text-[10px] font-black backdrop-blur-[1px]">
                  <span>البث متوقف مؤقتاً</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Area: Simple Controls & Exit */}
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6 w-full relative z-10 border-t border-white/5 pt-6">
            {/* Left: Volume Control */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl w-full xl:w-auto max-w-[200px]">
              <button
                onClick={() => setRadioVolume(radioVolume === 0 ? 0.8 : 0)}
                className="text-white/40 hover:text-white transition-colors shrink-0"
              >
                {radioVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-primary" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={radioVolume}
                onChange={e => setRadioVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Ambient Background Theme Selector */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-2xl">
              {([
                { id: 'radial', name: '🌀 دافئة' },
                { id: 'sky', name: '🌌 فلكية' },
                { id: 'geometry', name: '🕌 هندسية' },
                { id: 'live_makkah', name: '🕋 مكة' },
                { id: 'live_madinah', name: '🕌 المدينة' }
              ] as const).map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setAmbientTheme(theme.id);
                    localStorage.setItem('quran_ambient_theme', theme.id);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap",
                    ambientTheme === theme.id
                      ? "bg-primary text-black font-black shadow-glow-primary"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  {theme.name}
                </button>
              ))}
            </div>

            {/* Center: Play/Pause */}
            <div className="flex items-center gap-4">
              {currentRadioStation && (
                <button
                  onClick={() => handlePlayRadio(currentRadioStation)}
                  className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-white"
                >
                  {isPlayingRadio ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current translate-x-[1.5px]" />
                  )}
                </button>
              )}
              {sleepTimerMinutes && (
                <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-black text-emerald-400 font-mono tracking-wider flex items-center gap-2">
                  <span>⏳</span>
                  <span>
                    {Math.floor(sleepTimerRemaining / 60)}:{String(sleepTimerRemaining % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Exit */}
            <button
              onClick={() => setIsAmbientScreenSaver(false)}
              className="px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-black border border-rose-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 w-full xl:w-auto"
            >
              <span>خروج من وضع الهدوء 🚪</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
