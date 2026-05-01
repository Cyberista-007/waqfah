'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Droplets, Utensils, TreePine, CloudLightning, ChevronRight, ChevronLeft, Info, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Miracle {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    hadith: string;
    icon: any;
    color: string;
}

const MIRACLES: Miracle[] = [
    {
        id: 'moon',
        title: "انشقاق القمر",
        subtitle: "آية لأهل مكة",
        description: "طلب كفار قريش من النبي ﷺ آية تدل على صدقه، فأشار بيده الشريفة إلى القمر فانشق نصفين، نصف على جبل أبي قبيس ونصف على جبل قعيقعان، ورآه الناس بوضوح.",
        hadith: "قال تعالى: ﴿اقْتَرَبَتِ السَّاعَةُ وَانشَقَّ الْقَمَرُ * وَإِن يَرَوْا آيَةً يُعْرِضُوا وَيَقُولُوا سِحْرٌ مُّسْتَمِرٌّ﴾. وعن أنس بن مالك: أن أهل مكة سألوا رسول الله أن يريهم آية، فأراهم القمر شقتين، حتى رأوا حراء بينهما.",
        icon: Moon,
        color: "text-amber-300"
    },
    {
        id: 'water',
        title: "نبع الماء من بين أصابعه",
        subtitle: "سقيا الجيش",
        description: "في عدة غزوات ومواقف، نفد الماء من جيش المسلمين وكادوا يهلكون من العطش، فوضع النبي ﷺ يده في وعاء صغير فنبع الماء من بين أصابعه كالعين حتى شرب الجيش كله وتوضأوا.",
        hadith: "عن جابر بن عبد الله قال: عطش الناس يوم الحديبية، وجهشوا إلى رسول الله ﷺ، فوضع يده في الركوة، فجعل الماء يفور من بين أصابعه كأمثال العيون، فشربنا وتوضأنا. قيل لجابر: كم كنتم؟ قال: لو كنا مائة ألف لكفانا، كنا خمس عشرة مائة.",
        icon: Droplets,
        color: "text-blue-400"
    },
    {
        id: 'food',
        title: "تكثير الطعام",
        subtitle: "بركة النبوة",
        description: "بارك النبي ﷺ في الطعام القليل فأشبع المئات. حدث ذلك في غزوة الخندق ببيت جابر بن عبد الله، وفي يوم وليمة أبي طلحة، وفي تبوك.",
        hadith: "في غزوة الخندق، صنع جابر طعاماً يكفي لثلاثة أشخاص، فدعا النبي ﷺ الجيش كله (ألف رجل)، فبصق في العجين والبرمة وبارك، فأكل الألف حتى شبعوا وانصرفوا، وبقي الطعام كما هو كأنه لم يُمس.",
        icon: Utensils,
        color: "text-emerald-400"
    },
    {
        id: 'tree',
        title: "حنين الجذع",
        subtitle: "شوق الجماد",
        description: "كان النبي ﷺ يخطب مستنداً إلى جذع نخلة في المسجد، فلما صُنع له المنبر وترك الجذع، سُمع للجذع أنين وبكاء كبكاء الصبي شوقاً لرسول الله، حتى نزل وضمه فسكن.",
        hadith: "عن جابر بن عبد الله قال: كان المسجد مسقوفاً على جذوع من نخل، فكان النبي ﷺ إذا خطب يقوم إلى جذع منها، فلما صُنع له المنبر وسمعنا لذلك الجذع صوتاً كصوت العشار، حتى جاء النبي ﷺ فوضع يده عليها فسكنت.",
        icon: TreePine,
        color: "text-amber-600"
    },
    {
        id: 'israa',
        title: "الإسراء والمعراج",
        subtitle: "الرحلة السماوية",
        description: "أُسري بالنبي ﷺ من مكة إلى القدس، ثم عُرج به إلى السماوات العلى حتى سدرة المنتهى، في ليلة واحدة، ورأى من آيات ربه الكبرى وفرضت فيها الصلاة.",
        hadith: "قال تعالى: ﴿سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى الَّذِي بَارَكْنَا حَوْلَهُ لِنُرِيَهُ مِنْ آيَاتِنَا﴾. وصلى بالأنبياء إماماً في بيت المقدس.",
        icon: CloudLightning,
        color: "text-indigo-400"
    }
];

export function MiraclesGallery() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextMiracle = () => {
        setCurrentIndex((prev) => (prev + 1) % MIRACLES.length);
    };

    const prevMiracle = () => {
        setCurrentIndex((prev) => (prev - 1 + MIRACLES.length) % MIRACLES.length);
    };

    const current = MIRACLES[currentIndex];

    return (
        <section className="py-24 relative overflow-hidden bg-black border-y border-white/5" dir="rtl">
            {/* Background Effect */}
            <div className="absolute inset-0 z-0">
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-10 transition-colors duration-1000", current.color.replace('text-', 'bg-'))} />
            </div>

            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
                        <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white font-headline mb-4">معجزات النبي ﷺ</h2>
                    <p className="text-white/40 text-lg md:text-xl font-bold max-w-2xl mx-auto">
                        آيات باهرات وخرق للسنن الكونية، أيد الله بها نبيه لتكون دليلاً قاطعاً على نبوته ورسالته.
                    </p>
                </div>

                <div className="w-full relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            className="bg-[#0c0c0c] border border-white/10 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                {/* Visual Side */}
                                <div className="lg:col-span-5 flex flex-col items-center text-center">
                                    <div className={cn("w-40 h-40 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative shadow-2xl", current.color)}>
                                        <div className={cn("absolute inset-0 rounded-full blur-[40px] opacity-20", current.color.replace('text-', 'bg-'))} />
                                        <current.icon size={80} className="relative z-10 drop-shadow-2xl" />
                                    </div>
                                    <h3 className="text-4xl font-black text-white font-headline mb-2">{current.title}</h3>
                                    <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-black uppercase tracking-widest">
                                        {current.subtitle}
                                    </span>
                                </div>

                                {/* Content Side */}
                                <div className="lg:col-span-7 space-y-8">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-white/40 font-black text-xs uppercase tracking-widest mb-4">
                                            <Info className="w-4 h-4" /> وصف المعجزة
                                        </h4>
                                        <p className="text-2xl text-white font-bold leading-relaxed">
                                            {current.description}
                                        </p>
                                    </div>
                                    
                                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                                        <h4 className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-3">
                                            <Quote className="w-3.5 h-3.5" /> الدليل من القرآن والسنة
                                        </h4>
                                        <p className="text-lg text-primary/90 font-bold leading-relaxed italic">
                                            "{current.hadith}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Controls */}
                    <div className="flex justify-center items-center gap-6 mt-12">
                        <Button 
                            onClick={prevMiracle}
                            variant="outline" 
                            size="icon" 
                            className="w-14 h-14 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                        
                        <div className="flex gap-2">
                            {MIRACLES.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "w-3 h-3 rounded-full transition-all duration-300",
                                        idx === currentIndex ? "w-10 bg-amber-500" : "bg-white/20 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>

                        <Button 
                            onClick={nextMiracle}
                            variant="outline" 
                            size="icon" 
                            className="w-14 h-14 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
