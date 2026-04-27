'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { History, Calendar, TreePine, Users, Landmark, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RESISTANCE_CHRONICLES, TIMELINE } from './constants';

/**
 * Resistance Chronicles: A cinematic timeline of the struggle.
 */
export function ResistanceChroniclesSection() {
  return (
    <section className="py-60 relative overflow-hidden">
      <div className="container px-6">
        <div className="text-right mb-40 space-y-8">
           <div className="inline-flex items-center gap-4 px-8 py-3 bg-rose-500/10 border border-rose-500/20 rounded-full">
              <History className="w-5 h-5 text-rose-500 shadow-glow-rose" />
              <span className="text-xs font-black uppercase text-rose-500 tracking-widest">سجل المقاومة · ذاكرة الصمود</span>
           </div>
           <h2 className="text-5xl md:text-9xl font-black text-right tracking-tighter leading-none">تاريخٌ من <br /> <span className="text-white/20 italic">العزة والكرامة</span></h2>
        </div>

        <div className="relative border-r-2 border-white/5 pr-12 space-y-32">
           {RESISTANCE_CHRONICLES.map((item, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="relative"
             >
                <div className="absolute top-0 -right-[52px] w-12 h-12 bg-black border-2 border-rose-500 rounded-full flex items-center justify-center shadow-glow-rose/20">
                   <div className="w-4 h-4 bg-rose-500 rounded-full animate-pulse" />
                </div>
                <div className="space-y-6">
                   <span className="text-5xl font-black text-rose-500/40 font-headline italic">{item.year}</span>
                   <h3 className="text-4xl font-black text-white">{item.title}</h3>
                   <p className="text-2xl text-white/40 leading-relaxed max-w-4xl mr-auto font-medium">{item.description}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Resistance Stats: Data that tells a story of survival.
 */
export function ResistanceStatsSection() {
  const stats = [
    { label: "عام من الصمود", value: "76+", icon: Calendar, color: "text-rose-500" },
    { label: "شجرة زيتون", value: "11M+", icon: TreePine, color: "text-emerald-500" },
    { label: "لاجئ حول العالم", value: "7M+", icon: Users, color: "text-sky-500" },
    { label: "مدن وقرى محتلة", value: "500+", icon: Landmark, color: "text-amber-500" }
  ];

  return (
    <section className="py-40 relative">
      <div className="container px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center space-y-6 group overflow-hidden shadow-2xl"
            >
               <div className={cn("absolute -top-12 -right-12 w-40 h-40 blur-3xl opacity-10 rounded-full", stat.color.replace('text', 'bg'))} />
               <stat.icon className={cn("w-12 h-12 mx-auto mb-8 transition-transform group-hover:scale-125 duration-500", stat.color)} />
               <motion.h4 
                 initial={{ scale: 0.5 }}
                 whileInView={{ scale: 1 }}
                 className="text-6xl md:text-8xl font-black text-white"
               >
                 {stat.value}
               </motion.h4>
               <p className="text-xl font-bold text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Facts Counter: Historical facts and figures.
 */
export function FactsCounterSection() {
  const facts = [
    { label: "قرية دُمّرت في النكبة", value: "531", color: "text-rose-500", bg: "bg-rose-500" },
    { label: "قرار أممي لصالح فلسطين", value: "700+", color: "text-sky-500", bg: "bg-sky-500" },
    { label: "سنوات الاحتلال المستمر", value: "76", color: "text-emerald-500", bg: "bg-emerald-500" }
  ];

  return (
    <section className="py-40 relative">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-32 space-y-6"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl mx-auto">
            <Shield className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-black uppercase text-rose-400 tracking-widest">أرقام موثقة · لا يمكن إنكارها</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter">
            الحقيقة <span className="text-rose-500">بالأرقام</span>
          </h2>
          <p className="text-2xl text-white/40 font-medium max-w-3xl mx-auto leading-relaxed">
            هذه ليست إحصاءات، بل هي أرواح وذكريات وأحلام. كل رقم هنا يحمل ألم إنسان حقيقي يستحق أن يُعرف حقه.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {facts.map((fact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className="p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center relative overflow-hidden group shadow-2xl hover:bg-white/[0.06] transition-all"
            >
              <div className={cn("absolute inset-x-0 bottom-0 h-1 opacity-60", fact.bg)} />
              <div className={cn("absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-5 transition-opacity group-hover:opacity-15", fact.bg)} />
              <motion.h4 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className={cn("text-6xl md:text-8xl font-black mb-6", fact.color)}
              >
                {fact.value}
              </motion.h4>
              <p className="text-xl font-bold text-white/50 leading-relaxed">{fact.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Timeline Section: The historical progression.
 */
export function TimelineSection() {
  return (
    <section id="timeline" className="py-40 relative overflow-hidden text-right">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-right mb-32 space-y-6"
        >
           <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-none">محطات في <br /> <span className="text-rose-500">مسيرة الحق</span></h2>
           <p className="text-2xl text-white/30 max-w-2xl mr-auto font-medium leading-relaxed">كل عام مرّ على هذه الأرض هو شاهدٌ على محاولة الاقتلاع، وشاهدٌ أكبر على صمود الجذور الفلسطينية الراسخة.</p>
        </motion.div>

        <div className="space-y-24 relative">
           <div className="absolute right-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-rose-500/50 via-white/5 to-emerald-500/50 hidden md:block" />
           
           {TIMELINE.map((item, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className={cn(
                 "relative flex flex-col md:flex-row items-center gap-12 group",
                 i % 2 === 0 ? "md:flex-row-reverse" : ""
               )}
             >
                <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-black border-4 border-rose-500 rounded-full z-20 group-hover:scale-150 group-hover:bg-rose-500 transition-all duration-500 hidden md:block" />
                
                <div className="w-full md:w-1/2 p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/5 hover:border-rose-500/20 transition-all shadow-2xl relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/5 blur-3xl rounded-full" />
                   <span className="text-4xl font-black text-rose-500 mb-4 block group-hover:scale-110 transition-transform origin-right">{item.year}</span>
                   <h4 className="text-3xl font-black text-white mb-4">{item.title}</h4>
                   <p className="text-xl text-white/40 leading-relaxed font-medium">{item.description}</p>
                </div>
                <div className="w-full md:w-1/2 hidden md:block" />
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
