'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, AlertCircle, CheckCircle2, XCircle, Globe2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Letter {
    id: string;
    recipient: string;
    title: string;
    empire: string;
    content: string;
    reaction: string;
    result: 'accepted' | 'rejected' | 'respectful';
    sealColor: string;
}

const ROYAL_LETTERS: Letter[] = [
    {
        id: 'heraclius',
        recipient: "هرقل",
        title: "عظيم الروم",
        empire: "الإمبراطورية البيزنطية",
        content: "بسم الله الرحمن الرحيم. من محمد عبد الله ورسوله إلى هرقل عظيم الروم. سلام على من اتبع الهدى، أما بعد: فإني أدعوك بدعاية الإسلام، أسلم تسلم يؤتك الله أجرك مرتين، فإن توليت فإن عليك إثم الأريسيين.",
        reaction: "قرأ الرسالة وسأل أبا سفيان أسئلة كثيرة عن النبي ﷺ، وتأكد من صدقه، وكاد أن يسلم لولا خوفه على ملكه.",
        result: 'respectful',
        sealColor: 'bg-red-800'
    },
    {
        id: 'chosroes',
        recipient: "كسرى",
        title: "ملك الفرس",
        empire: "الإمبراطورية الساسانية",
        content: "بسم الله الرحمن الرحيم. من محمد رسول الله إلى كسرى عظيم فارس. سلام على من اتبع الهدى، وآمن بالله ورسوله... فأسلم تسلم، فإن أبيت فإن إثم المجوس عليك.",
        reaction: "غضب غضباً شديداً ومزق الرسالة استكباراً لأن النبي ﷺ بدأ باسمه قبل اسم كسرى. فقال النبي ﷺ: «مزق الله ملكه».",
        result: 'rejected',
        sealColor: 'bg-stone-800'
    },
    {
        id: 'negus',
        recipient: "النجاشي",
        title: "ملك الحبشة",
        empire: "مملكة أكسوم",
        content: "بسم الله الرحمن الرحيم. من محمد رسول الله إلى النجاشي ملك الحبشة. أسلم أنت، فإني أحمد إليك الله الذي لا إله إلا هو الملك القدوس السلام المؤمن المهيمن...",
        reaction: "تلقى الرسالة باحترام بالغ، ووضعها على عينيه، ونزل عن سريره إلى الأرض، وأعلن إسلامه أمام مبعوث النبي.",
        result: 'accepted',
        sealColor: 'bg-amber-800'
    },
    {
        id: 'muqawqis',
        recipient: "المقوقس",
        title: "عظيم القبط",
        empire: "مصر",
        content: "بسم الله الرحمن الرحيم. من محمد بن عبد الله إلى المقوقس عظيم القبط. سلام على من اتبع الهدى. أما بعد فإني أدعوك بدعاية الإسلام، أسلم تسلم...",
        reaction: "رد رداً جميلاً، واحتفظ بالرسالة في حُق من عاج، وأرسل هدايا للنبي ﷺ، ولكنه لم يُسلم ضناً بملكه.",
        result: 'respectful',
        sealColor: 'bg-blue-900'
    }
];

