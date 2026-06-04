'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, VolumeX, Volume2, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RadioStation } from './quran-constants';

interface AmbientScreenSaverProps {
  isAmbientScreenSaver: boolean;
  setIsAmbientScreenSaver: (val: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
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

export function AmbientScreenSaver({
  isAmbientScreenSaver,
  setIsAmbientScreenSaver,
  canvasRef,
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
  return (
    <AnimatePresence>
      {isAmbientScreenSaver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] bg-[#030303] text-white flex flex-col justify-between p-8 md:p-12 overflow-hidden"
          dir="rtl"
        >
          {/* Animated Radial Light Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.07)_0%,transparent_70%)] animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />

          {/* Floating particle simulations in background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-1/4 left-1/4 animate-ping" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-1/3 left-2/3 animate-ping" style={{ animationDuration: '6s' }} />
            <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-2/3 left-1/3 animate-ping" style={{ animationDuration: '5s' }} />
            <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-3/4 left-3/4 animate-ping" style={{ animationDuration: '7s' }} />
          </div>

          {/* Header Area */}
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-white/40 uppercase tracking-widest">وضع الاستماع الهادئ</span>
            </div>

            {/* Clock */}
            <div className="text-left font-mono text-white/50 text-sm font-bold">
              <span className="hidden sm:inline-block ml-2">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              <span>{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Center Content: Rotating vinyl or audio waves */}
          <div className="flex flex-col items-center justify-center gap-8 my-auto relative z-10">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer glow ring */}
              <div className={cn(
                "absolute inset-0 rounded-full border border-primary/20 blur-xl opacity-50 scale-110 transition-all duration-[3s]",
                isPlayingRadio ? "animate-pulse" : ""
              )} />

              <div
                className={cn(
                  "absolute inset-0 rounded-full border border-white/5 bg-black/60 shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-all duration-[10s] flex items-center justify-center",
                  isPlayingRadio ? "animate-spin" : ""
                )}
                style={{ animationDuration: '16s' }}
              >
                {/* Vinyl grooves */}
                <div className="absolute inset-4 rounded-full border border-dashed border-white/5" />
                <div className="absolute inset-8 rounded-full border border-white/5" />
                <div className="absolute inset-16 rounded-full border border-dashed border-white/5" />
                <div className="absolute inset-24 rounded-full border border-white/5" />
              </div>

              {/* Vinyl center sticker */}
              <div className={cn(
                "w-28 h-28 rounded-full bg-gradient-to-tr flex flex-col items-center justify-center border-[8px] border-[#0a0a0a] shadow-2xl relative z-10",
                currentRadioStation ? currentRadioStation.color : "from-zinc-800 to-zinc-900"
              )}>
                <span className="text-4xl">{currentRadioStation ? currentRadioStation.icon : '📻'}</span>
              </div>
            </div>

            {/* Station details */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-black text-white max-w-lg mx-auto leading-tight drop-shadow-md">
                {currentRadioStation ? currentRadioStation.name : 'إذاعة القرآن الكريم'}
              </h2>
              <p className="text-white/40 text-xs md:text-sm font-bold tracking-wide">
                {currentRadioStation ? currentRadioStation.subtitle : 'استماع مباشر بدون تشتيت'}
              </p>
            </div>

            {/* Active countdown or visual wave */}
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

          {/* Footer Area: Simple controls & Exit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full relative z-10 border-t border-white/5 pt-6">
            {/* Left: Volume control */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl w-full sm:w-auto max-w-[200px]">
              <button onClick={() => setRadioVolume(radioVolume === 0 ? 0.8 : 0)} className="text-white/40 hover:text-white transition-colors shrink-0">
                {radioVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-primary" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={radioVolume}
                onChange={(e) => setRadioVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Center: Play/Pause */}
            <div className="flex items-center gap-4">
              {currentRadioStation && (
                <button
                  onClick={() => handlePlayRadio(currentRadioStation)}
                  className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-white"
                >
                  {isPlayingRadio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-[1.5px]" />}
                </button>
              )}
              {sleepTimerMinutes && (
                <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-black text-emerald-400 font-mono tracking-wider flex items-center gap-2">
                  <span>⏳</span>
                  <span>{Math.floor(sleepTimerRemaining / 60)}:{String(sleepTimerRemaining % 60).padStart(2, '0')}</span>
                </div>
              )}
            </div>

            {/* Right: Exit */}
            <button
              onClick={() => setIsAmbientScreenSaver(false)}
              className="px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-black border border-rose-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto"
            >
              <span>خروج من وضع الهدوء 🚪</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
