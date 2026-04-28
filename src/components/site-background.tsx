
'use client';

import { useAppearance } from './appearance-provider';
import { ParticlesBackground } from './particles-background';
import { useMood } from './mood-provider';
import { motion, AnimatePresence } from 'framer-motion';

export function SiteBackground() {
  const { backgroundEffect } = useAppearance();
  const { moodColor } = useMood();

  if (backgroundEffect === 'particles') {
    return (
      <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none bg-background">
        <ParticlesBackground />
      </div>
    );
  }

  // Animated Mesh Gradient (Blobs) with Mood Sync
  return (
    <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none bg-background overflow-hidden">
      {/* Dynamic Blobs */}
      <motion.div 
        animate={{ backgroundColor: moodColor }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] animate-blob opacity-40" 
      />
      <motion.div 
        animate={{ backgroundColor: moodColor }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[130px] animate-blob animation-delay-2000 opacity-30" 
      />
      <motion.div 
        animate={{ backgroundColor: moodColor }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[150px] animate-blob animation-delay-4000 opacity-20" 
      />

      {/* Global Cultural Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none">
        <div className="absolute inset-0 bg-[url('/palestine_tatreez_pattern.jpg')] bg-repeat bg-[length:400px_auto] grayscale" />
      </div>

      {/* Static Overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-background opacity-80" />
      <div className="absolute inset-0 backdrop-blur-[100px]" />
    </div>
  );
}
