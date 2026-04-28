'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Utensils, Star, Landmark, Mountain, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { TATREEZ_PATTERNS, SYMBOLS, ARCH_DETAILS, HERITAGE_ARTIFACTS } from './constants';
import { ParallaxImage } from './shared';

/**
 * Tatreez Patterns: The visual language of heritage.
 */
export function TatreezPatternsGrid() {
  return (
    <section className="py-40 bg-black/10">
      <div className="container px-6">
        <div className="text-right mb-24 space-y-6">
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
            <Palette className="w-5 h-5 text-rose-500 shadow-glow-rose" />
            <span className="text-xs font-black uppercase text-rose-400 tracking-widest">تطريز فلسطيني · حكاية غرزة</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">هوية <span className="text-rose-500">مطرزة</span> <br /> <span className="text-white/20">بخيوط الأمل</span></h2>
          <p className="text-2xl text-white/40 max-w-3xl mr-auto font-medium leading-relaxed">
            التطريز ليس مجرد فن، بل هو لغة بصرية تحكي تاريخ كل قرية ومدينة. كل نقشة تحمل معنى عميقاً يربط الأرض بالسماء والذاكرة بالمستقبل.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {TATREEZ_PATTERNS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-rose-500/20 transition-all text-center space-y-6 group cursor-default"
            >
              <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto group-hover:rotate-12 transition-transform">
                 <Palette className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-white">{p.name}</h3>
              <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">{p.origin}</p>
              <p className="text-sm text-white/40 leading-relaxed font-medium">{p.meaning}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Food Culture: The taste of home.
 */
export function FoodCultureSection() {
  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6 flex flex-col lg:flex-row items-center gap-24">
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="flex-1 space-y-12 text-right"
        >
           <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
              <Utensils className="w-5 h-5 text-amber-500 shadow-glow-amber" />
              <span className="text-xs font-black uppercase text-amber-400 tracking-widest">ثقافة وتذوق وأصالة</span>
           </div>
           <h2 className="text-5xl md:text-8xl font-black text-right leading-tight">خيرات <span className="text-white/20 italic">الأرض المباركة</span></h2>
           <p className="text-2xl text-white/40 leading-relaxed font-medium">
             زيت الزيتون المعصور بكرامة، والزعتر البري، والخبز الساخن من فرن الطابون.. هي ليست مجرد وجبة، بل هي طقسٌ يومي يجمع العائلة ويعمق الارتباط بالتراب الفلسطيني.
           </p>
           <div className="flex flex-wrap gap-4 justify-end">
              {['المقلوبة العالمية', 'المنسف الخليلي', 'المسخن الفلسطيني', 'الكنافة النابلسية', 'المفتول الريفي'].map(f => (
                <span key={f} className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-white/70 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all cursor-default">
                  {f}
                </span>
              ))}
           </div>
        </motion.div>
        
        <div className="flex-1 relative">
           <div className="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full" />
           <motion.div 
             whileHover={{ scale: 1.02 }}
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="relative rounded-[5rem] overflow-hidden border border-white/5 shadow-3xl h-[700px]"
           >
              <ParallaxImage 
                src="/palestine_culture_food_zaatar_olive_oil_1777280831710.png" 
                alt="Palestinian Traditional Food Culture" 
                className="w-full h-full" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
           </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Symbols Section: The iconic markers of identity.
 */
export function SymbolsSection() {
  return (
    <section id="symbols" className="py-40 bg-black/10">
      <div className="container px-6">
        <div className="text-right mb-24 space-y-6">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter">رموز <span className="text-rose-500">لا تنكسر</span></h2>
          <p className="text-2xl text-white/40 max-w-2xl mr-auto font-medium">أيقونات فلسطينية تحولت من مجرد رسومات وأشياء إلى رموز عالمية للصمود والحرية والعودة.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {SYMBOLS.map((symbol, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={symbol.name === 'حنظلة' ? { 
                rotateY: 10, 
                rotateX: -5,
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 }
              } : { scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-12 rounded-[4.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/5 transition-all text-right group relative overflow-hidden shadow-xl",
                symbol.name === 'حنظلة' && "hover:shadow-rose-500/10 hover:border-rose-500/30"
              )}
            >
              <div className={cn("absolute top-0 right-0 w-3 h-full opacity-20", symbol.color)} />
              
              {/* Specialized Icon/Image Area */}
              <div className="relative w-32 h-32 mb-10 group-hover:scale-110 transition-transform duration-500 mx-auto md:mx-0 md:mr-0">
                <div className="absolute inset-0 bg-white/5 rounded-3xl -rotate-6 group-hover:rotate-0 transition-transform" />
                <div className="relative w-full h-full rounded-3xl bg-white/5 flex items-center justify-center text-5xl overflow-hidden border border-white/10">
                  {symbol.image ? (
                    <Image src={symbol.image} alt={symbol.name} fill className="object-contain p-4 group-hover:scale-125 transition-transform duration-700" />
                  ) : (
                    <span>{symbol.icon || '✨'}</span>
                  )}
                </div>
                {symbol.name === 'حنظلة' && (
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-4 bg-rose-500/10 blur-2xl rounded-full -z-10" 
                  />
                )}
              </div>

              <h3 className="text-3xl font-black text-white mb-4 group-hover:text-rose-400 transition-colors">{symbol.name}</h3>
              <p className="text-lg text-white/50 leading-relaxed mb-6">{symbol.description}</p>
              <p className="text-xs font-bold text-white/20 italic">{symbol.detail}</p>
              
              {/* Micro-interaction: Shine effect on hover */}
              <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] group-hover:left-[100%] transition-all duration-1000" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Museum of Heritage: Artifact showcase.
 */
export function MuseumOfHeritageSection() {
  return (
    <section className="py-60 relative overflow-hidden">
      <div className="container px-6">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-8 text-right order-2 lg:order-1"
          >
             <div className="inline-flex items-center gap-4 px-8 py-3 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <Landmark className="w-5 h-5 text-amber-500 shadow-glow-amber" />
                <span className="text-xs font-black uppercase text-amber-500 tracking-widest">ذاكرة حية · تراثٌ خالد</span>
             </div>
             <h2 className="text-5xl md:text-8xl font-black text-right tracking-tighter leading-none">متحف <br /> <span className="text-white/20">الأصالة الفلسطينية</span></h2>
          </motion.div>
          <p className="text-2xl text-white/40 max-w-xl md:text-left text-right leading-relaxed font-medium order-1 lg:order-2">
            كل قطعة هنا هي وثيقة ملكية، تحكي قصة أجدادنا الذين عمروا الأرض وزرعوا الشجر وبنوا البيوت قبل الغزاة بآلاف السنين.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {HERITAGE_ARTIFACTS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="aspect-[3/4] relative rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl bg-white/[0.02]">
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                 <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sparkles className="w-40 h-40 text-white" />
                 </div>
                 <div className="absolute bottom-10 left-10 right-10 text-right space-y-4 z-20">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{item.name}</span>
                    <h3 className="text-2xl font-black text-white">{item.name}</h3>
                    <p className="text-xs text-white/40 leading-relaxed font-medium">{item.description}</p>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Architecture History: The built identity.
 */
export function ArchHistorySection() {
  return (
    <section className="py-40 relative">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-right mb-32 space-y-6"
        >
          <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-none">فلسفة <br /> <span className="text-white/20 italic">الحجر والمكان</span></h2>
          <p className="text-2xl text-white/40 max-w-2xl mr-auto font-medium">العمارة الفلسطينية هي حوارٌ مستمر بين الإنسان والتراب، حيث تحول الحجر الصم إلى شاهدٍ ناطق على الهوية والحضارة.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {ARCH_DETAILS.map((detail, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="p-12 rounded-[4rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col md:flex-row gap-10 items-center text-right shadow-2xl"
             >
                <div className="w-32 h-32 rounded-3xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                   {detail.icon && <detail.icon className="w-16 h-16 text-white/30 group-hover:text-amber-500 transition-colors" />}
                </div>
                <div className="space-y-4">
                   <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{detail.period}</span>
                   <h4 className="text-3xl font-black text-white">{detail.title}</h4>
                   <p className="text-lg text-white/40 leading-relaxed font-medium">{detail.desc}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
