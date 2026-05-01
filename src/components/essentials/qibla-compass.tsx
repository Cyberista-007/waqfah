'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Compass, LocateFixed } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QiblaCompass() {
    const [rotation, setRotation] = useState(0);
    const [isAligned, setIsAligned] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 3D Tilt values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    const springConfig = { damping: 20, stiffness: 150 };
    const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
    const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            
            // For 3D Tilt
            const xPct = (e.clientX - rect.left) / rect.width - 0.5;
            const yPct = (e.clientY - rect.top) / rect.height - 0.5;
            mouseX.set(xPct);
            mouseY.set(yPct);

            // For Rotation
            const centerX = rect.left + rect.width / 2;
            const deltaX = e.clientX - centerX;
            const maxAngle = 180;
            const calculatedRotation = (deltaX / (window.innerWidth / 2)) * maxAngle;
            
            setRotation(calculatedRotation);

            // Assume Qibla is around 0 degrees for this simulation
            setIsAligned(Math.abs(calculatedRotation) < 5);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Haptic feedback when aligned
    useEffect(() => {
        if (isAligned && typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([100, 50, 100]); // Stronger haptic for locking in
        }
    }, [isAligned]);

    return (
        <div ref={containerRef} className="relative py-32 bg-[#050505] flex flex-col items-center justify-center overflow-hidden border-y border-white/5 perspective-[1500px]" dir="rtl">
            {/* Ambient Background Light */}
            <div 
                className={cn("absolute inset-0 transition-opacity duration-1000 pointer-events-none mix-blend-screen", isAligned ? 'opacity-100' : 'opacity-0')}
                style={{ background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)' }}
            />

            <div className="text-center mb-16 relative z-10">
                <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border transition-all duration-700 shadow-2xl",
                    isAligned ? "bg-emerald-900/40 border-emerald-500/30 shadow-emerald-500/20" : "bg-amber-900/40 border-amber-500/20 shadow-amber-500/20"
                )}>
                    <Compass className={cn("w-10 h-10 transition-colors duration-700", isAligned ? "text-emerald-500" : "text-amber-500")} />
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 font-headline mb-4 tracking-tighter">محدد القبلة</h2>
                <p className="text-white/40 text-lg font-bold">
                    أدر جهازك أو حرك المؤشر لتحديد اتجاه بيت الله الحرام.
                </p>
                <div className="h-14 mt-6">
                    {isAligned && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-8 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md"
                        >
                            <LocateFixed className="w-5 h-5 animate-pulse" />
                            أنت في اتجاه القبلة
                        </motion.div>
                    )}
                </div>
            </div>

            {/* The 3D Compass Assembly */}
            <motion.div 
                className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] transform-gpu"
                style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
            >
                {/* Outer Casing */}
                <div className="absolute inset-0 rounded-full border-[12px] border-[#2a1b0f] shadow-[0_40px_80px_rgba(0,0,0,0.9),inset_0_10px_30px_rgba(0,0,0,0.8)] bg-gradient-to-br from-[#1a1410] via-[#0a0806] to-[#1a1410]">
                    {/* Metallic Rim */}
                    <div className="absolute -inset-3 rounded-full border border-white/5 mix-blend-screen" />
                    <div className="absolute inset-0 rounded-full border-2 border-amber-900/50" />
                </div>
                
                {/* Dial Marks */}
                <div className="absolute inset-6 rounded-full border border-amber-900/40" />
                <div className="absolute inset-8 rounded-full border-2 border-amber-800/30 border-dashed" />

                {/* Rotating Inner Plate */}
                <motion.div 
                    className="absolute inset-0 flex items-center justify-center transform-gpu"
                    animate={{ rotate: rotation }}
                    transition={{ type: "spring", stiffness: 60, damping: 20, mass: 1.5 }}
                >
                    {/* Golden Inner Dial */}
                    <div className="absolute w-[80%] h-[80%] rounded-full border-[6px] border-amber-600/30 bg-[#0d0d0d] shadow-inner flex items-center justify-center overflow-hidden">
                        
                        {/* Map Texture */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50" />
                        
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-900/30 via-transparent to-amber-600/10 pointer-events-none" />
                        
                        {/* Kaaba Direction Marker */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <div className={cn("w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent transition-colors duration-500", 
                                isAligned ? "border-b-emerald-500 filter drop-shadow-[0_0_20px_rgba(16,185,129,1)]" : "border-b-amber-500 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                            )} />
                            <span className={cn("font-black text-sm mt-3 uppercase tracking-widest drop-shadow-md transition-colors duration-500", 
                                isAligned ? "text-emerald-400" : "text-amber-500"
                            )}>القبلة</span>
                        </div>

                        {/* Cardinal Directions */}
                        <span className="absolute bottom-8 font-black text-white/20 text-sm tracking-widest">جنوب</span>
                        <span className="absolute left-8 font-black text-white/20 text-sm tracking-widest">غرب</span>
                        <span className="absolute right-8 font-black text-white/20 text-sm tracking-widest">شرق</span>

                        {/* Center Pin & Needle Base */}
                        <div className="absolute w-12 h-12 rounded-full border border-amber-500/20 bg-black/50 backdrop-blur-md flex items-center justify-center shadow-2xl">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 border-2 border-[#3a2716] shadow-[0_5px_15px_rgba(0,0,0,1)] z-20" />
                        </div>
                    </div>
                </motion.div>
                
                {/* Fixed Overlay Highlight (Glass Reflection) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent mix-blend-overlay pointer-events-none" style={{ transform: "translateZ(1px)" }} />
                
                {/* Glow behind compass when aligned */}
                {isAligned && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-full bg-emerald-500/20 blur-[60px] -z-10 pointer-events-none"
                    />
                )}
            </motion.div>
        </div>
    );
}
