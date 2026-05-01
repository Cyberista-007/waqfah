'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sword, ChevronRight, ChevronLeft, Sparkles, Crosshair, Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ARMORY_ITEMS = [
    {
        id: 'zulfiqar',
        name: "ذو الفقار",
        type: "سيف",
        icon: Sword,
        desc: "أشهر سيوف النبي ﷺ، غنمه يوم بدر، وكان لا يفارقه في حروبه. يتميز بوجود شق في طرفه.",
        color: "text-rose-500",
        shadow: "drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]",
        bg: "from-rose-950 via-[#1a0508] to-black",
        accent: "bg-rose-500",
        border: "border-rose-500/30"
    },
    {
        id: 'al-battar',
        name: "البتار",
        type: "سيف",
        icon: Sword,
        desc: "يُسمى 'سيف الأنبياء'، منقوش عليه أسماء أنبياء كثر. غنمه النبي من بني قينقاع.",
        color: "text-amber-500",
        shadow: "drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]",
        bg: "from-amber-950 via-[#1a0f05] to-black",
        accent: "bg-amber-500",
        border: "border-amber-500/30"
    },
    {
        id: 'al-katum',
        name: "الكتوم",
        type: "قوس",
        icon: Crosshair,
        desc: "قوس النبي ﷺ الذي كُسر يوم أحد فأخذه قتادة بن النعمان.",
        color: "text-stone-300",
        shadow: "drop-shadow-[0_0_30px_rgba(168,162,158,0.8)]",
        bg: "from-stone-900 via-[#111] to-black",
        accent: "bg-stone-400",
        border: "border-stone-500/30"
    },
    {
        id: 'az-zaluq',
        name: "الزلوق",
        type: "درع",
        icon: Shield,
        desc: "درع النبي ﷺ، وسُمي بذلك لملوسة سطحه بحيث ينزلق عنه السلاح فلا يخترقه.",
        color: "text-blue-400",
        shadow: "drop-shadow-[0_0_30px_rgba(96,165,250,0.8)]",
        bg: "from-blue-950 via-[#050b14] to-black",
        accent: "bg-blue-400",
        border: "border-blue-500/30"
    }
];

export function ArmoryGallery() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => setCurrentIndex((prev) => (prev + 1) % ARMORY_ITEMS.length);
    const prev = () => setCurrentIndex((prev) => (prev === 0 ? ARMORY_ITEMS.length - 1 : prev - 1));

    const activeItem = ARMORY_ITEMS[currentIndex];

    return (
        <section className="py-32 relative bg-transparent overflow-hidden border-y border-white/5 perspective-[2000px]" dir="rtl">
            {/* Museum Ambient Lighting */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeItem.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className={cn("absolute inset-0 bg-gradient-to-br opacity-50 z-0", activeItem.bg)}
                />
            </AnimatePresence>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none mix-blend-multiply" />

            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div className="text-center mb-16">
                    <div className="w-16 h-16 mx-auto bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 shadow-2xl backdrop-blur-md transform rotate-45">
                        <Hexagon className="w-8 h-8 text-white/50 -rotate-45" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 font-headline mb-4 tracking-tighter mix-blend-plus-lighter">المتحف النبوي</h2>
                    <p className="text-white/40 text-xl font-bold max-w-2xl mx-auto uppercase tracking-widest">
                        العتاد والسلاح الذي صاحب النبي ﷺ في معاركه
                    </p>
                </div>

                <div className="w-full relative">
                    
                    {/* Interactive Display Case (Glassmorphism) */}
                    <div className="relative h-[550px] md:h-[650px] rounded-[4rem] border-[4px] border-white/5 overflow-hidden bg-black/60 backdrop-blur-2xl shadow-[0_50px_100px_rgba(0,0,0,0.9),inset_0_0_80px_rgba(255,255,255,0.05)] flex items-center justify-center transform-gpu">
                        
                        {/* Glass Reflections */}
                        <div className="absolute top-0 left-0 w-[150%] h-1/2 bg-gradient-to-b from-white/10 to-transparent -rotate-12 transform -translate-y-20 -translate-x-20 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-[150%] h-1/2 bg-gradient-to-t from-white/5 to-transparent rotate-12 transform translate-y-20 translate-x-20 pointer-events-none" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeItem.id}
                                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                exit={{ opacity: 0, scale: 1.1, rotateY: -90 }}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                                className="absolute inset-0 w-full h-full p-8 md:p-16 flex flex-col md:flex-row items-center gap-16"
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* 3D Holographic Item Display */}
                                <div className="flex-1 w-full h-full relative flex items-center justify-center perspective-[1000px]">
                                    {/* Hologram Base */}
                                    <div className="absolute bottom-10 w-48 h-12 rounded-[100%] bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)] blur-[2px]" />
                                    <div className={cn("absolute bottom-12 w-24 h-4 rounded-[100%] blur-[10px]", activeItem.accent)} />
                                    
                                    <motion.div
                                        animate={{ 
                                            y: [-15, 15, -15], 
                                            rotateY: [0, 10, -10, 0] 
                                        }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                        className="relative z-10 transform-gpu"
                                    >
                                        <activeItem.icon 
                                            className={cn("w-64 h-64 md:w-80 md:h-80 opacity-90", activeItem.color, activeItem.shadow)} 
                                            strokeWidth={0.5} 
                                        />
                                        
                                        {/* Sparkles */}
                                        <Sparkles className={cn("absolute top-10 right-10 w-10 h-10 animate-ping opacity-70 mix-blend-screen", activeItem.color)} />
                                        <Sparkles className={cn("absolute bottom-20 left-10 w-6 h-6 animate-ping animation-delay-2000 opacity-50 mix-blend-screen", activeItem.color)} />
                                    </motion.div>
                                </div>

                                {/* Information Panel */}
                                <div className="flex-1 text-center md:text-right relative z-20 bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl">
                                    <div className={cn("px-5 py-2 rounded-full bg-white/10 border text-xs font-black uppercase tracking-[0.3em] mb-8 inline-flex items-center gap-2", activeItem.border, activeItem.color)}>
                                        <div className={cn("w-2 h-2 rounded-full animate-pulse", activeItem.accent)} />
                                        {activeItem.type}
                                    </div>
                                    <h3 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 font-headline mb-6 tracking-tighter drop-shadow-2xl">
                                        {activeItem.name}
                                    </h3>
                                    <div className={cn("w-20 h-1 rounded-full mb-6", activeItem.accent)} />
                                    <p className="text-xl md:text-2xl text-white/80 font-bold leading-loose drop-shadow-md">
                                        {activeItem.desc}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Controls (Outside Display Case) */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-6 md:-left-16 z-30">
                        <button onClick={next} className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 text-white hover:scale-110 transition-all backdrop-blur-xl shadow-2xl">
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-6 md:-right-16 z-30">
                        <button onClick={prev} className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 text-white hover:scale-110 transition-all backdrop-blur-xl shadow-2xl">
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Pagination Indicators */}
                    <div className="flex justify-center gap-4 mt-12">
                        {ARMORY_ITEMS.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "h-2 rounded-full transition-all duration-500 border border-white/10",
                                    idx === currentIndex ? cn("w-12 shadow-[0_0_10px_rgba(255,255,255,0.5)]", item.accent) : "w-3 bg-white/20 hover:bg-white/40"
                                )}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
