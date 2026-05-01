'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GravityTasbih() {
    const [count, setCount] = useState(0);
    const [beads, setBeads] = useState<{ id: number; color: string }[]>([]);

    const colors = [
        'bg-amber-700 border-amber-900', // Agate
        'bg-emerald-700 border-emerald-900', // Emerald
        'bg-blue-900 border-blue-950', // Lapis
        'bg-stone-300 border-stone-500' // Pearl
    ];

    const [activeColor, setActiveColor] = useState(colors[0]);

    const addBead = () => {
        setCount(c => c + 1);
        const newBead = { id: Date.now(), color: activeColor };
        setBeads(prev => [...prev, newBead]);
        
        // Haptic feedback
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(20);
        }
    };

    const reset = () => {
        setCount(0);
        setBeads([]);
    };

    return (
        <div className="relative min-h-[80vh] bg-[#050505] overflow-hidden flex flex-col items-center py-20 border-y border-white/5" dir="rtl">
            {/* Background */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-[#050505] to-[#050505] pointer-events-none" />
            
            <div className="relative z-10 text-center mb-10">
                <h2 className="text-4xl font-black text-white font-headline mb-4">المسبحة الإلكترونية</h2>
                <p className="text-white/40 font-bold mb-8">اضغط لإسقاط حبة المسبحة في الوعاء</p>
                
                {/* Digital Counter */}
                <div className="inline-flex items-center justify-center min-w-[200px] h-24 rounded-[2rem] bg-black border-4 border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative overflow-hidden mb-8">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <span className="text-6xl font-black text-amber-500 font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] z-10">
                        {count.toString().padStart(4, '0')}
                    </span>
                </div>

                <div className="flex gap-4 justify-center">
                    {colors.map((c, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveColor(c)}
                            className={cn(
                                "w-10 h-10 rounded-full border-2 transition-transform",
                                c,
                                activeColor === c ? "scale-125 ring-2 ring-white/20" : "opacity-50"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Tap Area */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={addBead}
                className="relative z-20 w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-2xl group mb-12"
            >
                <Plus className="w-12 h-12 text-white/50 group-hover:text-white transition-colors" />
            </motion.button>

            {/* The Bowl */}
            <div className="relative w-full max-w-lg h-64 mt-auto">
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-white/5 rounded-[100%] border-b-4 border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-0" />
                
                {/* Falling Beads Container */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-[400px] flex flex-wrap-reverse justify-center content-start gap-1 overflow-visible z-10">
                    <AnimatePresence>
                        {beads.map((bead) => (
                            <motion.div
                                key={bead.id}
                                initial={{ opacity: 0, y: -300, scale: 0.5 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ 
                                    type: "spring", 
                                    damping: 12, 
                                    stiffness: 100,
                                    mass: 1
                                }}
                                className={cn(
                                    "w-6 h-6 rounded-full border-2 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.5),0_4px_6px_rgba(0,0,0,0.3)]",
                                    bead.color
                                )}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <button
                onClick={reset}
                className="absolute top-10 right-10 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
                <RefreshCw className="w-6 h-6" />
            </button>
        </div>
    );
}
