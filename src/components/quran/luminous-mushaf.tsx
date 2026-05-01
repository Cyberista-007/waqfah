'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dummy Quran Verses (Al-Fatiha for demo)
const SURAH_FATIHA = [
    { id: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
    { id: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
    { id: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ" },
    { id: 4, text: "مَالِكِ يَوْمِ الدِّينِ" },
    { id: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
    { id: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
    { id: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ" }
];

export function LuminousMushaf() {
    const [activeVerse, setActiveVerse] = useState<number>(0);

    const nextVerse = () => {
        if (activeVerse < SURAH_FATIHA.length - 1) setActiveVerse(prev => prev + 1);
    };

    const prevVerse = () => {
        if (activeVerse > 0) setActiveVerse(prev => prev - 1);
    };

    return (
        <div className="relative min-h-screen bg-[#020202] flex flex-col items-center justify-center overflow-hidden py-24 selection:bg-amber-500/30 selection:text-amber-200" dir="rtl">
            {/* The Luminous Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Dynamic light following active verse index */}
                <motion.div 
                    animate={{
                        top: `${20 + (activeVerse * 10)}%`,
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/10 rounded-[100%] blur-[120px]" 
                />
            </div>

            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-screen pointer-events-none" />

            <div className="relative z-10 w-full max-w-4xl px-4">
                
                {/* Surah Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center p-6 rounded-full bg-amber-500/5 border border-amber-500/20 mb-8 relative group">
                        <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-ping opacity-20" />
                        <BookOpen className="w-10 h-10 text-amber-500/80 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                    </div>
                    <h2 
                        className="text-5xl md:text-7xl font-black font-quran text-transparent bg-clip-text drop-shadow-2xl"
                        style={{ backgroundImage: 'linear-gradient(to bottom, #fde68a, #d97706)' }}
                    >
                        سُورَةُ الفَاتِحَة
                    </h2>
                    <div className="flex justify-center gap-4 mt-8 opacity-40">
                        <div className="w-12 h-px bg-amber-500" />
                        <Sparkles className="w-4 h-4 text-amber-500 -mt-2" />
                        <div className="w-12 h-px bg-amber-500" />
                    </div>
                </motion.div>

                {/* The Verses */}
                <div className="space-y-4 text-center">
                    {SURAH_FATIHA.map((verse, idx) => {
                        const isActive = idx === activeVerse;
                        return (
                            <motion.div
                                key={verse.id}
                                onClick={() => setActiveVerse(idx)}
                                className={cn(
                                    "relative px-4 py-6 md:p-8 rounded-[2rem] transition-all duration-700 cursor-pointer",
                                    isActive ? "bg-amber-500/5 border border-amber-500/20" : "hover:bg-white/[0.02]"
                                )}
                            >
                                {/* Glow behind active verse */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeGlow"
                                            className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-[3rem] pointer-events-none -z-10"
                                        />
                                    )}
                                </AnimatePresence>

                                <p 
                                    className={cn(
                                        "text-4xl md:text-6xl font-quran leading-loose md:leading-[2.5] transition-all duration-1000 select-text",
                                        isActive 
                                            ? "text-amber-100 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105" 
                                            : "text-white/30 scale-100"
                                    )}
                                    style={isActive ? { textShadow: '0 0 40px rgba(245,158,11,0.4), 0 0 10px rgba(245,158,11,0.8)' } : {}}
                                >
                                    {verse.text}
                                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-current text-sm font-sans mx-4 opacity-50 align-middle">
                                        {verse.id}
                                    </span>
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Navigation Controls */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-full z-50">
                    <button 
                        onClick={prevVerse} 
                        disabled={activeVerse === 0}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-amber-500/20 hover:text-amber-500 disabled:opacity-30 transition-colors text-white"
                    >
                        <ChevronRight />
                    </button>
                    <div className="w-px h-8 bg-white/10" />
                    <button 
                        onClick={nextVerse}
                        disabled={activeVerse === SURAH_FATIHA.length - 1}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-amber-500/20 hover:text-amber-500 disabled:opacity-30 transition-colors text-white"
                    >
                        <ChevronLeft />
                    </button>
                </div>
            </div>
        </div>
    );
}
