'use client';

import React, { useState } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { Scale, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReflectionMessage {
    text: string;
    source: string;
    description: string;
}

const reflectionMessages: Record<'good' | 'bad' | 'neutral', ReflectionMessage[]> = {
    good: [
        {
            text: "إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ ۚ ذَٰلِكَ ذِكْرَىٰ لِلذَّاكِرِينَ",
            source: "سورة هود - الآية 114",
            description: "كل حسنة تفعلها تمحو أثراً سيئاً في قلبك وصحيفتك. استمر في البناء والترقي."
        },
        {
            text: "مَن جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا ۖ وَمَن جَاءَ بِالسَّيِّئَةِ فَلَا يُجْزَىٰ إِلَّا مِثْلَهَا",
            source: "سورة الأنعام - الآية 160",
            description: "كرم الله واسع، الحسنة تضاعف لعشرة أمثالها، فاجعل كفة الخير هي الراجحة دائماً."
        }
    ],
    bad: [
        {
            text: "وَخُلِقَ الْإِنسَانُ ضَعِيفًا",
            source: "سورة النساء - الآية 28",
            description: "إذا زلت قدمك، فلا تيأس من روح الله. اتبع السيئة الحسنة تمحها وعجل بالتوبة."
        },
        {
            text: "إِنَّ الشِّرْكَ لَظُلْمٌ عَظِيمٌ",
            source: "سورة لقمان - الآية 13",
            description: "حذر نفسك من صغائر الذنوب فإنها تجتمع على المرء حتى تهلكه. تدارك الميزان قبل فوات الأوان."
        },
        {
            text: "كَلَّا ۖ بَلْ ۜ رَانَ عَلَىٰ قُلُوبِهِم مَّا كَانُوا يَكْسِبُونَ",
            source: "سورة المطففين - الآية 14",
            description: "كثرة الذنوب تنكت في القلب نكتة سوداء حتى يغطيه الران. طهّر قلبك بالاستغفار الآن."
        }
    ],
    neutral: [
        {
            text: "وَآخَرُونَ اعْتَرَفُوا بِذُنُوبِهِمْ خَلَطُوا عَمَلًا صَالِحًا وَآخَرَ سَيِّئًا عَسَى اللَّهُ أَن يَتُوبَ عَلَيْهِمْ",
            source: "سورة التوبة - الآية 102",
            description: "أنت في مرحلة مدافعة. لا ترضَ بالتعادل، بل ادفع كفة الخير لتثقل موازينك وتسعد في الدارين."
        },
        {
            text: "وَنَضَعُ الْمَوَازِينَ الْقِسْطَ لِيَوْمِ الْقِيَامَةِ فَلَا تُظْلَمُ نَفْسٌ شَيْئًا",
            source: "سورة الأنبياء - الآية 47",
            description: "كل مثقال ذرة مرصود. تفكر في أعمالك اليومية واجعل همك ترجيح كفة الصالحات."
        }
    ]
};

export function DeedsScale() {
    const [goodDeeds, setGoodDeeds] = useState(0);
    const [badDeeds, setBadDeeds] = useState(0);
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

    // Spring physics for the scale rotation
    const balance = useSpring(0, { stiffness: 80, damping: 15, mass: 1.5 });
    
    const updateBalance = (g: number, b: number) => {
        const diff = g - b;
        let angle = (diff / 10) * 30; // 30 degrees max tilt
        if (angle > 35) angle = 35;
        if (angle < -35) angle = -35;
        balance.set(angle);
    };

    const isGoodWinning = goodDeeds > badDeeds && goodDeeds - badDeeds > 2;
    const isBadWinning = badDeeds > goodDeeds && badDeeds - goodDeeds > 2;

    const spawnParticles = (isGood: boolean) => {
        const color = isGood ? '#fbbf24' : '#ef4444';
        const newParticles = Array.from({ length: 6 }).map((_, i) => ({
            id: Math.random() + i + Date.now(),
            x: (Math.random() - 0.5) * 60,
            y: 0,
            color
        }));
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
        }, 1200);
    };

    const getReflection = (): ReflectionMessage => {
        let category: 'good' | 'bad' | 'neutral' = 'neutral';
        if (isGoodWinning) category = 'good';
        else if (isBadWinning) category = 'bad';
        
        const list = reflectionMessages[category];
        const index = Math.abs(goodDeeds - badDeeds) % list.length;
        return list[index];
    };

    const addGood = () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
        const newG = goodDeeds + 1;
        setGoodDeeds(newG);
        updateBalance(newG, badDeeds);
        spawnParticles(true);
    };

    const addBad = () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([100, 50, 100]);
        }
        const newB = badDeeds + 1;
        setBadDeeds(newB);
        updateBalance(goodDeeds, newB);
        spawnParticles(false);
    };

    const reset = () => {
        setGoodDeeds(0);
        setBadDeeds(0);
        updateBalance(0, 0);
        setParticles([]);
    };

    return (
        <section className="py-32 bg-[#020202] relative overflow-hidden" dir="rtl">
            {/* Dynamic Backgrounds based on winning side */}
            <motion.div 
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] transition-opacity duration-1000"
                initial={{ opacity: 0 }}
                animate={{ opacity: isGoodWinning ? 1 : 0 }}
            />
            <motion.div 
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.15)_0%,transparent_70%)] transition-opacity duration-1000"
                initial={{ opacity: 0 }}
                animate={{ opacity: isBadWinning ? 1 : 0 }}
            />

            <div className="container mx-auto px-4 text-center mb-16 relative z-10">
                <div className={cn(
                    "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 border transition-all duration-700 shadow-2xl relative",
                    isGoodWinning ? "bg-emerald-900/40 border-emerald-500/30 shadow-emerald-500/20" : 
                    isBadWinning ? "bg-red-900/40 border-red-500/30 shadow-red-500/20" : 
                    "bg-amber-900/40 border-amber-500/20 shadow-amber-500/20"
                )}>
                    <Scale className={cn("w-10 h-10 transition-colors duration-700", 
                        isGoodWinning ? "text-emerald-500" : 
                        isBadWinning ? "text-red-500" : 
                        "text-amber-500"
                    )} />
                    {isGoodWinning && <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald-400 animate-pulse" />}
                    {isBadWinning && <AlertCircle className="absolute -top-2 -left-2 w-6 h-6 text-red-500 animate-bounce" />}
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 font-headline mb-4 tracking-tighter">ميزان الأعمال</h2>
                <p className="text-white/40 text-xl font-bold">
                    "فَمَن ثَقُلَتْ مَوَازِينُهُ فَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ"
                </p>
            </div>

            <div className="relative w-full max-w-4xl mx-auto h-[600px] flex items-end justify-center pb-24">
                
                {/* The Scale Assembly */}
                <motion.div 
                    animate={isBadWinning ? {
                        x: [0, -3, 3, -3, 3, -2, 2, 0],
                        boxShadow: [
                            "0 0 20px rgba(239, 68, 68, 0.05)",
                            "0 0 40px rgba(239, 68, 68, 0.35)",
                            "0 0 20px rgba(239, 68, 68, 0.05)"
                        ],
                        transition: {
                            x: {
                                repeat: Infinity,
                                duration: 0.6,
                                repeatDelay: 1.2
                            },
                            boxShadow: {
                                repeat: Infinity,
                                duration: 1.8,
                                ease: "easeInOut"
                            }
                        }
                    } : { x: 0, boxShadow: "none" }}
                    className={cn(
                        "relative w-[300px] md:w-[600px] h-[80%] flex flex-col items-center justify-end rounded-[3rem] transition-colors duration-500",
                        isBadWinning && "border border-red-500/20 bg-red-950/5"
                    )}
                >
                    
                    {/* Beam (Horizontal bar that rotates) */}
                    <motion.div 
                        className="absolute top-[20%] w-full h-5 bg-gradient-to-r from-amber-900 via-amber-400 to-amber-900 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-20 flex justify-between border-y border-white/20"
                        style={{ rotate: balance, transformOrigin: 'center center' }}
                    >
                        {/* Center Pin */}
                        <div className="absolute left-1/2 -top-3 -translate-x-1/2 w-8 h-10 bg-gradient-to-b from-amber-400 to-amber-700 rounded-full border-2 border-[#1a0f05] shadow-xl z-30" />

                        {/* Right Pan (Good Deeds) */}
                        <motion.div className="absolute right-0 -top-1 w-0 h-0" style={{ rotate: useSpring(0) }}>
                            <motion.div style={{ rotate: balance, scaleY: -1 }} className="relative origin-top">
                                <div className="absolute right-[-70px] top-0 w-[140px] h-[200px]">
                                    {/* Strings */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md" strokeWidth="2">
                                        <line x1="70" y1="0" x2="15" y2="170" stroke="url(#chainGrad1)" />
                                        <line x1="70" y1="0" x2="125" y2="170" stroke="url(#chainGrad1)" />
                                        <defs>
                                            <linearGradient id="chainGrad1" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#d97706" />
                                                <stop offset="100%" stopColor="#78350f" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    {/* Pan Base */}
                                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-emerald-600 to-emerald-950 rounded-[50%] shadow-[0_20px_40px_rgba(0,0,0,0.9)] border-2 border-emerald-400/50 flex justify-center items-end pb-3 z-20">
                                        <span className="text-white font-black text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">{goodDeeds}</span>
                                    </div>
                                    {/* Coins Container */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-[-15px] z-10 w-full h-full justify-start">
                                        <AnimatePresence>
                                            {Array.from({ length: Math.min(goodDeeds, 15) }).map((_, i) => (
                                                <motion.div 
                                                    key={`good-${i}`} 
                                                    initial={{ y: -200, opacity: 0, rotate: Math.random() * 90 }} 
                                                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                                                    className="w-14 h-4 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full border-2 border-yellow-700 shadow-[0_5px_10px_rgba(0,0,0,0.5)] -mt-3 absolute"
                                                    style={{ bottom: `${i * 8}px`, left: `${Math.random() * 20 + 35}px` }}
                                                />
                                            ))}
                                        </AnimatePresence>
                                        {goodDeeds > 15 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-32 w-full text-center text-emerald-400 font-black text-xs drop-shadow-md">
                                                +{goodDeeds - 15} المزيد
                                            </motion.div>
                                        )}
                                    </div>
                                    {/* Particles */}
                                    <AnimatePresence>
                                        {particles.filter(p => p.color === '#fbbf24').map(p => (
                                            <motion.div
                                                key={p.id}
                                                initial={{ x: `calc(-50% + ${p.x}px)`, y: 160, opacity: 1, scale: 0.6 }}
                                                animate={{ y: 20, opacity: 0, scale: 1.4 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                                className="absolute left-1/2 w-2 h-2 rounded-full pointer-events-none z-30"
                                                style={{ 
                                                    backgroundColor: p.color,
                                                    boxShadow: '0 0 10px #fbbf24, 0 0 4px #fbbf24'
                                                }}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Left Pan (Bad Deeds) */}
                        <motion.div className="absolute left-0 -top-1 w-0 h-0" style={{ rotate: useSpring(0) }}>
                            <motion.div style={{ rotate: balance, scaleY: -1 }} className="relative origin-top">
                                <div className="absolute left-[-70px] top-0 w-[140px] h-[200px]">
                                    {/* Strings */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md" strokeWidth="2">
                                        <line x1="70" y1="0" x2="15" y2="170" stroke="url(#chainGrad2)" />
                                        <line x1="70" y1="0" x2="125" y2="170" stroke="url(#chainGrad2)" />
                                        <defs>
                                            <linearGradient id="chainGrad2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#d97706" />
                                                <stop offset="100%" stopColor="#78350f" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    {/* Pan Base */}
                                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-zinc-700 to-[#0a0a0a] rounded-[50%] shadow-[0_20px_40px_rgba(0,0,0,0.9)] border-2 border-zinc-500/50 flex justify-center items-end pb-3 z-20">
                                        <span className="text-white font-black text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">{badDeeds}</span>
                                    </div>
                                     {/* Stones */}
                                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-[-15px] z-10 w-full h-full justify-start">
                                        <AnimatePresence>
                                            {Array.from({ length: Math.min(badDeeds, 15) }).map((_, i) => (
                                                <motion.div 
                                                    key={`bad-${i}`} 
                                                    initial={{ y: -200, opacity: 0, rotate: Math.random() * 90 }} 
                                                    animate={{ y: 0, opacity: 1, rotate: Math.random() * 45 }}
                                                    className="w-12 h-8 bg-gradient-to-br from-zinc-500 to-zinc-900 rounded-[40%] border border-zinc-800 shadow-[0_5px_10px_rgba(0,0,0,0.8)] -mt-5 absolute"
                                                    style={{ bottom: `${i * 12}px`, left: `${Math.random() * 30 + 30}px` }}
                                                />
                                            ))}
                                        </AnimatePresence>
                                        {badDeeds > 15 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-40 w-full text-center text-zinc-400 font-black text-xs drop-shadow-md">
                                                +{badDeeds - 15} المزيد
                                            </motion.div>
                                        )}
                                    </div>
                                    {/* Particles */}
                                    <AnimatePresence>
                                        {particles.filter(p => p.color === '#ef4444').map(p => (
                                            <motion.div
                                                key={p.id}
                                                initial={{ x: `calc(-50% + ${p.x}px)`, y: 160, opacity: 1, scale: 0.6 }}
                                                animate={{ y: 20, opacity: 0, scale: 1.4 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                                className="absolute left-1/2 w-2 h-2 rounded-full pointer-events-none z-30"
                                                style={{ 
                                                    backgroundColor: p.color,
                                                    boxShadow: '0 0 10px #ef4444, 0 0 4px #ef4444'
                                                }}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </motion.div>

                    </motion.div>

                    {/* Stand (Base Pillar) */}
                    <div className="w-10 h-[80%] bg-gradient-to-r from-[#3a2008] via-amber-700 to-[#1a0f05] border-x-2 border-amber-900 z-10 shadow-[0_0_30px_rgba(0,0,0,0.9)] relative flex justify-center">
                        {/* Decorative Pillar Details */}
                        <div className="w-2 h-full bg-gradient-to-b from-white/10 to-transparent" />
                        <div className="absolute top-[30%] w-14 -left-2 h-4 bg-gradient-to-r from-amber-500 to-amber-800 rounded-full shadow-lg" />
                        <div className="absolute top-[70%] w-16 -left-3 h-5 bg-gradient-to-r from-amber-600 to-amber-900 rounded-full shadow-lg" />
                    </div>
                    {/* Base Plate */}
                    <div className="w-64 h-12 bg-gradient-to-t from-black via-[#1a0f05] to-amber-900 rounded-t-[50%] border-t-4 border-amber-600 shadow-[0_20px_50px_rgba(0,0,0,1)] z-10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20 mix-blend-multiply" />
                    </div>

                </motion.div>

                {/* Controls (Glassmorphism Panel) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl flex items-center justify-between px-6 py-4 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-30">
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={addBad} 
                        className="flex items-center gap-3 px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-full font-black text-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    >
                        <Plus className="w-6 h-6" /> سيئة
                    </motion.button>
                    
                    <button onClick={reset} className="px-6 py-3 bg-transparent text-white/30 hover:text-white rounded-full text-sm font-bold transition-all uppercase tracking-widest">
                        تفريغ الميزان
                    </button>

                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={addGood} 
                        className="flex items-center gap-3 px-8 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full font-black text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                        <Plus className="w-6 h-6" /> حسنة
                    </motion.button>
                </div>
            </div>

            {/* Reflection Scroll Box Container */}
            <div className="w-full max-w-2xl mx-auto px-4 mt-12 relative z-30">
                <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[180px] overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-thumb-amber-500/20 text-right">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={getReflection().text}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 mb-1 justify-start" dir="rtl">
                                <span className={cn(
                                    "w-2.5 h-2.5 rounded-full",
                                    isGoodWinning ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" :
                                    isBadWinning ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" :
                                    "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                )} />
                                <span className="text-white/40 text-xs font-bold font-mono">الورود والتأملات الإيمانية</span>
                            </div>
                            <p className={cn(
                                "text-lg md:text-xl font-bold font-headline leading-relaxed",
                                isGoodWinning ? "text-emerald-400" :
                                isBadWinning ? "text-red-400" :
                                "text-amber-400"
                            )}>
                                "{getReflection().text}"
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-white/50 border-t border-white/5 pt-3 gap-2" dir="rtl">
                                <span className="font-bold text-amber-500/80">{getReflection().source}</span>
                                <span className="text-white/40 leading-relaxed">{getReflection().description}</span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
