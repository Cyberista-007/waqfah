'use client';

import React, { useState } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { Scale, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DeedsScale() {
    const [goodDeeds, setGoodDeeds] = useState(0);
    const [badDeeds, setBadDeeds] = useState(0);

    // Spring physics for the scale rotation
    const balance = useSpring(0, { stiffness: 80, damping: 15, mass: 1.5 });
    
    const updateBalance = (g: number, b: number) => {
        const diff = g - b;
        let angle = (diff / 10) * 30; // 30 degrees max tilt
        if (angle > 35) angle = 35;
        if (angle < -35) angle = -35;
        balance.set(angle);
    };

    const addGood = () => {
        // Trigger haptic feedback if available on mobile
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
        const newG = goodDeeds + 1;
        setGoodDeeds(newG);
        updateBalance(newG, badDeeds);
    };

    const addBad = () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([100, 50, 100]); // Heavier vibration for bad deed
        }
        const newB = badDeeds + 1;
        setBadDeeds(newB);
        updateBalance(goodDeeds, newB);
    };

    const reset = () => {
        setGoodDeeds(0);
        setBadDeeds(0);
        updateBalance(0, 0);
    };

    const isGoodWinning = goodDeeds > badDeeds && goodDeeds - badDeeds > 2;
    const isBadWinning = badDeeds > goodDeeds && badDeeds - goodDeeds > 2;

    return (
        <section className="py-32 bg-[#020202] relative overflow-hidden" dir="rtl">
            {/* Dynamic Backgrounds based on winning side */}
            <motion.div 
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] transition-opacity duration-1000"
                initial={{ opacity: 0 }}
                animate={{ opacity: isGoodWinning ? 1 : 0 }}
            />
            <motion.div 
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.15)_0%,transparent_70%)] transition-opacity duration-1000"
                initial={{ opacity: 0 }}
                animate={{ opacity: isBadWinning ? 1 : 0 }}
            />

            <div className="container mx-auto px-4 text-center mb-16 relative z-10">
                <div className={cn(
                    "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 border transition-all duration-700 shadow-2xl relative",
                    isGoodWinning ? "bg-emerald-900/40 border-emerald-500/30 shadow-emerald-500/20" : 
                    isBadWinning ? "bg-red-900/40 border-red-500/30 shadow-red-500/20" : 
                    "bg-amber-900/40 border-amber-500/20 shadow-amber-500/20"
                )}>
                    <Scale className={cn("w-10 h-10 transition-colors duration-700", 
                        isGoodWinning ? "text-emerald-500" : 
                        isBadWinning ? "text-red-500" : 
                        "text-amber-500"
                    )} />
                    {isGoodWinning && <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald-400 animate-pulse" />}
                    {isBadWinning && <AlertCircle className="absolute -top-2 -left-2 w-6 h-6 text-red-500 animate-bounce" />}
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 font-headline mb-4 tracking-tighter">ميزان الأعمال</h2>
                <p className="text-white/40 text-xl font-bold">
                    "فَمَن ثَقُلَتْ مَوَازِينُهُ فَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ"
                </p>
            </div>

            <div className="relative w-full max-w-4xl mx-auto h-[600px] flex items-end justify-center pb-24">
                
                {/* The Scale Assembly */}
                <div className="relative w-[300px] md:w-[600px] h-[80%] flex flex-col items-center justify-end">
                    
                    {/* Beam (Horizontal bar that rotates) */}
                    <motion.div 
                        className="absolute top-[20%] w-full h-5 bg-gradient-to-r from-amber-900 via-amber-400 to-amber-900 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-20 flex justify-between border-y border-white/20"
                        style={{ rotate: balance, transformOrigin: 'center center' }}
                    >
                        {/* Center Pin */}
                        <div className="absolute left-1/2 -top-3 -translate-x-1/2 w-8 h-10 bg-gradient-to-b from-amber-400 to-amber-700 rounded-full border-2 border-[#1a0f05] shadow-xl z-30" />

                        {/* Right Pan (Good Deeds) */}
                        <motion.div className="absolute right-0 -top-1 w-0 h-0" style={{ rotate: useSpring(0) }}>
                            <motion.div style={{ rotate: balance, scaleY: -1 }} className="relative origin-top">
                                <div className="absolute right-[-70px] top-0 w-[140px] h-[200px]">
                                    {/* Strings */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md" strokeWidth="2">
                                        <line x1="70" y1="0" x2="15" y2="170" stroke="url(#chainGrad1)" />
                                        <line x1="70" y1="0" x2="125" y2="170" stroke="url(#chainGrad1)" />
                                        <defs>
                                            <linearGradient id="chainGrad1" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#d97706" />
                                                <stop offset="100%" stopColor="#78350f" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    {/* Pan Base */}
                                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-emerald-600 to-emerald-950 rounded-[50%] shadow-[0_20px_40px_rgba(0,0,0,0.9)] border-2 border-emerald-400/50 flex justify-center items-end pb-3 z-20">
                                        <span className="text-white font-black text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">{goodDeeds}</span>
                                    </div>
                                    {/* Coins Container */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-[-15px] z-10 w-full h-full justify-start">
                                        <AnimatePresence>
                                            {Array.from({ length: Math.min(goodDeeds, 15) }).map((_, i) => (
                                                <motion.div 
                                                    key={`good-${i}`} 
                                                    initial={{ y: -200, opacity: 0, rotate: Math.random() * 90 }} 
                                                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                                                    className="w-14 h-4 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full border-2 border-yellow-700 shadow-[0_5px_10px_rgba(0,0,0,0.5)] -mt-3 absolute"
                                                    style={{ bottom: `${i * 8}px`, left: `${Math.random() * 20 + 35}px` }}
                                                />
                                            ))}
                                        </AnimatePresence>
                                        {goodDeeds > 15 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-32 w-full text-center text-emerald-400 font-black text-xs drop-shadow-md">
                                                +{goodDeeds - 15} المزيد
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Left Pan (Bad Deeds) */}
                        <motion.div className="absolute left-0 -top-1 w-0 h-0" style={{ rotate: useSpring(0) }}>
                            <motion.div style={{ rotate: balance, scaleY: -1 }} className="relative origin-top">
                                <div className="absolute left-[-70px] top-0 w-[140px] h-[200px]">
                                    {/* Strings */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md" strokeWidth="2">
                                        <line x1="70" y1="0" x2="15" y2="170" stroke="url(#chainGrad2)" />
                                        <line x1="70" y1="0" x2="125" y2="170" stroke="url(#chainGrad2)" />
                                        <defs>
                                            <linearGradient id="chainGrad2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#d97706" />
                                                <stop offset="100%" stopColor="#78350f" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    {/* Pan Base */}
                                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-zinc-700 to-[#0a0a0a] rounded-[50%] shadow-[0_20px_40px_rgba(0,0,0,0.9)] border-2 border-zinc-500/50 flex justify-center items-end pb-3 z-20">
                                        <span className="text-white font-black text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">{badDeeds}</span>
                                    </div>
                                     {/* Stones */}
                                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-[-15px] z-10 w-full h-full justify-start">
                                        <AnimatePresence>
                                            {Array.from({ length: Math.min(badDeeds, 15) }).map((_, i) => (
                                                <motion.div 
                                                    key={`bad-${i}`} 
                                                    initial={{ y: -200, opacity: 0, rotate: Math.random() * 90 }} 
                                                    animate={{ y: 0, opacity: 1, rotate: Math.random() * 45 }}
                                                    className="w-12 h-8 bg-gradient-to-br from-zinc-500 to-zinc-900 rounded-[40%] border border-zinc-800 shadow-[0_5px_10px_rgba(0,0,0,0.8)] -mt-5 absolute"
                                                    style={{ bottom: `${i * 12}px`, left: `${Math.random() * 30 + 30}px` }}
                                                />
                                            ))}
                                        </AnimatePresence>
                                        {badDeeds > 15 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-40 w-full text-center text-zinc-400 font-black text-xs drop-shadow-md">
                                                +{badDeeds - 15} المزيد
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                    </motion.div>

                    {/* Stand (Base Pillar) */}
                    <div className="w-10 h-[80%] bg-gradient-to-r from-[#3a2008] via-amber-700 to-[#1a0f05] border-x-2 border-amber-900 z-10 shadow-[0_0_30px_rgba(0,0,0,0.9)] relative flex justify-center">
                        {/* Decorative Pillar Details */}
                        <div className="w-2 h-full bg-gradient-to-b from-white/10 to-transparent" />
                        <div className="absolute top-[30%] w-14 -left-2 h-4 bg-gradient-to-r from-amber-500 to-amber-800 rounded-full shadow-lg" />
                        <div className="absolute top-[70%] w-16 -left-3 h-5 bg-gradient-to-r from-amber-600 to-amber-900 rounded-full shadow-lg" />
                    </div>
                    {/* Base Plate */}
                    <div className="w-64 h-12 bg-gradient-to-t from-black via-[#1a0f05] to-amber-900 rounded-t-[50%] border-t-4 border-amber-600 shadow-[0_20px_50px_rgba(0,0,0,1)] z-10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20 mix-blend-multiply" />
                    </div>

                </div>

                {/* Controls (Glassmorphism Panel) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl flex items-center justify-between px-6 py-4 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-30">
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={addBad} 
                        className="flex items-center gap-3 px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-full font-black text-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    >
                        <Plus className="w-6 h-6" /> سيئة
                    </motion.button>
                    
                    <button onClick={reset} className="px-6 py-3 bg-transparent text-white/30 hover:text-white rounded-full text-sm font-bold transition-all uppercase tracking-widest">
                        تفريغ الميزان
                    </button>

                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={addGood} 
                        className="flex items-center gap-3 px-8 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full font-black text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                        <Plus className="w-6 h-6" /> حسنة
                    </motion.button>
                </div>
            </div>
        </section>
    );
}
