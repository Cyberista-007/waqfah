'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Trees, Landmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOSQUE_STAGES = [
    {
        id: 0,
        title: "العهد النبوي",
        year: "1 هـ",
        desc: "بُني من جذوع النخل وجريده، وكانت القبلة إلى بيت المقدس ثم حُولت إلى الكعبة.",
        icon: Trees,
        color: "from-amber-900 to-[#1a0f05]",
        accent: "text-amber-500",
        border: "border-amber-500/30",
        bgImage: "https://www.transparenttextures.com/patterns/wood-pattern.png",
        layers: [
            { id: 'l1', type: 'wall', width: '80%', height: '30%', color: 'bg-amber-800' },
            { id: 'l2', type: 'pillars', count: 4, height: '60%', color: 'bg-amber-700' }
        ]
    },
    {
        id: 1,
        title: "توسعة عثمان بن عفان",
        year: "29 هـ",
        desc: "أعاد بناءه بالحجارة المنقوشة والقصة، وجعل عمده من حجارة وسقفه من ساج.",
        icon: Building2,
        color: "from-stone-700 to-[#1c1917]",
        accent: "text-stone-300",
        border: "border-stone-400/30",
        bgImage: "https://www.transparenttextures.com/patterns/concrete-wall.png",
        layers: [
            { id: 'l1', type: 'wall', width: '90%', height: '40%', color: 'bg-stone-600' },
            { id: 'l2', type: 'pillars', count: 6, height: '70%', color: 'bg-stone-400' },
            { id: 'l3', type: 'roof', width: '95%', height: '10%', color: 'bg-stone-800' }
        ]
    },
    {
        id: 2,
        title: "التوسعة الكبرى",
        year: "العصر الحديث",
        desc: "أضخم توسعة في تاريخ المسجد، بمظلات متحركة ومآذن شاهقة وتكييف مركزي.",
        icon: Landmark,
        color: "from-emerald-900 to-[#022c22]",
        accent: "text-emerald-400",
        border: "border-emerald-500/30",
        bgImage: "https://www.transparenttextures.com/patterns/cubes.png",
        layers: [
            { id: 'l1', type: 'wall', width: '100%', height: '50%', color: 'bg-emerald-100' },
            { id: 'l2', type: 'pillars', count: 8, height: '80%', color: 'bg-emerald-200' },
            { id: 'l3', type: 'roof', width: '105%', height: '15%', color: 'bg-emerald-800' },
            { id: 'l4', type: 'minarets', count: 4, height: '120%', color: 'bg-emerald-100' }
        ]
    }
];

