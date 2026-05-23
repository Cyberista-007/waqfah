'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Moon, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const HEAVENS = [
    { level: 1, prophet: 'آدم عليه السلام', description: 'السماء الدنيا', color: 'from-blue-900 to-indigo-900', border: 'border-blue-500/30', accent: 'text-blue-300' },
    { level: 2, prophet: 'عيسى ويحيى عليهما السلام', description: 'السماء الثانية', color: 'from-indigo-900 to-violet-900', border: 'border-indigo-500/30', accent: 'text-indigo-300' },
    { level: 3, prophet: 'يوسف عليه السلام', description: 'السماء الثالثة', color: 'from-violet-900 to-purple-900', border: 'border-violet-500/30', accent: 'text-violet-300' },
    { level: 4, prophet: 'إدريس عليه السلام', description: 'السماء الرابعة', color: 'from-purple-900 to-fuchsia-900', border: 'border-purple-500/30', accent: 'text-purple-300' },
    { level: 5, prophet: 'هارون عليه السلام', description: 'السماء الخامسة', color: 'from-fuchsia-900 to-pink-900', border: 'border-fuchsia-500/30', accent: 'text-fuchsia-300' },
    { level: 6, prophet: 'موسى عليه السلام', description: 'السماء السادسة', color: 'from-pink-900 to-rose-900', border: 'border-pink-500/30', accent: 'text-pink-300' },
    { level: 7, prophet: 'إبراهيم عليه السلام', description: 'السماء السابعة', color: 'from-rose-900 to-amber-900', border: 'border-amber-500/30', accent: 'text-amber-300' },
];

export function IsraAscension() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
    const scaleBackground = useTransform(scrollYProgress, [0, 1], [1, 2]);
    const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
    const buraqY = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);

    return (
        <section ref={containerRef} className="relative bg-transparent h-[500vh]" dir="rtl">
            {/* Parallax Stars Background - Zooms in and moves as you scroll up */}
            <div className="sticky top-0 h-screen w-full overflow-hidden perspective-[1000px]">
                <motion.div 
                    className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 mix-blend-screen"
                    style={{ y: yBackground, scale: scaleBackground, transformOrigin: 'center center' }}
                />
                
                {/* Center Glow Tunnel */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />

                <motion.div style={{ opacity }} className="absolute inset-0 flex flex-col items-center justify-center px-4">
                    
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center z-50 pointer-events-none">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)] backdrop-blur-md mb-6">
                            <Moon className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 font-headline tracking-tighter mix-blend-plus-lighter">الإسراء والمعراج</h2>
                        <p className="text-xl text-indigo-200/40 font-bold mt-4 tracking-widest uppercase text-shadow-sm">مرر للصعود عبر السماوات</p>
                    </div>

                    {/* The 7 Heavens Visualization Rings */}
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                        
                        {/* Core Beam */}
                        <div className="absolute left-1/2 -translate-x-1/2 w-[2px] h-[70vh] bg-gradient-to-b from-white/0 via-indigo-500/50 to-white/0" />

                        {HEAVENS.map((heaven, idx) => {
                            // Calculate scroll ranges for each heaven to appear, expand, and pass by
                            const startAppearing = idx * 0.12 + 0.05;
                            const fullyVisible = startAppearing + 0.05;
                            const startDisappearing = fullyVisible + 0.05;
                            const gone = startDisappearing + 0.05;

                            const ringScale = useTransform(scrollYProgress, 
                                [startAppearing, fullyVisible, startDisappearing, gone], 
                                [0.1, 1, 3, 5] // It starts small, gets normal size, then zooms past the camera
                            );
                            
                            const ringOpacity = useTransform(scrollYProgress, 
                                [startAppearing, fullyVisible, startDisappearing, gone], 
                                [0, 1, 0.8, 0]
                            );

                            return (
                                <motion.div
                                    key={heaven.level}
                                    style={{ opacity: ringOpacity, scale: ringScale }}
                                    className="absolute inset-0 flex items-center justify-center origin-center"
                                >
                                    {/* Concentric Heaven Ring */}
                                    <div className={cn("absolute w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] max-w-[600px] max-h-[600px] rounded-full border-[4px] border-dashed shadow-[0_0_100px_rgba(0,0,0,0.5)_inset,0_0_100px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-[2px]", heaven.border, heaven.color.replace('from-', 'shadow-').split(' ')[0] + '/20')} style={{ transform: 'rotateX(60deg)' }} />
                                    
                                    {/* Text Content */}
                                    <div className="relative z-10 text-center bg-black/60 backdrop-blur-xl px-10 py-8 rounded-[3rem] border border-white/10 shadow-2xl">
                                        <div className={cn("text-xs font-black tracking-[0.5em] uppercase mb-2", heaven.accent)}>
                                            {heaven.description}
                                        </div>
                                        <div className="flex items-center justify-center gap-4 text-white">
                                            <Star className="w-5 h-5 opacity-50" />
                                            <h3 className="text-4xl md:text-5xl font-black font-headline text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">{heaven.prophet}</h3>
                                            <Star className="w-5 h-5 opacity-50" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Traveling Light / Buraq Simulation */}
                        <motion.div 
                            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-50"
                            style={{ top: buraqY }}
                        >
                            <div className="w-4 h-16 rounded-full bg-gradient-to-b from-white to-indigo-500/0 blur-[2px]" />
                            <div className="w-6 h-6 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,1),0_0_80px_rgba(99,102,241,0.8)] -mt-4 border-2 border-indigo-200" />
                        </motion.div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
}
