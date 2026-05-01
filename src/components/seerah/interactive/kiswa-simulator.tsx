'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

export function KiswaSimulator() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    // High performance motion values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    // Construct the radial gradient string using useTransform for 60fps
    const goldGlowStyle = useTransform(
        [smoothX, smoothY],
        ([x, y]) => `radial-gradient(circle 500px at ${x}px ${y}px, rgba(253, 230, 138, 0.4) 0%, rgba(245, 158, 11, 0.15) 40%, transparent 100%)`
    );

    const threadShineStyle = useTransform(
        [smoothX, smoothY],
        ([x, y]) => `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px), 
            radial-gradient(circle 250px at ${x}px ${y}px, rgba(255, 215, 0, 0.6) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 100%)
        `
    );

    const tiltX = useTransform(smoothY, [0, 800], [5, -5]);
    const tiltY = useTransform(smoothX, [0, 1000], [-5, 5]);

    return (
        <section 
            ref={containerRef}
            className="relative h-[90vh] bg-transparent overflow-hidden border-y border-amber-900/30 flex items-center justify-center cursor-crosshair touch-none perspective-[1500px]" 
            dir="rtl"
            onPointerMove={handlePointerMove}
            onPointerEnter={() => setIsHovering(true)}
            onPointerLeave={() => setIsHovering(false)}
        >
            {/* Base Black Cloth Texture (High Fidelity Silk) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/woven-light.png')] opacity-40 mix-blend-multiply pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#050505] -z-10" />

            <motion.div 
                className="relative z-10 w-full max-w-5xl px-8 flex flex-col items-center gap-16 pointer-events-none transform-gpu"
                style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
            >
                {/* Decorative border top */}
                <div className="w-full h-12 border-y-[3px] border-amber-600/40 flex items-center justify-between px-6 bg-amber-900/10 shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
                     {[...Array(30)].map((_, i) => (
                         <div key={i} className="w-1.5 h-6 bg-gradient-to-b from-amber-300 to-amber-700 rounded-full shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                     ))}
                </div>

                {/* Main Text */}
                <div className="relative">
                    {/* Shadow layer for depth */}
                    <h2 className="absolute top-2 left-2 text-7xl md:text-[9rem] font-black text-black font-quran text-center leading-tight blur-[4px]">
                        لَا إِلَٰهَ إِلَّا اللَّهُ<br/>مُحَمَّدٌ رَسُولُ اللَّهِ
                    </h2>
                    
                    <h2 
                        className="text-7xl md:text-[9rem] font-black text-transparent bg-clip-text font-quran text-center leading-tight drop-shadow-[0_10px_30px_rgba(245,158,11,0.3)] relative z-10"
                        style={{
                            backgroundImage: `linear-gradient(135deg, #fef3c7 0%, #f59e0b 40%, #b45309 80%, #78350f 100%)`
                        }}
                    >
                        لَا إِلَٰهَ إِلَّا اللَّهُ<br/>
                        مُحَمَّدٌ رَسُولُ اللَّهِ
                    </h2>
                </div>

                <div className="flex w-full justify-between px-20">
                    <div className="text-center relative">
                        <span className="absolute top-1 left-1 text-black blur-[2px] text-4xl font-quran">يَا حَيُّ يَا قَيُّومُ</span>
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 text-4xl font-quran tracking-widest drop-shadow-md relative z-10">
                            يَا حَيُّ يَا قَيُّومُ
                        </p>
                    </div>
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent" />
                    <div className="text-center relative">
                        <span className="absolute top-1 left-1 text-black blur-[2px] text-4xl font-quran">يَا رَحْمَٰنُ يَا رَحِيمُ</span>
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-200 text-4xl font-quran tracking-widest drop-shadow-md relative z-10">
                            يَا رَحْمَٰنُ يَا رَحِيمُ
                        </p>
                    </div>
                </div>

                {/* Decorative border bottom */}
                <div className="w-full h-12 border-y-[3px] border-amber-600/40 flex items-center justify-between px-6 bg-amber-900/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                     {[...Array(30)].map((_, i) => (
                         <div key={i} className="w-1.5 h-6 bg-gradient-to-b from-amber-300 to-amber-700 rounded-full shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                     ))}
                </div>
            </motion.div>

            {/* Dynamic Gold Reflection Overlay */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
                animate={{ opacity: isHovering ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                style={{ background: goldGlowStyle as any }}
            />

            {/* Thread Shine Overlay (Simulates silk/gold threads reacting to light) */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-30 mix-blend-color-dodge"
                animate={{ opacity: isHovering ? 0.9 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ background: threadShineStyle as any }}
            />
            
            {/* Interactive Instruction */}
            <motion.div 
                animate={{ opacity: isHovering ? 0 : 0.6, y: isHovering ? 20 : 0 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 rounded-full bg-black/50 border border-amber-500/20 backdrop-blur-md z-40"
            >
                <div className="relative flex items-center justify-center w-3 h-3">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </div>
                <span className="text-amber-500 font-black text-sm uppercase tracking-widest drop-shadow-md">المس خيوط الذهب</span>
            </motion.div>
        </section>
    );
}
