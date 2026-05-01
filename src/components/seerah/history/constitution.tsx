'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, ChevronLeft, ShieldCheck, Users, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const articles = [
    { 
        title: "وحدة الأمة", 
        text: "إنهم أمة واحدة من دون الناس، المهاجرون والأنصار ومن تبعهم فلحق بهم وجاهد معهم.",
        icon: Users,
        color: "text-amber-500"
    },
    { 
        title: "التكافل الاجتماعي", 
        text: "المهاجرون من قريش على ربعتهم يتعاقلون بينهم، وهم يفدون عانيهم بالمعروف والقسط بين المؤمنين.",
        icon: Heart,
        color: "text-rose-500"
    },
    { 
        title: "حرية العقيدة", 
        text: "وإن لليهود دينهم وللمسلمين دينهم، مواليهم وأنفسهم إلا من ظلم وأثم فإنه لا يوتغ إلا نفسه وأهل بيته.",
        icon: ShieldCheck,
        color: "text-blue-500"
    },
    { 
        title: "العدل المطلق", 
        text: "وإنكم مهما اختلفتم في شيء فإن مرده إلى الله عز وجل وإلى محمد ﷺ، والظلم لا يُقر في هذه الصحيفة.",
        icon: Scale,
        color: "text-emerald-500"
    },
];

export function SeerahConstitution() {
    const [index, setIndex] = useState(0);

    return (
        <section className="py-48 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40">
                <Image 
                    src="/ancient_parchment_scroll_cinematic_1777414391757.png" 
                    fill 
                    className="object-cover" 
                    alt="Scroll Background" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]" />
            </div>

            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div className="w-full">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-4 px-8 py-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-3xl mb-12"
                        >
                            <FileText className="w-6 h-6 text-amber-500" />
                            <span className="text-2xl font-black text-white font-headline">وثيقة المدينة</span>
                        </motion.div>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-tight">أول دستور مدني في التاريخ</h2>
                        <p className="text-xl text-white/40 max-w-3xl mx-auto font-bold leading-relaxed">أرست هذه الصحيفة قواعد المواطنة، والعدل، وحرية العقيدة في مجتمع المدينة المتنوع.</p>
                    </div>

                    <div className="relative p-12 md:p-24 rounded-[4rem] bg-white/[0.01] backdrop-blur-3xl border border-white/5 shadow-2xl overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className={cn("w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-12", articles[index].color)}>
                                    {React.createElement(articles[index].icon, { size: 48 })}
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-white font-headline mb-8 leading-tight">{articles[index].title}</h3>
                                <p className="text-2xl md:text-4xl text-amber-500/80 font-bold leading-relaxed max-w-4xl italic">
                                    "{articles[index].text}"
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between items-center mt-24">
                            <button 
                                onClick={() => setIndex((prev) => (prev > 0 ? prev - 1 : articles.length - 1))}
                                className="p-6 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                            >
                                <ChevronRight size={32} />
                            </button>
                            <div className="flex gap-4">
                                {articles.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "w-3 h-3 rounded-full transition-all duration-500",
                                            i === index ? "w-12 bg-amber-500" : "bg-white/10"
                                        )} 
                                    />
                                ))}
                            </div>
                            <button 
                                onClick={() => setIndex((prev) => (prev < articles.length - 1 ? prev + 1 : 0))}
                                className="p-6 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                            >
                                <ChevronLeft size={32} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Fixed missing import in previous thought
import { Heart } from 'lucide-react';
