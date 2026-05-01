'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Swords, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Constellations data (Sahaba at Badr)
const SAHABA_BADR = [
    { id: '1', name: "حمزة بن عبد المطلب", role: "أسد الله وسيد الشهداء", x: 30, y: 20, size: 5, color: "bg-amber-300" },
    { id: '2', name: "علي بن أبي طالب", role: "حامل لواء النبي ﷺ", x: 55, y: 35, size: 5, color: "bg-blue-300" },
    { id: '3', name: "أبو بكر الصديق", role: "صاحب النبي في العريش", x: 45, y: 15, size: 6, color: "bg-white" },
    { id: '4', name: "عمر بن الخطاب", role: "الفاروق المدافع", x: 20, y: 45, size: 4, color: "bg-emerald-300" },
    { id: '5', name: "عبيدة بن الحارث", role: "أول شهيد في المبارزة", x: 70, y: 60, size: 4, color: "bg-rose-300" },
    { id: '6', name: "سعد بن معاذ", role: "سيد الأنصار وحامل لوائهم", x: 40, y: 70, size: 4, color: "bg-teal-300" },
    { id: '7', name: "المقداد بن عمرو", role: "أول فارس في الإسلام", x: 80, y: 25, size: 3, color: "bg-indigo-300" },
    { id: '8', name: "عمار بن ياسر", role: "الطيب المطيب", x: 60, y: 80, size: 3, color: "bg-purple-300" },
    { id: '9', name: "بلال بن رباح", role: "مؤذن رسول الله", x: 85, y: 50, size: 4, color: "bg-fuchsia-300" },
];

// Define paths to draw constellation lines
const CONSTELLATION_LINES = [
    ['3', '1'], ['3', '2'], ['1', '4'], ['2', '7'], ['2', '5'], ['5', '9'], ['6', '5'], ['6', '8']
];

