'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Moon, Star, Shield, Sun, BookOpen, Heart, Zap } from 'lucide-react';

interface Event {
    year: string;
    title: string;
    description: string;
    icon: any;
    color: string;
}

const makkahEvents: Event[] = [
    { year: "عام الفيل", title: "ميلاد خير البرية", description: "في مكة المكرمة، وُلد النبي صلى الله عليه وسلم يتيماً، فكان ميلاده فجراً جديداً للبشرية جمعاء، وتحقيقاً لدعوة إبراهيم وبشارة عيسى عليهما السلام.", icon: Sun, color: "text-amber-500" },
    { year: "40 من العمر", title: "نزول الوحي", description: "في غار حراء، نزل جبريل عليه السلام بأول كلمات القرآن الكريم (اقرأ)، لتبدأ أعظم رحلة في تاريخ الإنسان نحو التوحيد والنور.", icon: BookOpen, color: "text-emerald-500" },
    { year: "السنة 3", title: "الجهر بالدعوة", description: "صعد النبي صلى الله عليه وسلم على الصفا، ونادى في قريش معلناً رسالة التوحيد، فواجه الصدّ والتكذيب ولكن ثبت بفضل الله.", icon: Zap, color: "text-amber-400" },
    { year: "السنة 5", title: "الهجرة للحبشة", description: "أمر النبي أصحابه بالهجرة إلى ملك لا يُظلم عنده أحد، فراراً بدينهم من اضطهاد قريش، وكانت أول هجرة في الإسلام.", icon: Moon, color: "text-blue-400" },
    { year: "السنة 10", title: "عام الحزن", description: "فقد النبي نصيره عمه أبا طالب، وزوجته خديجة رضي الله عنها، ثم كانت رحلة الإسراء والمعراج تثبيتاً وتكريماً له.", icon: Heart, color: "text-rose-500" },
];

const madinahEvents: Event[] = [
    { year: "1 هـ", title: "بناء المسجد", description: "أول عمل قام به النبي في المدينة هو بناء المسجد، ليكون مركز العبادة، والتعليم، وقيادة الدولة الإسلامية الناشئة.", icon: Star, color: "text-yellow-500" },
    { year: "2 هـ", title: "غزوة بدر الكبرى", description: "يوم الفرقان، حيث أعز الله جنده ونصر عبده بمدد من الملائكة، وكانت نقطة تحول كبرى في موازين القوى في الجزيرة.", icon: Shield, color: "text-amber-600" },
    { year: "3 هـ", title: "غزوة أحد", description: "درس بليغ في الطاعة والثبات، وفقد فيها الإسلام سيد الشهداء حمزة بن عبد المطلب وكوكبة من الصحابة الكرام.", icon: Sparkles, color: "text-orange-500" },
    { year: "8 هـ", title: "فتح مكة", description: "عاد النبي فاتحاً عافياً، فحطم الأصنام وطهر الكعبة، ودخل الناس في دين الله أفواجاً برحمة الإسلام.", icon: Sun, color: "text-amber-400" },
    { year: "11 هـ", title: "الرفيق الأعلى", description: "انتقل النبي إلى جوار ربه بعد أن أدى الأمانة وبلغ الرسالة ونصح الأمة، وترك فينا ما لن نضل معه أبداً.", icon: Heart, color: "text-white" },
];

export function SeerahTimeline({ era = "makkah" }: { era?: "makkah" | "madinah" }) {
    const events = era === "makkah" ? makkahEvents : madinahEvents;

    return (
        <section className="relative py-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-amber-500/40 via-amber-500/5 to-transparent" />
            
            <div className="space-y-32">
                {events.map((event, i) => (
                    <TimelineItem key={i} event={event} side={i % 2 === 0 ? 'right' : 'left'} />
                ))}
            </div>
        </section>
    );
}

function TimelineItem({ event, side }: { event: Event, side: 'left' | 'right' }) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: side === 'right' ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={cn(
                "relative flex items-center w-full",
                side === 'right' ? "flex-row" : "flex-row-reverse"
            )}
        >
            {/* Empty space for alignment */}
            <div className="hidden md:block w-1/2" />
            
            {/* Timeline Node */}
            <div className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#111] border-4 border-amber-500/50 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
                    <event.icon className={cn("w-7 h-7", event.color)} />
                </div>
                <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl">
                    <span className="text-amber-500 font-black text-xs uppercase tracking-[0.2em]">{event.year}</span>
                </div>
            </div>

            {/* Content Card */}
            <div className={cn(
                "w-full md:w-[45%] p-10 bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-[3rem] group hover:bg-white/[0.03] transition-all duration-700 shadow-2xl relative overflow-hidden",
                side === 'right' ? "md:ms-16" : "md:me-16 text-left md:text-right"
            )}>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black text-white mb-6 font-headline tracking-tight">{event.title}</h3>
                    <p className="text-white/40 text-xl leading-relaxed font-bold">{event.description}</p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </div>
        </motion.div>
    );
}
