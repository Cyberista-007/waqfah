'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { Feather, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RevelationCave() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    // Smooth flashlight movement
    const smoothX = useSpring(mouseX, { damping: 25, stiffness: 200, mass: 0.5 });
    const smoothY = useSpring(mouseY, { damping: 25, stiffness: 200, mass: 0.5 });

    useEffect(() => {
        const handlePointerMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('pointermove', handlePointerMove);
            container.addEventListener('pointerenter', () => setIsHovering(true));
            container.addEventListener('pointerleave', () => setIsHovering(false));
        }
        return () => {
            if (container) {
                container.removeEventListener('pointermove', handlePointerMove);
                container.removeEventListener('pointerenter', () => setIsHovering(true));
                container.removeEventListener('pointerleave', () => setIsHovering(false));
            }
        };
    }, [mouseX, mouseY]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });
    
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    
    // Create motion templates for 60fps CSS properties
    const maskImage = useMotionTemplate`radial-gradient(circle 350px at ${smoothX}px ${smoothY}px, black 0%, transparent 100%)`;
    const flashlightBg = useMotionTemplate`radial-gradient(circle 400px at ${smoothX}px ${smoothY}px, transparent 0%, rgba(2,2,2,0.98) 100%)`;
    const cursorBg = useMotionTemplate`radial-gradient(circle 50px at ${smoothX}px ${smoothY}px, rgba(16,185,129,0.3) 0%, transparent 100%)`;

    return (
        <section 
            ref={containerRef}
            className="relative min-h-[120vh] flex items-center justify-center overflow-hidden bg-transparent py-32 border-y border-white/5 cursor-none touch-none" 
            dir="rtl"
        >
            {/* Dark Cave Parallax Background Texture */}
            <motion.div 
                style={{ y: bgY }} 
                className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] z-0 pointer-events-none scale-110" 
            />

            {/* Solid Dark Overlay that gets "punched out" by the flashlight */}
            <motion.div
                className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-1000"
                style={{ 
                    background: isHovering ? flashlightBg : `radial-gradient(circle 10px at 50% 50%, transparent 0%, rgba(2,2,2,0.99) 100%)`
                }}
            />

            {/* Glowing Torch Cursor effect */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-30 mix-blend-screen transition-opacity duration-500"
                style={{ 
                    background: isHovering ? cursorBg : 'transparent',
                    opacity: isHovering ? 1 : 0
                }}
            />

            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div className="w-full text-center">
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="mb-16"
                    >
                        <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 font-black text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(16,185,129,0.3)] backdrop-blur-md">
                            <Feather className="w-5 h-5 animate-pulse" />
                            غار حراء - ليلة القدر
                        </div>
                    </motion.div>

                    {/* The Carved Verses in Stone */}
                    <div className="relative group mb-32 h-32 flex items-center justify-center">
                        {/* Base text (dimly lit, barely visible carved rock) */}
                        <h2 className="absolute text-5xl md:text-[8rem] font-black text-white/5 font-headline leading-none select-none blur-[1px]">
                            اقْرَأْ بِاسْمِ رَبِّكَ
                        </h2>
                        <h2 className="absolute text-5xl md:text-[8rem] font-black text-black font-headline leading-none select-none translate-y-1 translate-x-1 opacity-50">
                            اقْرَأْ بِاسْمِ رَبِّكَ
                        </h2>
                        
                        {/* Highlighted text that only shows under the flashlight using CSS mask */}
                        <motion.h2 
                            className="absolute text-5xl md:text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-100 to-emerald-400 font-headline leading-none select-none pointer-events-none drop-shadow-[0_0_30px_rgba(16,185,129,1)]"
                            style={{ 
                                WebkitMaskImage: isHovering ? maskImage : 'none',
                                maskImage: isHovering ? maskImage : 'none',
                                opacity: isHovering ? 1 : 0
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            اقْرَأْ بِاسْمِ رَبِّكَ
                        </motion.h2>
                    </div>

                    <div className="space-y-10 text-2xl md:text-4xl text-white/30 font-bold leading-relaxed w-full mix-blend-screen relative z-10 px-4">
                        <p className="hover:text-white/80 transition-colors duration-700 cursor-default">
                            في سكون الليل العظيم، نزل أمين الوحي جبريل عليه السلام يضم النبي ﷺ ضمة شديدة...
                        </p>
                        <p className="hover:text-emerald-400 transition-colors duration-700 cursor-default drop-shadow-lg">
                            ثم أرسله ليقول له الكلمة التي أيقظت البشرية: <span className="text-emerald-300">«اقرأ»</span>.
                        </p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="mt-32 p-12 rounded-[4rem] bg-gradient-to-br from-[#0a0a0a] to-black border border-emerald-900/30 inline-block text-center w-full shadow-[0_40px_100px_rgba(0,0,0,0.9),inset_0_0_50px_rgba(16,185,129,0.05)] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none mix-blend-overlay" />
                        
                        <p className="text-emerald-500 font-black text-sm uppercase tracking-[0.4em] mb-8 relative z-10">أول ما نزل من القرآن الكريم</p>
                        <p className="text-4xl md:text-5xl text-emerald-50 font-headline leading-loose relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,1)]">
                            ﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ * خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ * اقْرَأْ وَرَبُّكَ الْأَكْرَمُ * الَّذِي عَلَّمَ بِالْقَلَمِ ﴾
                        </p>
                    </motion.div>

                </div>
            </div>
            
            {/* Custom Interactive Flashlight Cursor instructions */}
            <motion.div 
                animate={{ opacity: isHovering ? 0 : 0.6 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 border border-white/10 px-8 py-4 rounded-full backdrop-blur-md z-30 pointer-events-none"
            >
                <Compass className="w-5 h-5 text-emerald-500 animate-spin-slow" />
                <span className="text-sm font-black text-emerald-100/70 uppercase tracking-widest">المس الغار لتكتشف النور</span>
            </motion.div>
        </section>
    );
}
