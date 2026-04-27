'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Zap, Globe, Heart, Shield, Landmark, Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { FLAG_COLORS, VERSES } from './constants';

/**
 * Hero Section: The grand introduction with cinematic visuals.
 */
export function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="relative h-[120vh] flex items-center justify-center overflow-hidden">
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        <Image 
          src="/palestine_hero_cinematic_1777220019628.png" 
          alt="Palestine Hero Cinematic" 
          fill 
          priority
          className="object-cover opacity-60 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </motion.div>

      <div className="container relative z-10 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="space-y-8"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.5 }}
            className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl"
          >
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/80">فلسطين · أرض الأنبياء والزيتون</span>
          </motion.div>

          <h1 className="text-[clamp(3rem,15vw,14rem)] font-black font-headline tracking-tighter leading-[0.8] text-white">
            فلسطين <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-white to-rose-500 animate-gradient-x">
              الحقيقة
            </span>
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-12">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xl md:text-3xl text-white/40 font-medium max-w-2xl leading-relaxed font-quran"
            >
              "سُبحان الذي أسرى بعبده ليلاً من المسجد الحرام إلى المسجد الأقصى الذي باركنا حوله"
            </motion.p>
          </div>
        </motion.div>
      </div>

      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/20"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.6em]">اكتشف الحقيقة</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-24 bg-gradient-to-b from-white/20 to-transparent" 
        />
      </motion.div>
    </section>
  );
}

/**
 * Quote Section: A transition of power and meaning.
 */