export function MosqueBuilder() {
    const [stage, setStage] = useState(0);

    const next = () => setStage((p) => Math.min(MOSQUE_STAGES.length - 1, p + 1));
    const prev = () => setStage((p) => Math.max(0, p - 1));

    const currentStage = MOSQUE_STAGES[stage];

    return (
        <section className="py-32 relative overflow-hidden bg-transparent border-y border-white/5" dir="rtl">
            {/* Dynamic Ambient Glow */}
            <motion.div 
                className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none transition-colors duration-1000", currentStage.color.split(' ')[0].replace('from-', 'bg-') + '/10')}
            />

            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 font-headline mb-4 tracking-tighter">تطور المسجد النبوي</h2>
                    <p className="text-white/40 text-xl font-bold max-w-2xl mx-auto">
                        من بناء متواضع بسعف النخل، إلى أحد أعظم المعالم المعمارية في العالم.
                    </p>
                </div>

                <div className="w-full">
                    {/* Visual 3D Stage Container */}
                    <div className="relative h-[500px] md:h-[600px] w-full rounded-[4rem] overflow-hidden border border-white/10 mb-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] perspective-[2000px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStage.id}
                                initial={{ opacity: 0, rotateX: 20, scale: 0.9 }}
                                animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                                exit={{ opacity: 0, rotateX: -20, scale: 1.1 }}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                                className={cn("absolute inset-0 bg-gradient-to-br flex flex-col items-center justify-center p-12 text-center transform-gpu", currentStage.color)}
                            >
                                <div className="absolute inset-0 mix-blend-multiply opacity-40 pointer-events-none" style={{ backgroundImage: `url(${currentStage.bgImage})` }} />
                                
                                <div className={cn("w-24 h-24 rounded-[2rem] border-4 flex items-center justify-center mb-8 shadow-2xl bg-black/40 backdrop-blur-xl relative z-20", currentStage.border)}>
                                    <currentStage.icon className={cn("w-12 h-12", currentStage.accent)} />
                                </div>
                                
                                <h3 className="text-5xl md:text-7xl font-black text-white font-headline mb-4 drop-shadow-2xl relative z-20">
                                    {currentStage.title}
                                </h3>
                                <p className={cn("text-2xl font-black mb-6 font-mono tracking-[0.3em] uppercase px-6 py-2 rounded-full border bg-black/50 backdrop-blur-md relative z-20", currentStage.border, currentStage.accent)}>
                                    {currentStage.year}
                                </p>
                                <p className="text-xl md:text-2xl text-white/90 font-bold max-w-3xl leading-relaxed relative z-20 drop-shadow-md">
                                    {currentStage.desc}
                                </p>

                                {/* Abstract 3D Architectural Representation */}
                                <div className="absolute bottom-0 left-0 w-full h-[40%] flex flex-col justify-end items-center pointer-events-none opacity-30 mix-blend-overlay">
                                    {currentStage.layers.map((layer, i) => (
                                        <motion.div 
                                            key={layer.id}
                                            initial={{ y: 100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                                            className={cn("absolute bottom-0 flex items-end justify-around", layer.color)}
                                            style={{ width: layer.width, height: layer.height, zIndex: i }}
                                        >
                                            {layer.type === 'pillars' && Array.from({ length: layer.count || 0 }).map((_, pi) => (
                                                <div key={pi} className="w-[5%] h-full bg-white/20 shadow-inner" />
                                            ))}
                                            {layer.type === 'minarets' && Array.from({ length: layer.count || 0 }).map((_, mi) => (
                                                <div key={mi} className="w-[3%] h-full bg-white/40 shadow-xl rounded-t-full" />
                                            ))}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Timeline Interactive Controls */}
                    <div className="relative px-8 py-6 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-md shadow-2xl flex items-center justify-between gap-6">
                        <button 
                            onClick={prev} 
                            disabled={stage === 0}
                            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all flex-shrink-0"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex justify-between px-2 relative">
                                <div className="absolute top-1/2 left-4 right-4 h-1 bg-white/10 -translate-y-1/2 rounded-full -z-10" />
                                <div 
                                    className="absolute top-1/2 right-4 h-1 bg-emerald-500 -translate-y-1/2 rounded-full -z-10 transition-all duration-500" 
                                    style={{ width: `calc(${(stage / (MOSQUE_STAGES.length - 1)) * 100}% - 2rem)` }} 
                                />
                                
                                {MOSQUE_STAGES.map((s, idx) => (
                                    <button 
                                        key={s.id} 
                                        onClick={() => setStage(idx)}
                                        className="flex flex-col items-center gap-3 group relative"
                                    >
                                        <div className={cn(
                                            "w-4 h-4 rounded-full border-2 transition-all duration-300",
                                            stage >= idx ? "bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-150" : "bg-black border-white/20 group-hover:border-white/50"
                                        )} />
                                        <span className={cn(
                                            "absolute top-8 text-xs md:text-sm font-black whitespace-nowrap transition-colors duration-300",
                                            stage === idx ? s.accent : "text-white/30 group-hover:text-white/60"
                                        )}>
                                            {s.title}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={next} 
                            disabled={stage === MOSQUE_STAGES.length - 1}
                            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all flex-shrink-0"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
