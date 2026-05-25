'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useSpring, useMotionValue, AnimatePresence, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

/**
 * Cinematic Overlay: Adds a subtle film grain and vignette.
 */
export function SeerahFilmGrain() {
  return (
    <div className="fixed inset-0 z-[50] pointer-events-none overflow-hidden mix-blend-overlay opacity-[0.03]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
}

/**
 * Glassy Background: Animated golden/sand blobs and Twinkling Stars.
 */
export function SeerahGlassyBackground() {
  const [stars, setStars] = useState<{x: string, y: string, size: number, delay: number, duration: number}[]>([]);
  
  useEffect(() => {
    // Generate random stars for the background
    const newStars = Array.from({ length: 450 }).map(() => ({
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 10,
      duration: Math.random() * 2.5 + 1.5
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#02050a] overflow-hidden pointer-events-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pageTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.1); }
          50% { opacity: 1; transform: scale(1.6); box-shadow: 0 0 10px rgba(255,255,255,1); }
        }
        .shooting-star-bg {
          position: absolute;
          width: 150px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,1), transparent);
          animation: shootingBg 8s infinite linear;
        }
        @keyframes shootingBg {
          0% { transform: translateX(200%) translateY(-200%) rotate(35deg); opacity: 1; }
          100% { transform: translateX(-200%) translateY(200%) rotate(35deg); opacity: 0; }
        }
      `}} />

      {/* Deep Space Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/10 via-[#02050a] to-[#02050a]" />

      {/* Twinkling Stars */}
      {stars.map((star, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: star.x,
            top: star.y,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `pageTwinkle ${star.duration}s infinite ease-in-out ${star.delay}s`
          }}
        />
      ))}

      {/* Shooting Stars */}
      <div className="shooting-star-bg top-[10%] left-[70%] opacity-60" style={{ animationDelay: '2s' }} />
      <div className="shooting-star-bg top-[40%] left-[90%] opacity-30" style={{ animationDelay: '5s' }} />
      <div className="shooting-star-bg top-[70%] left-[80%] opacity-40" style={{ animationDelay: '12s' }} />

      {/* Cinematic Glowing Nebulas */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.08, 0.12, 0.08]
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-amber-500/10 rounded-full blur-[150px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [90, 0, 90],
          opacity: [0.03, 0.08, 0.03]
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[120px]" 
      />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.1] mix-blend-overlay" />
    </div>
  );
}

/**
 * Scroll Progress Indicator: Golden progress bar.
 */
export function SeerahScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 z-[200] origin-left shadow-[0_0_20px_rgba(245,158,11,0.5)]"
      style={{ scaleX }}
    />
  );
}

/**
 * Floating Soul Words: Parallax typography for depth.
 */
export function SeerahSoulWords() {
  const { scrollY } = useScroll();
  const words = [
    { text: 'مكة', top: '15%', left: '5%', size: '15vw', speed: 0.2 },
    { text: 'المدينة', top: '45%', right: '5%', size: '12vw', speed: 0.15 },
    { text: 'الوحي', top: '75%', left: '10%', size: '18vw', speed: 0.25 },
    { text: 'الهجرة', top: '110%', right: '10%', size: '14vw', speed: 0.18 },
    { text: 'النبوة', top: '150%', left: '5%', size: '16vw', speed: 0.22 },
    { text: 'الرحمة', top: '190%', right: '15%', size: '13vw', speed: 0.12 },
  ];
  
  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden select-none opacity-[0.015]">
      {words.map((word, i) => {
        const y = useTransform(scrollY, [0, 5000], [0, -1000 * word.speed]);
        return (
          <motion.div
            key={i}
            className="absolute font-black font-headline whitespace-nowrap text-white"
            style={{
            top: word.top,
            left: word.left,
            right: word.right,
            fontSize: word.size,
            transform: `rotate(${Math.random() * 20 - 10}deg)`,
            y
          }}
          >
            {word.text}
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Section Header: Cinematic title for each phase.
 */
export function SeerahSectionHeader({ title, subtitle, icon: Icon }: { title: string, subtitle: string, icon: any }) {
    return (
        <div className="text-center mb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-4 px-8 py-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-3xl mb-12"
          >
            <Icon className="w-6 h-6 text-amber-500" />
            <span className="text-2xl font-black text-white font-headline tracking-widest">{title}</span>
          </motion.div>
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-tight">{subtitle}</h2>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto opacity-30" />
        </div>
    );
}

/**
 * Glassy Bento Card: Reusable card for all content.
 */
export function SeerahBentoCard({ title, subtitle, icon, image, className, children, delay = 0 }: { title: string, subtitle?: string, icon?: React.ReactNode, image?: string, className?: string, children?: React.ReactNode, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={cn(
                "relative group overflow-hidden rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-12 transition-all duration-700 hover:bg-white/[0.03] hover:border-white/10 hover:-translate-y-2 shadow-2xl",
                className
            )}
        >
            {image && (
                <div className="absolute inset-0 -z-10 opacity-10 group-hover:opacity-25 transition-opacity duration-1000 scale-110 group-hover:scale-100 transition-transform">
                    <Image src={image} fill className="object-cover" alt={title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                </div>
            )}
            
            <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                        {icon && (
                            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl">
                                {icon}
                            </div>
                        )}
                        <div>
                            <h3 className="text-3xl md:text-4xl font-black text-white font-headline leading-tight tracking-tight">{title}</h3>
                            {subtitle && <p className="text-amber-500 font-black text-xs tracking-[0.4em] uppercase mt-2 opacity-60">{subtitle}</p>}
                        </div>
                    </div>
                </div>
                <div className="text-white/40 text-lg md:text-xl leading-relaxed font-bold flex-1">
                    {children}
                </div>
                
                <div className="mt-10 pt-10 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-500/50">اقرأ المزيد</span>
                    <div className="w-8 h-8 rounded-full border border-amber-500/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                </div>
            </div>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </motion.div>
    );
}

export function SeerahAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn("Seerah ambient audio playback failed:", err);
        });
    }
  };

  return (
    <div className="fixed bottom-12 left-12 z-[100]">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl group overflow-hidden relative"
      >
        <div className={cn("absolute inset-0 bg-amber-500/20 transition-opacity duration-500", isPlaying ? "opacity-100" : "opacity-0")} />
        {isPlaying ? (
          <Volume2 className="w-8 h-8 text-amber-400 animate-pulse" />
        ) : (
          <VolumeX className="w-8 h-8 text-white/40 group-hover:text-white transition-colors" />
        )}
        
        <audio 
          ref={audioRef} 
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" 
          loop 
          preload="none"
        />
        
        {isPlaying && (
          <div className="absolute bottom-4 flex gap-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 16, 4] }}
                transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                className="w-1.5 bg-amber-400 rounded-full"
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
            className="absolute left-24 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-3xl px-8 py-3 rounded-3xl border border-white/10 whitespace-nowrap shadow-2xl"
          >
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <p className="text-sm font-black text-amber-400 uppercase tracking-widest">صوت السكينة · قيد التشغيل</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
