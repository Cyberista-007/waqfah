'use client';

import React from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Cinematic Audio Player: Atmospheric sounds for immersion.
 */
export function CinematicAudioPlayer() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-12 left-12 z-[100]">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl group overflow-hidden relative"
      >
        <div className={cn("absolute inset-0 bg-emerald-500/20 transition-opacity duration-500", isPlaying ? "opacity-100" : "opacity-0")} />
        {isPlaying ? (
          <Volume2 className="w-6 h-6 text-emerald-400 animate-pulse" />
        ) : (
          <VolumeX className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
        )}
        
        <audio 
          ref={audioRef} 
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
          loop 
        />
        
        {isPlaying && (
          <div className="absolute bottom-2 flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 12, 4] }}
                transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                className="w-1 bg-emerald-400 rounded-full"
              />
            ))}
          </div>
        )}
      </motion.button>
      
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-20 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-2xl px-6 py-2 rounded-2xl border border-white/10 whitespace-nowrap"
          >
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">صوت الصمود · قيد التشغيل</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Glassy Background: Animated colorful blobs behind a deep blur.
 */
export function GlassyBackground() {
  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
      <motion.div 
        animate={{ 
          x: [0, 100, 0], 
          y: [0, -50, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/[0.07] rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ 
          x: [0, -100, 0], 
          y: [0, 100, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-500/[0.07] rounded-full blur-[150px]"
      />
      <motion.div 
        animate={{ 
          x: [0, 50, 0], 
          y: [0, 150, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-amber-500/[0.04] rounded-full blur-[100px]"
      />
    </div>
  );
}

/**
 * Cinematic Cursor: A custom cursor that reacts to the environment.
 */
export function CinematicCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      const moveCursor = (e: MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      };
      window.addEventListener('mousemove', moveCursor);
      return () => window.removeEventListener('mousemove', moveCursor);
    }
  }, [cursorX, cursorY]);

  if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) {
    return null;
  }

  return (
    <motion.div
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
      }}
      className="fixed top-0 left-0 w-8 h-8 border border-rose-500 rounded-full z-[9999] pointer-events-none mix-blend-difference flex items-center justify-center"
    >
      <div className="w-1 h-1 bg-rose-500 rounded-full" />
    </motion.div>
  );
}

/**
 * Scroll Progress Indicator: Flag colors progress bar.
 */
export function ScrollProgressIndicator() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    ["#000000", "#FFFFFF", "#00843D", "#E4312B"]
  );

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-[200] origin-left"
      style={{ scaleX, backgroundColor }}
    />
  );
}

/**
 * Background Soul Words: Floating parallax typography for depth.
 */
export function BackgroundSoulWords() {
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 5000], [0, -1000]);
  const y2 = useTransform(scrollY, [0, 5000], [0, -1500]);
  const y3 = useTransform(scrollY, [0, 5000], [0, -800]);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none">
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-[20%] -left-[10%] text-[25vw] font-black text-white/[0.02] whitespace-nowrap"
      >
        صمود
      </motion.div>
      <motion.div 
        style={{ y: y2 }}
        className="absolute top-[50%] -right-[5%] text-[20vw] font-black text-white/[0.01] whitespace-nowrap"
      >
        حرية
      </motion.div>
      <motion.div 
        style={{ y: y3 }}
        className="absolute top-[80%] left-[5%] text-[30vw] font-black text-white/[0.015] whitespace-nowrap"
      >
        وطن
      </motion.div>
    </div>
  );
}

/**
 * Palestine Map Overlay: Fixed background element with "Cities of Light" interaction.
 */
export function PalestineMapOverlay() {
  const [activeCity, setActiveCity] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleCityChange = (e: any) => setActiveCity(e.detail);
    window.addEventListener('palestine-city-hover', handleCityChange);
    return () => window.removeEventListener('palestine-city-hover', handleCityChange);
  }, []);

  const cityCoords: Record<string, { x: string, y: string }> = {
    'القدس': { x: '52%', y: '45%' },
    'غزة': { x: '45%', y: '65%' },
    'يافا': { x: '48%', y: '35%' },
    'حيفا': { x: '52%', y: '20%' },
    'نابلس': { x: '55%', y: '38%' },
    'الخليل': { x: '53%', y: '52%' },
    'الناصرة': { x: '55%', y: '25%' },
    'رام الله': { x: '54%', y: '42%' },
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-[-1] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vh]">
        <svg viewBox="0 0 200 600" className="w-full h-full fill-white/20">
          <path d="M100 0 C120 100, 150 200, 140 300 C130 400, 110 500, 100 600 L80 600 C70 500, 50 400, 60 300 C70 200, 80 100, 100 0" />
        </svg>

        <AnimatePresence>
          {activeCity && cityCoords[activeCity] && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute w-12 h-12 bg-emerald-500 rounded-full blur-2xl"
              style={{ left: cityCoords[activeCity].x, top: cityCoords[activeCity].y }}
            />
          )}
        </AnimatePresence>

        {Object.entries(cityCoords).map(([name, pos]) => (
          <div 
            key={name}
            className="absolute w-1.5 h-1.5 bg-white/20 rounded-full"
            style={{ left: pos.x, top: pos.y }}
          />
        ))}
      </div>
    </div>
  );
}
