'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, ArrowLeft, Trophy, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const questions = [
    {
        q: "كم كان عمر النبي صلى الله عليه وسلم عندما نزل عليه الوحي؟",
        options: ["30 عاماً", "35 عاماً", "40 عاماً", "45 عاماً"],
        correct: 2
    },
    {
        q: "من هو أول من آمن من الرجال بالدعوة الإسلامية؟",
        options: ["عمر بن الخطاب", "أبو بكر الصديق", "عثمان بن عفان", "علي بن أبي طالب"],
        correct: 1
    },
    {
        q: "ما هي أول هجرة في الإسلام؟",
        options: ["الهجرة إلى يثرب", "الهجرة إلى الحبشة", "الهجرة إلى الطائف", "الهجرة إلى خيبر"],
        correct: 1
    },
    {
        q: "في أي سنة هجرية وقعت غزوة بدر الكبرى؟",
        options: ["السنة 1 هـ", "السنة 2 هـ", "السنة 3 هـ", "السنة 5 هـ"],
        correct: 1
    },
    {
        q: "ما هو اسم الصحابي الذي كان رفيق النبي في رحلة الهجرة؟",
        options: ["أبو بكر الصديق", "عمر بن الخطاب", "علي بن أبي طالب", "بلال بن رباح"],
        correct: 0
    }
];

export function SeerahQuiz() {
    const [currentStep, setCurrentStep] = useState<'start' | 'playing' | 'end'>('start');
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleAnswer = (idx: number) => {
        if (selected !== null) return;
        setSelected(idx);
        const correct = idx === questions[qIndex].correct;
        setIsCorrect(correct);
        if (correct) setScore(score + 1);

        setTimeout(() => {
            if (qIndex < questions.length - 1) {
                setQIndex(qIndex + 1);
                setSelected(null);
                setIsCorrect(null);
            } else {
                setCurrentStep('end');
            }
        }, 1500);
    };

    const reset = () => {
        setCurrentStep('start');
        setQIndex(0);
        setScore(0);
        setSelected(null);
        setIsCorrect(null);
    };

    return (
        <section className="py-32 w-full px-4 md:px-8 lg:px-12">
            <div className="w-full rounded-[4rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl p-12 md:p-20 shadow-2xl relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {currentStep === 'start' && (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-10"
                        >
                            <HelpCircle className="w-32 h-32 text-amber-500 mx-auto animate-bounce" />
                            <h2 className="text-5xl md:text-7xl font-black text-white font-headline">اختبر معرفتك</h2>
                            <p className="text-xl text-white/40 font-bold max-w-2xl mx-auto">هل أنت مستعد لاختبار معلوماتك عن سيرة النبي صلى الله عليه وسلم وأصحابه الكرام؟</p>
                            <button 
                                onClick={() => setCurrentStep('playing')}
                                className="h-24 px-20 rounded-full bg-amber-500 text-black font-black text-2xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all"
                            >
                                ابدأ الاختبار الآن
                            </button>
                        </motion.div>
                    )}

                    {currentStep === 'playing' && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-12"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <span className="text-amber-500 font-black text-lg">السؤال {qIndex + 1} من {questions.length}</span>
                                <div className="h-2 flex-1 mx-8 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
                                        className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                                    />
                                </div>
                            </div>

                            <h3 className="text-4xl md:text-5xl font-black text-white font-headline leading-tight">{questions[qIndex].q}</h3>

                            <div className="grid grid-cols-1 gap-4">
                                {questions[qIndex].options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className={cn(
                                            "p-8 rounded-3xl border-2 text-2xl font-bold text-right transition-all duration-300 flex items-center justify-between group",
                                            selected === null ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-amber-500/50" : 
                                            idx === questions[qIndex].correct ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                                            selected === idx ? "bg-rose-500/20 border-rose-500 text-rose-400" : "bg-white/5 border-white/5 opacity-40"
                                        )}
                                    >
                                        <span>{opt}</span>
                                        {selected !== null && idx === questions[qIndex].correct && <CheckCircle2 className="w-8 h-8" />}
                                        {selected === idx && idx !== questions[qIndex].correct && <XCircle className="w-8 h-8" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'end' && (
                        <motion.div
                            key="end"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-12"
                        >
                            <Trophy className="w-40 h-40 text-yellow-500 mx-auto" />
                            <h2 className="text-5xl md:text-7xl font-black text-white font-headline">النتيجة النهائية</h2>
                            <div className="text-[10rem] font-black text-amber-500 leading-none">{score}/{questions.length}</div>
                            <p className="text-2xl text-white/40 font-bold">
                                {score === questions.length ? "ممتاز! معرفة واسعة وشاملة بالسيرة النبوية." : 
                                 score >= 3 ? "جيد جداً، لديك معلومات قيمة عن حياة النبي ﷺ." : 
                                 "حاول مرة أخرى لتعزيز معلوماتك عن سيرة خير البرية."}
                            </p>
                            <div className="flex gap-6 justify-center">
                                <button 
                                    onClick={reset}
                                    className="h-20 px-12 rounded-full border-2 border-white/10 text-white font-black text-xl hover:bg-white/5 flex items-center gap-4 transition-all"
                                >
                                    <RefreshCcw className="w-6 h-6" /> إعادة المحاولة
                                </button>
                                <button className="h-20 px-12 rounded-full bg-amber-500 text-black font-black text-xl hover:scale-105 transition-all">
                                    مشاركة النتيجة
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Decorative Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
            </div>
        </section>
    );
}
