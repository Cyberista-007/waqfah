'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, ScanEye } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TimeLens() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    // Using MotionValues for 60fps performance without React re-renders
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth physics
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const radius = useSpring(isHovering ? 180 : 0, { damping: 20, stiffness: 100 });

    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Start at center
            mouseX.set(rect.width / 2);
            mouseY.set(rect.height / 2);
        }
    }, [mouseX, mouseY]);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    // Transform clip-path strings
    const clipPathStr = useTransform(
        [springX, springY, radius],
        ([x, y, r]) => `circle(${r}px at ${x}px ${y}px)`
    );

    return (
        <section className="py-32 bg-black relative border-y border-white/5 overflow-hidden" dir="rtl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
            
            <div className="w-full px-4 md:px-8 lg:px-12 mb-16 text-center relative z-10">
                <div className="w-16 h-16 mx-auto bg-amber-900/30 rounded-full flex items-center justify-center mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <ScanEye className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 font-headline mb-4 tracking-tighter">عدسة الزمن</h2>
                <p className="text-white/40 text-lg font-bold max-w-xl mx-auto">
                    عدسة سحرية تكشف لك شكل يثرب (المدينة المنورة قديماً) مقارنة بمعالمها اليوم. امسح بيدك أو بمؤشرك لفتح بوابة عبر الزمان.
                </p>
            </div>

            <div 
                ref={containerRef}
                className="relative w-full max-w-6xl h-[600px] md:h-[700px] mx-auto rounded-[3.5rem] overflow-hidden cursor-crosshair border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] touch-none"
                onPointerMove={handlePointerMove}
                onPointerDown={() => { setIsHovering(true); radius.set(180); }}
                onPointerUp={() => { setIsHovering(false); radius.set(0); }}
                onPointerEnter={() => { setIsHovering(true); radius.set(180); }}
                onPointerLeave={() => { setIsHovering(false); radius.set(0); }}
            >
                {/* Modern Image (Background) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                    style={{ 
                        backgroundImage: "url('/madinah_early_mosque_cinematic_1777413331481.png')",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />
                </div>

                {/* Ancient Image (Foreground via Clip-Path) */}
                <motion.div 
                    className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105"
                    style={{ 
                        backgroundImage: "url('/palestine_gallery_jerusalem_old_city_1777281398422.png')", // Placeholder for ancient city
                        filter: "sepia(0.8) hue-rotate(-15deg) contrast(1.4) saturate(1.2)",
                        clipPath: clipPathStr as any
                    }}
                >
                    <div className="absolute inset-0 bg-amber-900/30 mix-blend-color" />
                </motion.div>

                {/* The Physical Lens UI (Follows the pointer) */}
                <motion.div 
                    className="absolute top-0 left-0 pointer-events-none flex items-center justify-center"
                    style={{
                        x: springX,
                        y: springY,
                        scale: useTransform(radius, [0, 180], [0, 1]),
                        opacity: useTransform(radius, [0, 180], [0, 1])
                    }}
                >
                    <div className="absolute -translate-x-1/2 -translate-y-1/2">
                        {/* Lens Ring */}
                        <div className="w-[360px] h-[360px] rounded-full border-[8px] border-[#3a2008] border-r-amber-500/50 border-b-amber-600/30 shadow-[inset_0_0_60px_rgba(245,158,11,0.6),0_20px_50px_rgba(0,0,0,0.9)] relative backdrop-blur-[2px]">
                            {/* Inner Gold Trim */}
                            <div className="absolute inset-1 rounded-full border border-amber-400/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
                            
                            {/* Glass Glare */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent rotate-45 mix-blend-screen" />
                            <div className="absolute inset-4 rounded-full bg-gradient-to-tl from-amber-500/10 via-transparent to-transparent blur-md" />

                            {/* Chromatic Aberration Simulation (Edges) */}
                            <div className="absolute -inset-1 rounded-full border-2 border-red-500/20 mix-blend-screen translate-x-1" />
                            <div className="absolute -inset-1 rounded-full border-2 border-cyan-500/20 mix-blend-screen -translate-x-1" />
                        </div>

                        {/* Floating dust inside the lens */}
                        <Sparkles className="absolute top-1/4 right-1/4 w-8 h-8 text-amber-200/50 animate-pulse" />
                        <Sparkles className="absolute bottom-1/3 left-1/3 w-6 h-6 text-amber-300/30 animate-pulse delay-700" />
                    </div>
                </motion.div>

                {/* Instruction Overlay when not hovering */}
                <motion.div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    animate={{ opacity: isHovering ? 0 : 1, scale: isHovering ? 1.1 : 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="px-8 py-4 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white font-black tracking-widest text-sm flex items-center gap-4 shadow-2xl">
                        <div className="relative flex items-center justify-center w-4 h-4">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </div>
                        اسحب المؤشر لفتح البوابة
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
