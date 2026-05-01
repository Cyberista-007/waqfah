'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Scroll, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONSTITUTION_POINTS = [
    { title: "أمة واحدة", desc: "أن المسلمين من قريش ويثرب ومَن تَبِعهم أمةٌ واحدةٌ من دون الناس." },
    { title: "حرية الاعتقاد", desc: "لليهود دينهم وللمسلمين دينهم، ومواليهم وأنفسهم، إلا من ظلم وأثم." },
    { title: "الدفاع المشترك", desc: "أن بينهم النصر على من دهم يثرب (المدينة)، وأن على كل أناس حصتهم من جانبهم الذي قبلهم." },
    { title: "نصرة المظلوم", desc: "أن النصر للمظلوم، وأن بينهم النصر على من حارب أهل هذه الصحيفة." },
    { title: "المرجعية العليا", desc: "أن ما كان بين أهل هذه الصحيفة من حدث أو اشتجار يخاف فساده، فإن مرده إلى الله عز وجل، وإلى محمد رسول الله ﷺ." }
];

export function ParchmentScroll() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    const rotateX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [40, 0, 0, -40]);
    const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.8, 1, 1, 0.8]);
    const rollHeight = useTransform(scrollYProgress, [0.1, 0.5], ["0%", "100%"]);

    return (
        <section ref={targetRef} className="py-32 bg-transparent relative overflow-hidden perspective-[2000px]" dir="rtl">
            
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')] opacity-10 mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10 text-center mb-16">
                <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="w-20 h-20 mx-auto bg-amber-900/40 rounded-full flex items-center justify-center mb-6 border border-amber-500/20 shadow-[0_0_50px_rgba(217,119,6,0.3)] backdrop-blur-md"
                >
                    <Scroll className="w-10 h-10 text-amber-500" />
                </motion.div>
                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 font-headline mb-4 drop-shadow-2xl">وثيقة المدينة</h2>
                <p className="text-amber-200/60 text-xl font-bold max-w-2xl mx-auto uppercase tracking-widest">
                    أول دستور مدني في التاريخ، وضع أسس التعايش والمواطنة والعدل.
                </p>
            </div>

            <motion.div 
                style={{ rotateX, scale, transformStyle: "preserve-3d" }}
                className="w-full relative px-4 transform-gpu"
            >
                {/* Scroll Top Roll (Wooden Cylinder) */}
                <div className="w-full h-14 bg-gradient-to-b from-[#8b5a2b] via-[#d4a373] to-[#5c3a21] rounded-t-full border-x-8 border-t-8 border-[#3a2210] shadow-[0_20px_30px_rgba(0,0,0,0.8)] relative z-30 flex items-center justify-between px-2">
                    {/* Golden Knobs */}
                    <div className="absolute -left-6 w-8 h-10 bg-gradient-to-b from-amber-300 to-amber-700 rounded-l-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] border-l-2 border-y-2 border-amber-200" />
                    <div className="absolute -right-6 w-8 h-10 bg-gradient-to-b from-amber-300 to-amber-700 rounded-r-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] border-r-2 border-y-2 border-amber-200" />
                    {/* Wood Texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-multiply pointer-events-none rounded-t-full" />
                </div>

                {/* Unrolling Parchment Paper Container */}
                <div className="relative w-[96%] mx-auto bg-[#eaddc4] border-x-[12px] border-[#4a2e15] shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden origin-top">
                    <motion.div 
                        className="absolute inset-0 bg-[#eaddc4] origin-top z-40" 
                        style={{ height: useTransform(rollHeight, v => `calc(100% - ${v})`) }}
                    >
                        {/* Shadow to make it look like it's unrolling */}
                        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/60 to-transparent" />
                    </motion.div>

                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-80 mix-blend-multiply pointer-events-none" />
                    <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(100,50,0,0.6)] pointer-events-none" />
                    
                    <div className="relative z-10 p-10 md:p-16">
                        
                        <div className="text-center mb-12">
                            <h3 className="text-4xl md:text-5xl font-quran text-[#3a2210] mb-4">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h3>
                            <div className="w-40 h-px bg-[#3a2210]/30 mx-auto" />
                            <p className="mt-4 text-[#5c3a21] font-bold">هذا كتاب من محمد النبي، بين المؤمنين والمسلمين من قريش ويثرب، ومن تبعهم فلحق بهم وجاهد معهم.</p>
                        </div>

                        <div className="space-y-8 relative">
                            {/* Golden vertical line */}
                            <div className="absolute right-[22px] top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500/20 via-amber-500/60 to-amber-500/20 rounded-full" />

                            {CONSTITUTION_POINTS.map((point, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ delay: idx * 0.15, type: "spring" }}
                                    className="flex gap-8 group cursor-default relative z-10 bg-white/20 p-6 rounded-2xl border border-white/40 hover:bg-white/40 transition-colors shadow-sm"
                                >
                                    <div className="w-12 h-12 rounded-full border-2 border-amber-600 flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-100 to-amber-300 text-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-[#3a2210] font-headline mb-2">{point.title}</h4>
                                        <p className="text-xl text-[#5c3a21] font-bold leading-relaxed">{point.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Seal at the bottom */}
                        <div className="mt-20 pt-10 border-t-2 border-[#5c3a21]/20 flex justify-center">
                             <div className="w-32 h-32 rounded-full border-8 border-red-900/50 bg-[#6b1c1c] flex flex-col items-center justify-center p-2 transform rotate-[-15deg] shadow-[0_10px_30px_rgba(107,28,28,0.6),inset_0_0_20px_rgba(0,0,0,0.5)]">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-40 mix-blend-multiply rounded-full pointer-events-none" />
                                <span className="text-amber-100/90 font-quran text-2xl leading-none mb-1">الله</span>
                                <span className="text-amber-100/90 font-quran text-2xl leading-none mb-1">رسول</span>
                                <span className="text-amber-100/90 font-quran text-2xl leading-none">محمد</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Bottom Roll (Wooden Cylinder) */}
                <div className="w-full h-14 bg-gradient-to-t from-[#8b5a2b] via-[#d4a373] to-[#5c3a21] rounded-b-full border-x-8 border-b-8 border-[#3a2210] shadow-[0_30px_50px_rgba(0,0,0,0.9)] relative z-20 flex items-center justify-between px-2">
                    {/* Golden Knobs */}
                    <div className="absolute -left-6 w-8 h-10 bg-gradient-to-b from-amber-300 to-amber-700 rounded-l-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] border-l-2 border-y-2 border-amber-200" />
                    <div className="absolute -right-6 w-8 h-10 bg-gradient-to-b from-amber-300 to-amber-700 rounded-r-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] border-r-2 border-y-2 border-amber-200" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-multiply pointer-events-none rounded-b-full" />
                </div>
            </motion.div>
        </section>
    );
}
