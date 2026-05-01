'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Dhikr {
    id: number;
    text: string;
    count: number;
    current: number;
}

const INITIAL_ADHKAR: Dhikr[] = [
    { id: 1, text: "سبحان الله وبحمده", count: 3, current: 0 },
    { id: 2, text: "أستغفر الله وأتوب إليه", count: 3, current: 0 },
    { id: 3, text: "اللهم صل وسلم على نبينا محمد", count: 3, current: 0 },
];

export function DewAdhkar() {
    const [adhkar, setAdhkar] = useState<Dhikr[]>(INITIAL_ADHKAR);
    const [ripples, setRipples] = useState<{id: number, x: number, y: number}[]>([]);

    const handleTap = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setAdhkar(prev => prev.map(a => {
            if (a.id === id && a.current < a.count) {
                // Add ripple effect
                const newRippleId = Date.now();
                setRipples(r => [...r, { id: newRippleId, x, y }]);
                setTimeout(() => {
                    setRipples(r => r.filter(rip => rip.id !== newRippleId));
                }, 1000);

                return { ...a, current: a.current + 1 };
            }
            return a;
        }));
    };

    const reset = () => {
        setAdhkar(INITIAL_ADHKAR);
    };

    const isAllComplete = adhkar.every(a => a.current === a.count);

    return (
        <section className="relative min-h-screen bg-[#0f172a] overflow-hidden py-32 flex items-center justify-center" dir="rtl">
            {/* Nature Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#064e3b]/20 to-[#0f172a] z-0" />
            
            {/* Ambient glowing orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white font-headline mb-4 drop-shadow-xl">قطرات الندى</h2>
                    <p className="text-emerald-100/60 text-lg font-bold">أذكار الصباح تتساقط كحبات الندى لتغسل القلب</p>
                </div>

                <div className="max-w-3xl mx-auto space-y-8">
                    <AnimatePresence>
                        {adhkar.map((item) => {
                            const isComplete = item.current === item.count;
                            const progress = item.current / item.count;

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ 
                                        opacity: isComplete ? 0.5 : 1, 
                                        scale: isComplete ? 0.95 : 1,
                                        y: 0 
                                    }}
                                    className="relative"
                                >
                                    <button
                                        onClick={(e) => handleTap(item.id, e)}
                                        disabled={isComplete}
                                        className={cn(
                                            "w-full p-8 rounded-[3rem] backdrop-blur-xl border transition-all duration-500 relative overflow-hidden text-right group",
                                            isComplete 
                                                ? "bg-emerald-900/20 border-emerald-500/10 cursor-default" 
                                                : "bg-white/5 border-white/10 hover:bg-white/10 shadow-2xl cursor-pointer hover:border-emerald-500/30"
                                        )}
                                    >
                                        {/* Water fill effect */}
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 bg-emerald-500/10 transition-all duration-700 ease-out z-0"
                                            style={{ height: `${progress * 100}%` }}
                                        />

                                        {/* Ripples */}
                                        <AnimatePresence>
                                            {ripples.map(ripple => (
                                                <motion.div
                                                    key={ripple.id}
                                                    initial={{ scale: 0, opacity: 0.5 }}
                                                    animate={{ scale: 4, opacity: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 1 }}
                                                    className="absolute w-32 h-32 bg-emerald-400/20 rounded-full z-0 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                                                    style={{ left: ripple.x, top: ripple.y }}
                                                />
                                            ))}
                                        </AnimatePresence>

                                        <div className="relative z-10 flex items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <h3 className={cn(
                                                    "text-2xl md:text-3xl font-black font-headline transition-colors duration-500",
                                                    isComplete ? "text-emerald-500/50" : "text-white group-hover:text-emerald-50"
                                                )}>
                                                    {item.text}
                                                </h3>
                                            </div>

                                            {/* Droplet Counter */}
                                            <div className="flex flex-col items-center justify-center shrink-0 w-24 h-24 relative">
                                                {isComplete ? (
                                                    <motion.div 
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                                                    >
                                                        <Check size={32} />
                                                    </motion.div>
                                                ) : (
                                                    <div className="relative flex flex-col items-center justify-center w-full h-full">
                                                        <Droplet 
                                                            size={64} 
                                                            className="text-emerald-500/20 absolute drop-shadow-lg" 
                                                            strokeWidth={1}
                                                        />
                                                        <span className="relative z-10 text-3xl font-black text-emerald-400 font-mono tracking-tighter mt-4">
                                                            {item.count - item.current}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Completion State */}
                    <AnimatePresence>
                        {isAllComplete && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="pt-12 text-center"
                            >
                                <div className="inline-flex items-center justify-center p-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 relative">
                                    <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping" />
                                    <Check className="w-12 h-12 text-emerald-500" />
                                </div>
                                <h3 className="text-3xl font-black text-emerald-400 mb-6">طاب صباحك بذكر الله</h3>
                                <Button 
                                    onClick={reset}
                                    variant="outline"
                                    className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                                >
                                    <RefreshCw className="w-4 h-4 me-2" /> إعاداة الأذكار
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
