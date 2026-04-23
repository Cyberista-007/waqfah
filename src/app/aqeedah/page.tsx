'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Shield, ChevronLeft, Zap, BookOpen, LayoutGrid } from 'lucide-react';
import { PILLARS, TERMINOLOGY } from './data';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';
import { useReadingMode } from '@/components/reading-provider';

export default function AqeedahPage() {
  const { isReadingMode, fontSize } = useReadingMode();
  const [activeId, setActiveId] = useState('allah');
  const activePillar = PILLARS.find(p => p.id === activeId) || PILLARS[0];

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6">
      {/* ... prev header ... */}
      {/* Header Section */}
      <div className={cn("max-w-4xl mx-auto text-center pt-16 pb-12 transition-all duration-500", isReadingMode && "opacity-0 h-0 p-0 overflow-hidden")}>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
        >
          <Shield className="w-3 h-3" /> أصول الدين
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">علم العقيدة</h1>
        <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          أركان الإيمان الستة — شرح مبسط وأدلة شرعية من الكتاب والسنة
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <ReadingModeToggle />
      </div>

      {/* Pillars Tabs */}
      <div className={cn("max-w-6xl mx-auto mb-12 hide-in-reading-mode")}>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            const isActive = activeId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 rounded-2xl border font-bold transition-all duration-300',
                  isActive 
                    ? `bg-gradient-to-br ${p.bg} ${p.border} ${p.color} shadow-lg scale-105` 
                    : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white/50'
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? p.color : "opacity-50")} />
                <span className="text-sm">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className={cn("max-w-5xl mx-auto transition-all duration-700", isReadingMode && "reading-content")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
              "rounded-[3.5rem] p-1.5 transition-all duration-700 bg-gradient-to-br shadow-[0_0_100px_-20px_rgba(0,0,0,0.4)]",
              activePillar.bg
            )}
          >
            <div className="bg-[#020202]/80 backdrop-blur-3xl rounded-[3.4rem] p-8 md:p-14 overflow-hidden relative">
              {/* Background Accent Icon */}
              <div className="absolute -top-12 -left-12 opacity-[0.03] pointer-events-none">
                 <activePillar.icon className="w-80 h-80 rotate-12" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-16">
                  <div className={cn("p-5 rounded-[2rem] bg-white/5 border-2 shadow-2xl", activePillar.border)}>
                    <activePillar.icon className={cn("w-10 h-10", activePillar.color)} />
                  </div>
                  <div>
                    <h2 className={cn("text-4xl md:text-6xl font-black mb-2", activePillar.color)}>
                      {activePillar.label}
                    </h2>
                    <p className="text-white/20 font-bold uppercase tracking-[0.4em] text-[10px]">
                      {activePillar.sublabel}
                    </p>
                  </div>
                </div>

                <div className="grid gap-8">
                  {activePillar.articles.map((article, idx) => (
                    <motion.div 
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className="group p-10 rounded-[3rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500"
                    >
                      <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-4">
                        <span className={cn("w-2 h-8 rounded-full", activePillar.color.replace('text-', 'bg-'))} />
                        {article.title}
                      </h3>
                      <p 
                        className={cn("text-white/45 leading-[1.8] text-lg md:text-xl mb-10 font-medium transition-all", isReadingMode && "reading-text")}
                        style={isReadingMode ? { fontSize: `${fontSize}px` } : {}}
                      >
                        {article.body}
                      </p>
                      
                      {article.evidence && (
                        <div className="relative group/evidence">
                          <div className={cn("absolute inset-0 blur-3xl opacity-0 group-hover/evidence:opacity-10 transition-opacity duration-700", activePillar.bg)} />
                          <div className="relative p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500 text-center">
                            <p 
                              className={cn("font-amiri text-3xl md:text-4xl text-white/90 leading-[1.7] transition-all", isReadingMode && "reading-text")}
                              style={isReadingMode ? { fontSize: `${fontSize + 8}px` } : {}}
                            >
                              "{article.evidence}"
                            </p>
                            <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-[10px] font-black uppercase text-white/25 border border-white/5 tracking-[0.2em]">
                              <Zap className="w-3.5 h-3.5 text-amber-400" /> الدليل من الوحي
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-20">
                   <p className="font-amiri text-3xl italic">وَتِلْكَ حُجَّتُنَا آتَيْنَاهَا إِبْرَاهِيمَ عَلَى قَوْمِهِ</p>
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em]">
                      <div className="w-16 h-px bg-white/40" />
                      أصول الاعتقاد
                      <div className="w-16 h-px bg-white/40" />
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Basic Theological Concepts Section - Centered in Reading Mode */}
      <div className={cn("max-w-7xl mx-auto mt-32 hide-in-reading-mode")}>
        <div className="flex items-center gap-4 mb-12">
           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-400" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white tracking-tighter">مفاهيم عقدية أساسية</h2>
              <p className="text-white/25 text-sm font-bold uppercase tracking-widest mt-1">Foundational Terminology</p>
           </div>
           <div className="flex-1 h-px bg-white/5 ml-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TERMINOLOGY.map((term, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-10 rounded-[3.5rem] bg-indigo-500/[0.03] border border-indigo-500/5 hover:bg-indigo-500/[0.08] hover:border-indigo-500/20 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                   <h3 className="text-2xl font-black text-white">{term.title}</h3>
                </div>
                <p className="text-white/40 leading-relaxed text-lg font-medium">
                  {term.definition}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
