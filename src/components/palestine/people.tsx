'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Globe, Compass, Earth, Key, Calendar } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NAKBA_VILLAGES_DATA, NAKBA_VILLAGES, CITIES, FAMOUS_FIGURES } from './constants';

/**
 * Lest We Forget: Memorial for depopulated villages.
 */
export function LestWeForgetMemorial() {
  return (
    <section id="nakba" className="py-60 bg-rose-950/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      
      <div className="container px-6 relative z-10">
        <div className="text-center mb-32 space-y-8">
           <motion.div 
             initial={{ scale: 0 }}
             whileInView={{ scale: 1 }}
             className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30"
           >
              <MapPin className="w-12 h-12 text-rose-500 animate-pulse" />
           </motion.div>
           <h2 className="text-5xl md:text-8xl font-black tracking-tighter">كي <span className="text-rose-500">لا ننسى</span></h2>
           <p className="text-2xl text-white/40 max-w-3xl mx-auto leading-relaxed font-medium">
             أكثر من 500 مدينة وقرية فلسطينية تم تدميرها وتهجير أهلها قسراً عام 1948. أسماؤها محفورة في ذاكرتنا، وحق العودة إليها مقدس لا يموت.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
           {NAKBA_VILLAGES_DATA.map((v, i) => (
             <motion.div
               key={v.name}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all text-right space-y-4 group relative overflow-hidden"
             >
                <Key className="w-12 h-12 text-rose-500/10 absolute top-8 left-8 group-hover:rotate-45 transition-transform" />
                <div className="flex items-center justify-between relative z-10">
                   <span className="text-xs font-black text-rose-500/60 uppercase tracking-widest">{v.district}</span>
                </div>
                <h3 className="text-3xl font-black text-white group-hover:text-rose-400 transition-colors relative z-10">{v.name}</h3>
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-end gap-3 text-white/40">
                     <span className="text-sm font-bold">{v.year}</span>
                     <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-end gap-3 text-white/20">
                     <Users className="w-4 h-4" />
                     <span className="text-xs font-bold">عدد السكان: {v.population}</span>
                  </div>
                </div>
                <p className="mt-8 text-sm text-white/30 leading-relaxed group-hover:text-white/60 transition-colors relative z-10">{v.fact}</p>
             </motion.div>
           ))}
        </div>

        {/* Scrolling Marquee of all villages */}
        <div className="relative py-24 border-y border-white/5 overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(228,49,43,0.03),transparent)]" />
           <motion.div 
             animate={{ x: [0, -4000] }}
             transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
             className="flex gap-24 items-center whitespace-nowrap"
           >
              {[...NAKBA_VILLAGES, ...NAKBA_VILLAGES].map((village, i) => (
                <span key={i} className="text-4xl md:text-7xl font-black text-white/5 hover:text-rose-500/40 transition-all duration-700 cursor-default select-none">
                  {village}
                </span>
              ))}
           </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Cities Explorer: High-end city showcase.
 */
export function CitiesExplorerSection() {
  const [activeCity, setActiveCity] = React.useState(0);

  return (
    <section className="py-60 relative overflow-hidden">
      <div className="container px-6">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* City Detail */}
          <div className="flex-1 space-y-12 text-right order-2 lg:order-1">
             <motion.div
               key={CITIES[activeCity].name}
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-8"
             >
                <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full">
                   <Compass className="w-5 h-5 text-emerald-500" />
                   <span className="text-xs font-black uppercase tracking-widest text-emerald-400">رحلة في قلب الجغرافيا</span>
                </div>
                <h2 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-none">{CITIES[activeCity].name}</h2>
                <p className="text-4xl font-bold text-white/20 italic">{CITIES[activeCity].title}</p>
                <p className="text-2xl text-white/40 leading-relaxed max-w-2xl mr-auto font-medium">{CITIES[activeCity].description}</p>
                <div className="p-10 rounded-[4rem] bg-white/[0.03] border border-white/5 inline-block">
                   <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">تشتهر بـ</p>
                   <p className="text-xl font-bold text-white/60">{CITIES[activeCity].knownFor}</p>
                </div>
             </motion.div>
          </div>

          {/* City Navigation */}
          <div className="w-full lg:w-[400px] grid grid-cols-2 gap-4 order-1 lg:order-2">
             {CITIES.map((city, i) => (
               <button
                 key={city.name}
                 onClick={() => setActiveCity(i)}
                 className={cn(
                   "p-8 rounded-[3rem] text-right transition-all border group",
                   activeCity === i 
                     ? "bg-emerald-500 border-emerald-500 text-black shadow-glow-emerald/30" 
                     : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:text-white"
                 )}
               >
                 <h4 className="text-xl font-black">{city.name}</h4>
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{city.title}</p>
               </button>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Diaspora Unity: The global Palestinian community.
 */
export function DiasporaUnitySection() {
  return (
    <section className="py-40 relative">
      <div className="container px-6">
        <div className="flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 relative aspect-video w-full rounded-[5rem] overflow-hidden border border-white/10 group">
             <Image src="/palestine_global_diaspora_map_1777282442641.png" alt="Global Diaspora Map" fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-[10s]" />
             <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
             
             {/* Glowing Dots (Pulse) */}
             <div className="absolute top-[30%] left-[20%] w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
             <div className="absolute top-[50%] left-[45%] w-4 h-4 bg-rose-500 rounded-full animate-ping [animation-delay:1s]" />
             <div className="absolute top-[40%] right-[30%] w-4 h-4 bg-sky-500 rounded-full animate-ping [animation-delay:2s]" />
          </div>

          <div className="flex-1 space-y-12 text-right">
             <div className="inline-flex items-center gap-4 px-8 py-3 bg-sky-500/10 border border-sky-500/20 rounded-full">
                <Earth className="w-5 h-5 text-sky-500 shadow-glow-sky" />
                <span className="text-xs font-black uppercase text-sky-500 tracking-widest">فلسطين عابرة للحدود</span>
             </div>
             <h2 className="text-5xl md:text-8xl font-black text-right tracking-tighter leading-tight">شعبٌ واحد <br /> <span className="text-white/20">رغم المسافات</span></h2>
             <p className="text-2xl text-white/40 leading-relaxed font-medium">
               أكثر من 7 ملايين فلسطيني يعيشون في الشتات، يحملون مفاتيح بيوتهم في قلوبهم ويورثون حب الأرض لأبنائهم. لا حدود تفرقنا، ولا منافي تنسينا بوصلتنا الوحيدة: القدس.
             </p>
             <div className="flex flex-wrap justify-end gap-6">
                {[
                  { label: 'في الشتات', value: '7M+' },
                  { label: 'في الداخل', value: '6M+' },
                  { label: 'دول العالم', value: '180+' },
                ].map(stat => (
                  <div key={stat.label} className="text-right">
                    <p className="text-4xl font-black text-white">{stat.value}</p>
                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-1">{stat.label}</p>
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
 * Personalities Section: People who shaped the narrative.
 */
export function PersonalitiesSection() {
  return (
    <section className="py-40">
      <div className="container px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32">
          <div className="space-y-8 text-right">
             <div className="inline-flex items-center gap-4 px-8 py-3 bg-sky-500/10 border border-sky-500/20 rounded-full">
                <Users className="w-5 h-5 text-sky-500 shadow-glow-sky" />
                <span className="text-xs font-black uppercase text-sky-500 tracking-widest">شخصيات حفرت التاريخ</span>
             </div>
             <h2 className="text-5xl md:text-8xl font-black text-right tracking-tighter">أصوات <br /> <span className="text-white/20">لا تنحني للريح</span></h2>
          </div>
          <p className="text-2xl text-white/40 max-w-xl md:text-left text-right leading-relaxed font-medium">مفكرون، أدباء، وفنانون حملوا فلسطين في قلوبهم وأقلامهم وأسمعوا العالم صوت الحق الذي لا يغيب.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FAMOUS_FIGURES.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-12 rounded-[4.5rem] bg-white/[0.02] border border-white/5 hover:border-sky-500/20 transition-all text-right group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-0 bg-sky-500 group-hover:h-full transition-all duration-500" />
              <h3 className="text-3xl font-black text-white mb-2 group-hover:text-sky-400 transition-colors">{person.name}</h3>
              <p className="text-sm font-black text-sky-500/60 uppercase tracking-[0.3em] mb-8">{person.role}</p>
              <p className="text-lg text-white/40 leading-relaxed font-medium">{person.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