export function QuoteSection() {
  return (
    <section className="py-32 relative">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-6xl mx-auto p-16 md:p-24 bg-white/[0.02] border border-white/5 rounded-[4rem] text-center relative overflow-hidden"
        >
          <div className="w-16 h-16 text-rose-500/20 absolute -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center">
             <Heart className="w-12 h-12" />
          </div>
          <h2 className="text-3xl md:text-5xl font-quran leading-relaxed text-white/90">
            {VERSES[0].text}
          </h2>
          <p className="mt-8 text-rose-500 font-black tracking-widest text-sm uppercase">
            {VERSES[0].source}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Al-Aqsa Detail: Deep dive into the heart of Palestine.
 */
export function AlAqsaDetail() {
  return (
    <section id="alaqsa" className="py-60 relative">
      <div className="container px-6">
        <div className="flex flex-col lg:flex-row items-center gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex-1 relative aspect-square w-full max-w-2xl rounded-[6rem] overflow-hidden group shadow-3xl"
          >
            <Image 
              src="/palestine_hero_cinematic_1777220019628.png" 
              alt="Al-Aqsa Mosque Detail" 
              fill 
              className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[2s]"
            />
            <div className="absolute inset-0 bg-emerald-950/20 mix-blend-overlay" />
            <div className="absolute inset-0 border-[20px] border-white/5 rounded-[6rem]" />
          </motion.div>

          <div className="flex-1 space-y-12 text-right">
             <div className="inline-flex items-center gap-4 px-8 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Shield className="w-5 h-5 text-emerald-500 shadow-glow-emerald" />
                <span className="text-xs font-black uppercase text-emerald-500 tracking-widest">المقدسات · أمانة الأمة</span>
             </div>
             <h2 className="text-6xl md:text-9xl font-black text-right tracking-tighter leading-none">المسجد <br /> <span className="text-white/20">الأقصى المبارك</span></h2>
             <p className="text-2xl text-white/40 leading-relaxed font-medium">
               ليس مجرد بناء، بل هو مسرى النبي ﷺ، ومعراجه إلى السماء، وقبلة المسلمين الأولى. تبلغ مساحته 144 دونماً، تضم قبة الصخرة المشرفة والجامع القبلي ومصليات وساحات مباركة.
             </p>
             <div className="grid grid-cols-2 gap-8">
                {[
                  { label: 'المساحة', value: '144 دونم' },
                  { label: 'المرتبة', value: 'ثالث الحرمين' },
                ].map(item => (
                  <div key={item.label} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5">
                    <p className="text-3xl font-black text-white">{item.value}</p>
                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-2">{item.label}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Eternal Spirit: Artistic section.
 */
export function EternalSpiritSection() {
  return (
    <section className="py-60 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(228,49,43,0.05),transparent)] pointer-events-none" />
      
      <div className="container px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative aspect-[4/5] w-full max-w-2xl rounded-[6rem] overflow-hidden group shadow-3xl border border-white/10"
          >
            <Image
              src="/palestine_artistic_dribbble_inspiration_1777290333945.png"
              alt="Palestine Eternal Spirit Art"
              fill
              className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[3s] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[6rem]" />
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 left-12 px-8 py-3 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full"
            >
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">الروح الأبدية</span>
            </motion.div>
          </motion.div>

          <div className="flex-1 space-y-12 text-right">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-6xl md:text-9xl font-black font-headline tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/30">
                فلسطين <br />
                <span className="text-emerald-500 text-glow-emerald">فكرة</span> <br />
                والفكرة <span className="text-rose-500 text-glow-rose">لا تموت</span>
              </h2>
              <div className="h-1.5 w-32 bg-emerald-500/50 rounded-full" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <p className="text-3xl md:text-4xl font-bold text-white/80 leading-relaxed font-quran">
                "ليست مجرد بقعة على الخارطة، بل هي نبضٌ يسكن في عروق الأحرار عبر الزمان."
              </p>
              <p className="text-xl md:text-2xl text-white/40 font-medium leading-relaxed max-w-2xl mr-auto">
                أرض الأنبياء، قلب العروبة، وضمير الإنسانية الحي. هنا يلتقي التاريخ بالمستقبل، وتتحول المعاناة إلى أسطورة صمود تُدرس للأجيال.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-end gap-6"
            >
              {[
                "القدس بوصلتنا",
                "الحق لا يسقط بالتقادم",
                "جيلٌ يسلم جيلاً"
              ].map((tag, i) => (
                <div key={i} className="px-6 py-2 bg-white/5 border border-white/10 rounded-2xl text-sm font-black text-white/30 hover:text-white/60 transition-colors">
                  {tag}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Flag Meaning Section: Symbolic colors of the struggle.
 */
export function FlagMeaningSection() {
  return (
    <section className="py-40 relative">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-right mb-24 space-y-6"
        >
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter">راية <span className="text-rose-500">الحرية</span></h2>
          <p className="text-2xl text-white/40 max-w-2xl mr-auto font-medium">لكل لون في العلم الفلسطيني قصة، ولكل زاوية فيه معنى يروي حكاية شعب أبى الانكسار.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FLAG_COLORS.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-12 rounded-[4rem] bg-white/[0.03] border border-white/10 space-y-8 group hover:bg-white/[0.06] transition-all shadow-2xl"
            >
              <div 
                className="w-24 h-24 rounded-3xl shadow-3xl transition-transform group-hover:scale-110 group-hover:rotate-6"
                style={{ backgroundColor: f.color, boxShadow: `0 0 40px ${f.color}20` }}
              />
              <h3 className="text-3xl font-black text-white">{f.label}</h3>
              <p className="text-lg text-white/40 leading-relaxed font-medium">{f.meaning}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Sacred Connection Bento: Grid of sacred and identity elements.
 */
export function SacredConnectionBento() {
  return (
    <section className="py-40">
      <div className="container px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-2 gap-8 h-[auto] md:h-[1000px]">
          {/* Main Card: Al-Aqsa */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="md:col-span-8 md:row-span-2 rounded-[5rem] bg-gradient-to-br from-emerald-900/20 to-black border border-white/5 relative overflow-hidden group shadow-3xl p-16"
          >
             <Image src="/palestine_hero_cinematic_1777220019628.png" alt="Sacred Mosque" fill className="object-cover opacity-20 group-hover:scale-110 transition-transform duration-[5s]" />
             <div className="relative z-10 h-full flex flex-col justify-end text-right space-y-8">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 backdrop-blur-3xl flex items-center justify-center border border-emerald-500/30">
                   <Star className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-5xl md:text-7xl font-black text-white">المسجد الأقصى <br /> <span className="text-emerald-500 italic">نبض الأمة</span></h3>
                <p className="text-2xl text-white/60 leading-relaxed max-w-2xl mr-auto font-medium">
                  ثالث الحرمين الشريفين ومسرى النبي محمد ﷺ، يمثل البوصلة الروحية والسياسية لكل حر في هذا العالم.
                </p>
             </div>
          </motion.div>

          {/* Side Card 1: Sacred Geometry */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="md:col-span-4 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-12 relative overflow-hidden group shadow-2xl"
          >
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent)]" />
             <div className="relative z-10 space-y-6 text-right">
                <Zap className="w-12 h-12 text-amber-500 ml-auto" />
                <h4 className="text-3xl font-black text-white">القدسية والتاريخ</h4>
                <p className="text-lg text-white/40 leading-relaxed">أرضٌ شهدت معجزات السماء وحضارات الأرض، حيث يلتقي الزمان بالمكان في قدسية لا تضاهى.</p>
             </div>
          </motion.div>

          {/* Side Card 2: Global Reach */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 rounded-[4rem] bg-rose-500/10 backdrop-blur-3xl border border-rose-500/20 p-12 relative overflow-hidden group shadow-2xl"
          >
             <div className="relative z-10 space-y-6 text-right">
                <Globe className="w-12 h-12 text-rose-500 ml-auto animate-pulse" />
                <h4 className="text-3xl font-black text-white">قضية عالمية</h4>
                <p className="text-lg text-white/40 leading-relaxed">من لندن إلى جاكرتا، ومن نيويورك إلى كيب تاون، فلسطين هي الامتحان الحقيقي للضمير الإنساني العالمي.</p>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
