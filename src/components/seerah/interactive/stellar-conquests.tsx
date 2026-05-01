'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Map, Star, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Nodes represent major cities/events
const NODES = [
    { id: 'makkah', x: 45, y: 75, label: 'مكة المكرمة', delay: 0.5, desc: 'مهبط الوحي ومنطلق الدعوة الإسلامية للعالمين.' },
    { id: 'madinah', x: 40, y: 55, label: 'المدينة المنورة', delay: 1.5, desc: 'عاصمة الإسلام الأولى ومحضن النبي ﷺ.' },
    { id: 'khaybar', x: 35, y: 45, label: 'خيبر', delay: 2.5, desc: 'فتح خيبر العظيم، حصن اليهود المنيع.' },
    { id: 'tabuk', x: 30, y: 30, label: 'تبوك', delay: 3.5, desc: 'آخر غزوات النبي ﷺ، جيش العسرة.' },
    { id: 'muta', x: 25, y: 20, label: 'مؤتة', delay: 4.5, desc: 'أول مواجهة عسكرية كبرى مع الروم.' },
    { id: 'yemen', x: 55, y: 90, label: 'اليمن', delay: 5.5, desc: 'إسلام أهل اليمن برسالة النبي ﷺ.' },
];

// Paths connect nodes using SVG Path commands (Q/C)
const PATHS = [
    { from: 'makkah', to: 'madinah', d: 'M 45 75 Q 35 65 40 55' },
    { from: 'madinah', to: 'khaybar', d: 'M 40 55 Q 35 50 35 45' },
    { from: 'madinah', to: 'tabuk', d: 'M 40 55 Q 50 40 30 30' },
    { from: 'tabuk', to: 'muta', d: 'M 30 30 Q 20 25 25 20' },
    { from: 'makkah', to: 'yemen', d: 'M 45 75 Q 60 80 55 90' },
];

export function StellarConquests() {
    const [animationComplete, setAnimationComplete] = useState(false);
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
    const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [40, 10, 40]);

    useEffect(() => {
        const timer = setTimeout(() => setAnimationComplete(true), 6000);
        return () => clearTimeout(timer);
    }, []);

    const selectedNodeData = NODES.find(n => n.id === activeNode);

    return (
        <section ref={containerRef} className="py-32 bg-transparent relative overflow-hidden min-h-[900px] border-y border-white/5 perspective-[2000px]" dir="rtl">
            {/* Deep Galaxy Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />

            <div className="w-full px-4 md:px-8 lg:px-12 text-center mb-16 relative z-10">
                <div className="w-20 h-20 mx-auto bg-blue-900/30 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)] backdrop-blur-md relative group">
                    <Map className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                    <Star className="absolute top-0 right-0 w-6 h-6 text-white/80 animate-ping" />
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 font-headline mb-4 tracking-tighter mix-blend-plus-lighter">الفتوحات النجمية</h2>
                <p className="text-white/40 text-xl font-bold max-w-2xl mx-auto">تمدد نور الإسلام كشبكة نجمية عبر الفضاء، انقر على أي كوكب لتعرف قصته.</p>
            </div>

            <motion.div 
                style={{ scale, rotateX, transformStyle: "preserve-3d" }}
                className="relative w-full max-w-5xl h-[600px] mx-auto bg-[#0a0a0f] rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-blue-900/40 p-8"
            >
                {/* Embedded Star Map Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 rounded-[4rem] mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-transparent rounded-[4rem] pointer-events-none" />

                {/* SVG Connecting Lines (Cubic/Quadratic Curves) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0 0 12px rgba(59,130,246,0.9))" }} viewBox="0 0 100 100" preserveAspectRatio="none">
                    {PATHS.map((path, i) => {
                        const toNode = NODES.find(n => n.id === path.to);
                        if (!toNode) return null;

                        return (
                            <motion.path
                                key={`path-${i}`}
                                d={path.d}
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="0.5"
                                strokeDasharray="1 1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, delay: toNode.delay, ease: "easeInOut" }}
                            />
                        );
                    })}
                    
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#93c5fd" />
                        </linearGradient>
                    </defs>

                    {/* Glowing moving particles along curved paths */}
                    {animationComplete && PATHS.map((path, i) => (
                        <motion.circle
                            key={`particle-${i}`}
                            r="0.8"
                            fill="#fff"
                            style={{ filter: "drop-shadow(0 0 2px #fff)" }}
                        >
                            <animateMotion 
                                dur={`${Math.random() * 2 + 3}s`} 
                                repeatCount="indefinite" 
                                path={path.d}
                                rotate="auto"
                            />
                        </motion.circle>
                    ))}
                </svg>

                {/* Nodes (Stars/Planets) */}
                {NODES.map((node) => (
                    <motion.div
                        key={node.id}
                        className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center group cursor-pointer"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, damping: 10, delay: node.delay }}
                        onClick={() => setActiveNode(node.id)}
                        whileHover={{ scale: 1.5, zIndex: 50 }}
                    >
                        {/* Interactive Star Core */}
                        <div className={cn(
                            "w-4 h-4 rounded-full shadow-[0_0_20px_#fff,0_0_40px_#3b82f6] transition-colors duration-300",
                            activeNode === node.id ? "bg-amber-300 shadow-[0_0_30px_#fcd34d,0_0_60px_#f59e0b]" : "bg-white"
                        )} />
                        
                        {/* Pulse effect */}
                        <motion.div 
                            className={cn("absolute inset-0 rounded-full mix-blend-screen", activeNode === node.id ? "bg-amber-500" : "bg-blue-500")}
                            animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Always-on Label */}
                        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-black text-blue-100 bg-black/60 px-3 py-1.5 rounded-full border border-blue-500/30 backdrop-blur-md transition-all shadow-xl pointer-events-none group-hover:scale-110 group-hover:border-blue-400">
                            {node.label}
                        </div>
                    </motion.div>
                ))}

                {/* Popover Card for Active Node */}
                <AnimatePresence>
                    {activeNode && selectedNodeData && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="absolute bottom-8 right-8 z-50 w-80 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                            style={{ transform: "translateZ(50px)" }} // Pop out in 3D
                        >
                            <button onClick={() => setActiveNode(null)} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <X className="w-4 h-4 text-white" />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-amber-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white">{selectedNodeData.label}</h3>
                            </div>
                            <p className="text-white/60 font-bold leading-relaxed">{selectedNodeData.desc}</p>
                            <button className="mt-6 w-full py-3 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                                <Info className="w-4 h-4" /> اقرأ التفاصيل
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </section>
    );
}
