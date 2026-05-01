'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Wind, RefreshCcw } from 'lucide-react';

export function BattleFog() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawingRef = useRef(false);
    
    // Use a ref for cleared counter to avoid re-renders during high frequency events
    const clearCounterRef = useRef(0);
    const [clearedPercent, setClearedPercent] = useState(0);

    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Base fog color
        ctx.fillStyle = '#0f0505'; // Dark reddish brown for dust
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add heavy sand noise
        for(let i=0; i < 15000; i++) {
            ctx.fillStyle = `rgba(217, 119, 6, ${Math.random() * 0.15})`; // Amber noise
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3, Math.random() * 3);
        }

        clearCounterRef.current = 0;
        setClearedPercent(0);
    }, []);

    useEffect(() => {
        initCanvas();
        window.addEventListener('resize', initCanvas);
        return () => window.removeEventListener('resize', initCanvas);
    }, [initCanvas]);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDrawingRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        
        const brushSize = 80;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushSize);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(0.4, 'rgba(0,0,0,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();

        // Increment counter without triggering re-render immediately
        clearCounterRef.current += 1;
        
        // Throttle state updates for performance (update every ~10 events)
        if (clearCounterRef.current % 10 === 0) {
            const approximatePercent = Math.min((clearCounterRef.current / 300) * 100, 100);
            setClearedPercent(approximatePercent);
        }
    };

    const revealAll = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        clearCounterRef.current = 300;
        setClearedPercent(100);
    };

    return (
        <section className="py-32 bg-transparent relative overflow-hidden border-y border-white/5" dir="rtl">
            {/* Animated Dust Storm Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] animate-[wind_20s_linear_infinite]" />
            </div>

            <div className="w-full px-4 md:px-8 lg:px-12 text-center mb-16 relative z-10">
                <div className="w-20 h-20 mx-auto bg-rose-900/30 rounded-[2rem] flex items-center justify-center mb-6 border border-rose-500/30 shadow-[0_0_50px_rgba(225,29,72,0.3)] relative group">
                    <Swords className="w-10 h-10 text-rose-500 group-hover:scale-110 transition-transform" />
                    <Wind className="absolute -top-2 -right-2 w-6 h-6 text-amber-500/50 animate-pulse" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 font-headline mb-4 tracking-tighter">غبار المعارك</h2>
                <p className="text-white/40 text-xl font-bold max-w-2xl mx-auto">
                    امسح غبار الزمان بيدك لتتكشف لك التكتيكات العبقرية ومواقع جيوش المسلمين في غزوة أُحُد.
                </p>
            </div>

            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div 
                    ref={containerRef}
                    className="relative w-full max-w-6xl h-[500px] md:h-[700px] mx-auto rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 group bg-black touch-none"
                    onPointerDown={(e) => {
                        isDrawingRef.current = true;
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                        handlePointerMove(e);
                    }}
                    onPointerUp={(e) => {
                        isDrawingRef.current = false;
                        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                    }}
                    onPointerMove={handlePointerMove}
                >
                    {/* Revealed Content (Underneath) */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                        style={{ 
                            backgroundImage: "url('/battle_badr_cinematic_landscape_1777413990459.png')",
                            filter: "contrast(1.3) saturate(1.2)"
                        }}
                    >
                        {/* Cinematic Color Grading Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/40 via-transparent to-amber-900/40 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                        
                        {/* Simulated Tactics Map Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-10">
                            <div className="w-full max-w-2xl h-full border-2 border-dashed border-rose-500/50 rounded-[4rem] relative">
                                {/* Nodes */}
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full bg-rose-500 border-4 border-black shadow-[0_0_20px_rgba(244,63,94,1)]" />
                                    <span className="mt-2 text-rose-400 font-black tracking-widest text-sm bg-black/80 backdrop-blur px-4 py-1.5 rounded-full border border-rose-500/30">جبل الرماة</span>
                                </motion.div>
                                
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                    <div className="w-32 h-1 bg-white/20 blur-[2px] absolute top-3" />
                                    <div className="w-4 h-4 rounded-full bg-white/30 border-2 border-black" />
                                    <span className="mt-2 text-white/50 font-black tracking-widest text-sm bg-black/80 backdrop-blur px-4 py-1.5 rounded-full border border-white/10">جيش المشركين</span>
                                </div>
                                
                                <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-1/2 -right-8 -translate-y-1/2 flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-black shadow-[0_0_20px_rgba(16,185,129,1)]" />
                                    <span className="text-emerald-400 font-black tracking-widest text-sm bg-black/80 backdrop-blur px-4 py-1.5 rounded-full border border-emerald-500/30">معسكر المسلمين</span>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Fog Canvas */}
                    <canvas 
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full cursor-crosshair touch-none transition-opacity duration-1000"
                        style={{ filter: "blur(4px)", opacity: clearedPercent >= 100 ? 0 : 1 }}
                    />

                    {/* Controls & Feedback UI */}
                    <AnimatePresence>
                        {clearedPercent > 5 && clearedPercent < 100 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 flex items-center gap-6 shadow-2xl pointer-events-none"
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">مستوى الرؤية</span>
                                    <span className="text-amber-500 font-black text-xl">{Math.round(clearedPercent)}%</span>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <button 
                                    onClick={revealAll}
                                    className="pointer-events-auto flex items-center gap-2 text-white/60 hover:text-white font-bold transition-colors"
                                >
                                    <Wind className="w-4 h-4" /> إقشاع الغبار
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {clearedPercent === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 animate-spin-slow" />
                        </div>
                    )}

                </div>
                
                <div className="flex justify-center mt-8">
                    <button onClick={initCanvas} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold">
                        <RefreshCcw className="w-4 h-4" /> إعادة الغبار
                    </button>
                </div>
            </div>
        </section>
    );
}
