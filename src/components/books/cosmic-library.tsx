'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, ChevronRight, ChevronLeft, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const BOOKS = [
    { id: '1', title: 'الرحيق المختوم', author: 'صفي الرحمن المباركفوري', color: 'from-amber-600 to-amber-900', shadow: 'shadow-amber-500/50', accent: 'text-amber-300' },
    { id: '2', title: 'زاد المعاد', author: 'ابن قيم الجوزية', color: 'from-emerald-600 to-emerald-900', shadow: 'shadow-emerald-500/50', accent: 'text-emerald-300' },
    { id: '3', title: 'البداية والنهاية', author: 'ابن كثير', color: 'from-blue-600 to-blue-900', shadow: 'shadow-blue-500/50', accent: 'text-blue-300' },
    { id: '4', title: 'رياض الصالحين', author: 'الإمام النووي', color: 'from-rose-600 to-rose-900', shadow: 'shadow-rose-500/50', accent: 'text-rose-300' },
    { id: '5', title: 'السيرة النبوية', author: 'ابن هشام', color: 'from-purple-600 to-purple-900', shadow: 'shadow-purple-500/50', accent: 'text-purple-300' },
];

export function CosmicLibrary() {
    const [activeIndex, setActiveIndex] = useState(2);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const next = () => setActiveIndex((prev) => (prev + 1) % BOOKS.length);
    const prev = () => setActiveIndex((prev) => (prev - 1 + BOOKS.length) % BOOKS.length);

    if (!isClient) return null;

    return (
        <section className="py-40 bg-[#020202] relative overflow-hidden min-h-[900px] flex flex-col justify-center border-y border-white/5" dir="rtl">
            {/* Cosmic Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full" />

            <div className="container mx-auto px-4 text-center mb-32 relative z-10">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 backdrop-blur-md">
                    <Star className="w-8 h-8 text-white/80" />
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 font-headline mb-4 tracking-tighter drop-shadow-lg">مكتبة النور</h2>
                <p className="text-white/40 text-xl font-bold">تصفح أمهات الكتب في فضاء المعرفة، حيث كل كتاب كوكب يضيء عقلك.</p>
            </div>

            <div className="relative w-full h-[500px] perspective-[2000px] flex items-center justify-center z-20">
                
                {/* 3D Reflective Floor */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200vw] h-[400px] bg-gradient-to-t from-transparent to-white/5 rounded-[100%] blur-3xl opacity-50 transform rotate-x-60 translate-y-1/2 pointer-events-none" />

                {BOOKS.map((book, idx) => {
                    const offset = idx - activeIndex;
                    const isCenter = offset === 0;
                    
                    let visualOffset = offset;
                    if (offset > 2) visualOffset -= BOOKS.length;
                    if (offset < -2) visualOffset += BOOKS.length;

                    const absOffset = Math.abs(visualOffset);
                    const zIndex = 100 - absOffset * 10;
                    const scale = 1 - absOffset * 0.2;
                    const rotateY = visualOffset * -30; // Tilt towards center
                    const translateX = visualOffset * 280; // Spread out horizontally
                    const opacity = absOffset > 2 ? 0 : 1 - absOffset * 0.3;

                    return (
                        <motion.div
                            key={book.id}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] md:w-[350px] h-[400px] md:h-[500px] transform-gpu cursor-pointer"
                            initial={false}
                            animate={{
                                x: `calc(-50% + ${translateX}px)`,
                                rotateY: `${rotateY}deg`,
                                scale,
                                zIndex,
                                opacity,
                                // Continuous floating animation only for the center item
                                y: isCenter ? [0, -15, 0] : 0
                            }}
                            transition={{ 
                                type: "spring", stiffness: 100, damping: 20, mass: 1,
                                y: isCenter ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { type: "spring" }
                            }}
                            onClick={() => setActiveIndex(idx)}
                        >
                            {/* Book Body (Monolith style) */}
                            <div className={cn("w-full h-full rounded-[2.5rem] border border-white/20 relative group overflow-hidden bg-gradient-to-br shadow-[0_40px_80px_rgba(0,0,0,0.9)] transition-all duration-700", book.color, isCenter ? book.shadow : "")}>
                                
                                {/* Spine Texture */}
                                <div className="absolute left-0 top-0 bottom-0 w-10 bg-black/50 border-r border-white/10 shadow-[inset_-5px_0_10px_rgba(0,0,0,0.6)] z-10" />
                                
                                {/* Inner Content */}
                                <div className="absolute inset-0 p-10 flex flex-col justify-between items-center text-center pl-14 z-20">
                                    <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-xl backdrop-blur-md">
                                        <Book className="w-10 h-10 text-white" />
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="text-4xl font-black text-white font-headline mb-4 leading-tight drop-shadow-lg">{book.title}</h3>
                                        <p className={cn("font-bold text-lg tracking-wide uppercase", book.accent)}>{book.author}</p>
                                    </div>

                                    {/* Action Button */}
                                    <motion.button 
                                        animate={{ opacity: isCenter ? 1 : 0, y: isCenter ? 0 : 20, scale: isCenter ? 1 : 0.9 }}
                                        className="mt-8 px-10 py-4 rounded-full bg-white text-black font-black hover:scale-105 transition-transform w-full shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center justify-center gap-3"
                                    >
                                        <Book className="w-5 h-5" /> تصفح المخطوط
                                    </motion.button>
                                </div>

                                {/* Cinematic Overlays & Reflections */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-10" />
                                <div className="absolute inset-0 bg-gradient-to-bl from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30 mix-blend-overlay" />
                                
                                {isCenter && (
                                    <>
                                        <Sparkles className="absolute top-6 right-6 w-8 h-8 text-white/60 animate-pulse z-40" />
                                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000 z-30" />
                                    </>
                                )}
                            </div>
                            
                            {/* Fake Reflection below the book */}
                            <div className={cn("absolute -bottom-[20px] left-0 w-full h-20 bg-gradient-to-t to-transparent opacity-30 rounded-[100%] blur-xl", book.color.replace('from-', 'from-').split(' ')[0])} />
                        </motion.div>
                    );
                })}
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30 bg-white/5 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 shadow-2xl">
                <button onClick={prev} className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all">
                    <ChevronRight className="w-8 h-8" />
                </button>
                <div className="flex gap-3">
                    {BOOKS.map((_, idx) => (
                        <div key={idx} className={cn("h-2 rounded-full transition-all duration-500", idx === activeIndex ? "w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "w-3 bg-white/20")} />
                    ))}
                </div>
                <button onClick={next} className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all">
                    <ChevronLeft className="w-8 h-8" />
                </button>
            </div>
        </section>
    );
}
