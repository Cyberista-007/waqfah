'use client';

import React from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
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
 * Palestine Map Overlay: Fixed background element.
 */
export function PalestineMapOverlay() {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.02] z-[-1] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vh]">
        <svg viewBox="0 0 200 600" className="w-full h-full fill-white">
          <path d="M100 0 C120 100, 150 200, 140 300 C130 400, 110 500, 100 600 L80 600 C70 500, 50 400, 60 300 C70 200, 80 100, 100 0" />
        </svg>
      </div>
    </div>
  );
}
