'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

/**
 * Global Solidarity Card: The final emotional hook.
 */
export function GlobalSolidarityCard() {
  return (
    <section className="py-20 md:py-60">
      <div className="container px-6">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="text-center bg-gradient-to-br from-rose-950/20 via-black to-emerald-950/20 p-12 md:p-40 rounded-[3rem] md:rounded-[6rem] border border-white/5 relative overflow-hidden group shadow-3xl"
        >
          <div className="absolute inset-0 bg-[url('/palestine_hero_cinematic_1777220019628.png')] bg-cover opacity-5 grayscale group-hover:opacity-10 transition-opacity duration-1000" />
          <motion.div 
             animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
             transition={{ duration: 10, repeat: Infinity }}
             className="absolute -top-20 -right-20 w-80 h-80 bg-rose-500/5 blur-[100px] rounded-full" 
          />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full" />
          
          <div className="relative z-10 space-y-12">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-12 border border-white/10 group-hover:scale-110 transition-transform">
                <Heart className="w-12 h-12 text-rose-500 animate-pulse fill-rose-500/20" />
             </div>
             <h2 className="text-[clamp(2.5rem,8vw,8rem)] font-black font-headline tracking-tighter leading-tight text-white">
               كن صوتاً <span className="text-rose-500">للحق</span> <br /> 
               في أرض <span className="text-emerald-500">الأنبياء</span>
             </h2>
             <p className="text-lg md:text-2xl text-white/40 font-medium max-w-3xl mx-auto leading-relaxed">
               انتهت الكلمات ولكن القضية مستمرة في قلوب الأحرار. كل مشاركة، كل كلمة وعي، وكل دعاء صادق هو خطوة نحو فجر الحرية الموعود.
             </p>
             <div className="pt-12">
                <button className="h-20 px-16 bg-white text-black rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-glow-white backdrop-blur-xl">
                  شارك الأمانة الآن
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Footer Heritage: Closing the portal with pride.
 */
export function FooterHeritage() {
  const cities = ['القدس', 'غزة', 'حيفا', 'يافا', 'نابلس', 'الخليل'];

  return (
    <footer className="py-32 border-t border-white/5 relative">
      <div className="container px-6 text-center space-y-12">
        <div className="flex items-center justify-center gap-6 md:gap-10">
          <div className="w-12 md:w-20 h-1.5 bg-red-600 rounded-full shadow-glow-rose/50" />
          <div className="w-12 md:w-20 h-1.5 bg-white rounded-full shadow-glow-white/50" />
          <div className="w-12 md:w-20 h-1.5 bg-emerald-600 rounded-full shadow-glow-emerald/50" />
        </div>
        
        <div className="space-y-4">
           <h3 className="text-3xl font-black tracking-widest text-white">ستبقى فلسطين حرة أبية</h3>
           <p className="text-white/20 text-sm font-black uppercase tracking-[0.6em]">WAQFAH PLATFORM · EST 2026</p>
        </div>
        
        <div className="flex items-center justify-center gap-8 pt-8">
           {cities.map(city => (
             <span key={city} className="text-[10px] font-black text-white/10 uppercase tracking-widest hover:text-white/40 transition-colors cursor-default">
                {city}
             </span>
           ))}
        </div>
      </div>
    </footer>
  );
}