export function BadrSky() {
    const [hoveredSahabi, setHoveredSahabi] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    // High perf parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 100, mass: 0.5 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => { setIsClient(true); }, []);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    // Memoize background stars to prevent re-rendering
    const bgStars = useMemo(() => {
        const stars = [];
        for (let i = 0; i < 200; i++) {
            const size = Math.random() * 2.5;
            stars.push(
                <div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        opacity: Math.random() * 0.5 + 0.1,
                        animation: `twinkle ${Math.random() * 4 + 2}s infinite alternate`
                    }}
                />
            );
        }
        return stars;
    }, []);

    const bgX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
    const bgY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
    const fgX = useTransform(smoothX, [-0.5, 0.5], [-40, 40]);
    const fgY = useTransform(smoothY, [-0.5, 0.5], [-40, 40]);

    if (!isClient) return null;

    return (
        <section 
            ref={containerRef}
            onPointerMove={handlePointerMove}
            className="relative h-[90vh] bg-transparent overflow-hidden border-y border-blue-900/30 perspective-[1000px] touch-none" 
            dir="rtl"
        >
            <style jsx>{`
                @keyframes twinkle {
                    0% { opacity: 0.1; transform: scale(0.8); }
                    100% { opacity: 0.9; transform: scale(1.5); box-shadow: 0 0 5px rgba(255,255,255,0.8); }
                }
                .shooting-star {
                    position: absolute;
                    width: 150px;
                    height: 1px;
                    background: linear-gradient(90deg, rgba(255,255,255,1), transparent);
                    animation: shooting 6s infinite linear;
                }
                @keyframes shooting {
                    0% { transform: translateX(200%) translateY(-200%) rotate(35deg); opacity: 1; }
                    100% { transform: translateX(-200%) translateY(200%) rotate(35deg); opacity: 0; }
                }
            `}</style>

            {/* Deep Space Background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/20 via-[#02050a] to-[#02050a] z-0 pointer-events-none" />
            
            {/* Parallax Background Stars */}
            <motion.div 
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ x: bgX, y: bgY }}
            >
                {bgStars}
            </motion.div>

            {/* Shooting Stars */}
            <div className="shooting-star top-[10%] left-[70%] opacity-60 z-0" style={{ animationDelay: '2s' }} />
            <div className="shooting-star top-[40%] left-[90%] opacity-30 z-0" style={{ animationDelay: '5s' }} />

            <div className="absolute inset-0 z-10 p-12 flex flex-col justify-between pointer-events-none">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 font-black text-sm uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <Swords className="w-5 h-5" />
                        السابع عشر من رمضان - السنة 2 هـ
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200/50 font-headline leading-tight mb-6 drop-shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
                        سماء بدر المرصعة
                    </h2>
                    <p className="text-2xl text-blue-100/70 font-bold leading-relaxed">
                        كانوا ثلاثمائة وبضعة عشر رجلاً، لكنهم أضاءوا تاريخ الأمة كنجوم السماء في ليلة ظلماء. مرّر المؤشر لاكتشاف كوكبة الفرسان.
                    </p>
                </div>
            </div>

            {/* Constellations Layer (Foreground Parallax) */}
            <motion.div 
                className="absolute inset-0 z-20"
                style={{ x: fgX, y: fgY }}
            >
                {/* SVG Lines connecting the stars */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0 0 5px rgba(255,255,255,0.5))" }}>
                    {CONSTELLATION_LINES.map(([id1, id2], i) => {
                        const s1 = SAHABA_BADR.find(s => s.id === id1)!;
                        const s2 = SAHABA_BADR.find(s => s.id === id2)!;
                        const isHovered = hoveredSahabi === id1 || hoveredSahabi === id2;
                        
                        return (
                            <motion.line
                                key={i}
                                x1={`${s1.x}%`}
                                y1={`${s1.y}%`}
                                x2={`${s2.x}%`}
                                y2={`${s2.y}%`}
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                                animate={{
                                    stroke: isHovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
                                    strokeWidth: isHovered ? 2 : 1
                                }}
                                transition={{ duration: 0.3 }}
                            />
                        );
                    })}
                </svg>

                {/* The Stars */}
                {SAHABA_BADR.map((sahabi) => (
                    <motion.div
                        key={sahabi.id}
                        className="absolute group cursor-pointer -translate-x-1/2 -translate-y-1/2"
                        style={{ top: `${sahabi.y}%`, left: `${sahabi.x}%` }}
                        onMouseEnter={() => setHoveredSahabi(sahabi.id)}
                        onMouseLeave={() => setHoveredSahabi(null)}
                        whileHover={{ scale: 1.5, zIndex: 50 }}
                    >
                        {/* The Star Visuals */}
                        <div className="relative flex items-center justify-center">
                            {/* Outer Glow */}
                            <div 
                                className={cn("absolute rounded-full blur-xl opacity-30 group-hover:opacity-100 transition-opacity duration-500", sahabi.color.replace('bg-', 'bg-').split('-')[1] ? `bg-${sahabi.color.split('-')[1]}-500` : "bg-white")} 
                                style={{ width: sahabi.size * 15, height: sahabi.size * 15 }} 
                            />
                            {/* Inner Brightness */}
                            <div 
                                className={cn("absolute rounded-full shadow-[0_0_20px_#fff] group-hover:scale-150 transition-transform duration-500", sahabi.color)} 
                                style={{ width: sahabi.size * 2.5, height: sahabi.size * 2.5 }} 
                            />
                            {/* Core */}
                            <div className="w-1.5 h-1.5 bg-white rounded-full z-10 shadow-lg" />
                        </div>

                        {/* Tooltip */}
                        <AnimatePresence>
                            {hoveredSahabi === sahabi.id && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.3, type: "spring" }}
                                    className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-64 p-5 rounded-3xl bg-[#0a1020]/90 backdrop-blur-xl border border-blue-500/30 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(59,130,246,0.2)] pointer-events-none z-50"
                                >
                                    <div className="w-10 h-10 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                                        <Star className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h4 className="text-white font-black text-xl mb-2">{sahabi.name}</h4>
                                    <p className="text-blue-300 font-bold text-sm bg-blue-900/30 py-1.5 rounded-full">{sahabi.role}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </motion.div>
            
            {/* Interactive Instructions */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-3 opacity-50">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                <span className="text-blue-200 font-bold uppercase tracking-widest text-xs">حرك المؤشر عبر الكوكبة</span>
            </div>
            
            {/* Bottom fading edge */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#02050a] to-transparent z-10 pointer-events-none" />
        </section>
    );
}