export function RoyalLetters() {
    const [selectedId, setSelectedId] = useState<string>(ROYAL_LETTERS[0].id);
    const [unsealed, setUnsealed] = useState<Record<string, boolean>>({});

    const activeLetter = ROYAL_LETTERS.find(l => l.id === selectedId)!;

    const handleSelectLetter = (id: string) => {
        if (selectedId !== id) {
            setSelectedId(id);
        }
    };

    const breakSeal = (id: string) => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([50, 100, 50]); // Cracking sound/feel
        }
        setUnsealed(prev => ({ ...prev, [id]: true }));
    };

    const getResultIcon = (result: string) => {
        switch(result) {
            case 'accepted': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'respectful': return <AlertCircle className="w-5 h-5 text-amber-500" />;
            default: return null;
        }
    };

    return (
        <section className="py-32 relative bg-transparent border-y border-white/5" dir="rtl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 pointer-events-none" />
            
            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="w-20 h-20 rounded-full bg-amber-900/30 flex items-center justify-center mb-6 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <Globe2 className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 font-headline mb-4 tracking-tighter">رسائل النبي للملوك</h2>
                    <p className="text-white/40 text-xl font-bold max-w-3xl">
                        بعد صلح الحديبية، تفرغ النبي ﷺ للدعوة العالمية، فأرسل سفراءه برسائل مختومة إلى ملوك الأرض وعظمائها.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                    
                    {/* Sidebar / List */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        {ROYAL_LETTERS.map((letter) => (
                            <button
                                key={letter.id}
                                onClick={() => handleSelectLetter(letter.id)}
                                className={cn(
                                    "flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 text-right relative overflow-hidden group",
                                    selectedId === letter.id 
                                        ? "bg-gradient-to-l from-amber-900/40 to-black border-amber-500/50 shadow-[0_10px_30px_rgba(245,158,11,0.2)]" 
                                        : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10"
                                )}
                            >
                                {selectedId === letter.id && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
                                )}
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                                    selectedId === letter.id ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "bg-black border border-white/10"
                                )}>
                                    <Crown className={cn("w-6 h-6", selectedId === letter.id ? "text-black" : "text-white/40 group-hover:text-amber-500/50")} />
                                </div>
                                <div>
                                    <h4 className={cn("font-black text-xl mb-1", selectedId === letter.id ? "text-amber-400" : "text-white/70")}>
                                        {letter.recipient}
                                    </h4>
                                    <p className="text-xs font-bold text-white/40 tracking-widest">{letter.empire}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* 3D Letter Viewer */}
                    <div className="lg:col-span-8 perspective-[2000px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeLetter.id}
                                initial={{ opacity: 0, rotateY: 30, scale: 0.9 }}
                                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                                exit={{ opacity: 0, rotateY: -30, scale: 0.9 }}
                                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                                className="relative w-full h-[600px] flex items-center justify-center transform-gpu"
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {!unsealed[activeLetter.id] ? (
                                    
                                    /* Sealed Envelope View */
                                    <motion.div 
                                        className="relative w-[300px] md:w-[400px] h-[250px] bg-gradient-to-br from-[#e6d5b8] to-[#c2b280] rounded-xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-[#a89668] flex items-center justify-center cursor-pointer group"
                                        onClick={() => breakSeal(activeLetter.id)}
                                        whileHover={{ scale: 1.05, rotateZ: 2 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}
                                    >
                                        {/* Flap Shadows */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                            <div className="w-full h-full border-[100px] border-transparent border-t-[#d4c494] opacity-50 translate-y-[-50px]" />
                                            <div className="absolute inset-0 border-b-[#b8a670] border-[120px] border-transparent opacity-40 translate-y-[50px]" />
                                        </div>

                                        {/* Wax Seal */}
                                        <div className="relative z-20 group-hover:scale-110 transition-transform duration-500">
                                            <div className={cn("w-24 h-24 rounded-full border-4 border-[#3a1010]/30 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_5px_10px_rgba(255,255,255,0.2)] flex items-center justify-center relative", activeLetter.sealColor)}>
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-50 mix-blend-multiply rounded-full" />
                                                <div className="w-16 h-16 rounded-full border border-white/20 flex flex-col items-center justify-center pt-2">
                                                    <span className="font-quran text-amber-100/90 text-sm leading-none">محمد</span>
                                                    <span className="font-quran text-amber-100/90 text-sm leading-none">رسول</span>
                                                    <span className="font-quran text-amber-100/90 text-sm leading-none">الله</span>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-amber-900/60 font-black text-sm tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                اضغط لفض الختم
                                            </div>
                                        </div>
                                    </motion.div>

                                ) : (
                                    
                                    /* Unfolded Parchment View */
                                    <motion.div 
                                        initial={{ rotateX: 90, opacity: 0 }}
                                        animate={{ rotateX: 0, opacity: 1 }}
                                        transition={{ type: "spring", damping: 15, stiffness: 50 }}
                                        className="relative w-full max-w-2xl min-h-[450px] bg-[#f4e8d3] rounded-sm shadow-[0_50px_100px_rgba(0,0,0,0.9)] p-12 md:p-16 border-x-[15px] border-[#d4c494] flex flex-col transform-gpu"
                                        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/old-wall.png')" }}
                                    >
                                        {/* Burned/Aged Edges Simulation */}
                                        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(100,60,20,0.4)] pointer-events-none" />

                                        <div className="text-center mb-8 relative z-10">
                                            <h3 className="text-3xl font-quran text-[#4a3018] mb-2">{activeLetter.title}</h3>
                                            <div className="w-32 h-px bg-[#4a3018]/20 mx-auto" />
                                        </div>

                                        <p className="text-[#3a2010] font-quran text-2xl md:text-3xl leading-relaxed text-justify relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                                            {activeLetter.content}
                                        </p>

                                        <div className="mt-auto pt-10 flex items-center justify-between relative z-10">
                                            <div className={cn("w-16 h-16 rounded-full border-2 border-[#3a1010]/20 flex flex-col items-center justify-center opacity-80 pt-1 shadow-inner", activeLetter.sealColor)}>
                                                <span className="font-quran text-amber-100/70 text-[10px] leading-none">محمد</span>
                                                <span className="font-quran text-amber-100/70 text-[10px] leading-none">رسول</span>
                                                <span className="font-quran text-amber-100/70 text-[10px] leading-none">الله</span>
                                            </div>
                                        </div>

                                        {/* Reaction Card (Floating above parchment) */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1 }}
                                            className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[90%] bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex items-start gap-4"
                                            style={{ transform: "translateZ(30px)" }}
                                        >
                                            <div className="mt-1">{getResultIcon(activeLetter.result)}</div>
                                            <div>
                                                <h5 className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">ردة الفعل التاريخية</h5>
                                                <p className="text-white/90 font-bold text-sm leading-relaxed">{activeLetter.reaction}</p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}
