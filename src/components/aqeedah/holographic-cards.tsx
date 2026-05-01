'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Sparkles, Shield, Heart, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const CARDS = [
    {
        id: 'tawheed',
        title: 'مقام التوحيد',
        desc: 'لا إله إلا الله، كلمة الإخلاص ومفتاح النجاة.',
        icon: Shield,
        color: 'from-amber-600 via-yellow-400 to-amber-700',
        glow: 'rgba(245,158,11,0.5)',
    },
    {
        id: 'mahabbah',
        title: 'مقام المحبة',
        desc: 'أن يكون الله ورسوله أحب إليك مما سواهما.',
        icon: Heart,
        color: 'from-rose-600 via-pink-500 to-rose-700',
        glow: 'rgba(244,63,94,0.5)',
    },
    {
        id: 'yaqeen',
        title: 'مقام اليقين',
        desc: 'رؤية الوعد الحق بعين البصيرة كأنه رأي عين.',
        icon: Lightbulb,
        color: 'from-emerald-600 via-teal-400 to-emerald-700',
        glow: 'rgba(16,185,129,0.5)',
    }
];

function HolographicCard({ card }: { card: typeof CARDS[0] }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "-100%"]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "-100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-sm h-96 rounded-[3rem] p-1 cursor-crosshair perspective-[1000px] group mx-auto"
        >
            <div className={cn("absolute inset-0 rounded-[3rem] bg-gradient-to-br opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-100", card.color)} />
            
            <div className="absolute inset-0 rounded-[3rem] bg-[#050505] border border-white/10 overflow-hidden shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                
                {/* Dynamic Glare */}
                <motion.div 
                    className="absolute inset-0 z-50 pointer-events-none rounded-[3rem] mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.8) 0%, transparent 50%)`
                    }}
                />

                {/* Content */}
                <div 
                    className="relative z-10 p-10 h-full flex flex-col items-center justify-center text-center transform-gpu"
                    style={{ transform: "translateZ(50px)" }}
                >
                    <div className={cn("w-20 h-20 rounded-[2rem] bg-gradient-to-br flex items-center justify-center mb-8 shadow-2xl relative", card.color)}>
                        <div className="absolute inset-0 bg-black/20 rounded-[2rem] blur-sm" />
                        <card.icon className="w-10 h-10 text-white relative z-10" />
                        
                        {/* Floating Sparkles inside icon box */}
                        <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-yellow-300 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300" />
                    </div>
                    
                    <h3 className="text-3xl font-black text-white font-headline mb-4 tracking-wider">{card.title}</h3>
                    <p className="text-white/60 font-bold leading-relaxed">{card.desc}</p>
                </div>
            </div>
        </motion.div>
    );
}

export function HolographicCards() {
    return (
        <section className="py-24 bg-[#0a0a0a] relative overflow-hidden" dir="rtl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
            <div className="container mx-auto px-4 text-center mb-16 relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-white font-headline mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">مقامات اليقين</h2>
                <p className="text-white/40 text-lg font-bold">حرك المؤشر فوق البطاقات لرؤية أبعاد اليقين تتجلى أمامك</p>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto perspective-[1200px]">
                    {CARDS.map(card => (
                        <HolographicCard key={card.id} card={card} />
                    ))}
                </div>
            </div>
        </section>
    );
}
