'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export function SeerahHero({ title, subtitle, image, tag = "قصة الهدى والرحمة" }: { title: string, subtitle: string, image: string, tag?: string }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], ['0%', '20%']);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.1]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden border-b border-white/5">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image src={image} fill className="object-cover brightness-[0.7] contrast-[1.1]" alt={title} priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-[#050505]" />
      </motion.div>
      
      <motion.div 
        style={{ opacity }}
        className="relative z-10 text-center px-6 max-w-7xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10"
        >
          <div className="inline-block px-10 py-3 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-3xl mb-8">
            <span className="text-amber-500 font-black text-sm uppercase tracking-[0.5em]">{tag}</span>
          </div>
          
          <h1 className="text-7xl md:text-[10rem] font-black font-headline text-white tracking-tighter leading-[0.85] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {title.split(' ').map((word, i) => (
              <span key={i} className="block last:text-transparent last:bg-clip-text last:bg-gradient-to-b last:from-amber-400 last:to-amber-700">
                {word}
              </span>
            ))}
          </h1>
          
          <p className="text-2xl md:text-4xl text-white/60 font-bold w-full leading-relaxed italic font-tajawal drop-shadow-xl">
            {subtitle}
          </p>
          
          <div className="pt-20 flex justify-center items-center gap-10">
              <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-amber-500/40" />
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-amber-500 animate-ping absolute inset-0" />
                <div className="w-4 h-4 rounded-full bg-amber-500 relative z-10" />
              </div>
              <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-amber-500/40" />
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        style={{ opacity }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 text-white/30"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">انطلق في رحلة عبر الزمن</span>
        <div className="w-[1px] h-20 bg-gradient-to-b from-amber-500/50 to-transparent relative">
            <motion.div 
                animate={{ y: [0, 60, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/2 -translate-x-1/2"
            >
                <ArrowDown className="w-4 h-4 text-amber-500" />
            </motion.div>
        </div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </section>
  );
}
