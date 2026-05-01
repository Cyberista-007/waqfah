'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Moon, Sun, Sunrise, Sunset, Users, Heart, Shield, BookOpen, Clock, Coffee, Smile, Star, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const daySlots = [
    {
        id: 'dawn',
        time: "03:00 - 05:00",
        label: "قبل الفجر",
        title: "الخلوة والتهجد",
        desc: "كان النبي ﷺ يقوم ثلث الليل، يناجي ربه ويصلي حتى تتفطر قدماه شكرًا لله. كان يقرأ أواخر سورة آل عمران متفكراً في خلق السموات والأرض.",
        habit: "السواك عند الاستيقاظ",
        didYouKnow: "كان النبي ﷺ ينام أول الليل ويحيي آخره، وكان يوقظ أهله للصلاة حباً ورفقاً.",
        icon: Moon,
        color: "text-blue-400",
        bgLight: "radial-gradient(circle at 50% 0%, rgba(30,58,138,0.5), transparent 70%)",
        bg: "from-[#020510] to-[#010205]"
    },
    {
        id: 'fajr',
        time: "05:00 - 07:00",
        label: "الفجر",
        title: "صلاة الفجر والذكر",
        desc: "بعد الصلاة، يجلس في مصلاه يذكر الله حتى تطلع الشمس. كان هذا وقت توزيع الأرزاق المعنوية والبركة في البكور.",
        habit: "أذكار الصباح",
        didYouKnow: "كان النبي ﷺ لا يقوم من مصلاه حتى تطلع الشمس، وكان يمازح أصحابه ويستمع لأحلامهم.",
        icon: Sunrise,
        color: "text-amber-500",
        bgLight: "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.4), transparent 70%)",
        bg: "from-[#1a0f05] to-[#010205]"
    },
    {
        id: 'duha',
        time: "08:00 - 11:00",
        label: "الضحى",
        title: "إدارة الشؤون",
        desc: "وقت العمل والقضاء وخدمة الأهل. كان يكون في مهنة أهله، يخصف نعله ويرقع ثوبه، جامعًا بين الدنيا والدين في أعظم صور التواضع.",
        habit: "صلاة الضحى",
        didYouKnow: "سُئلت عائشة رضي الله عنها: ما كان النبي ﷺ يصنع في بيته؟ قالت: كان يكون في مِهنة أهله.",
        icon: Sun,
        color: "text-yellow-400",
        bgLight: "radial-gradient(circle at 50% -20%, rgba(250,204,21,0.3), transparent 80%)",
        bg: "from-[#1a1805] to-[#010205]"
    },
    {
        id: 'noon',
        time: "12:00 - 15:00",
        label: "الظهر",
        title: "استقبال الوفود",
        desc: "وقت القيادة السياسية، حيث يستقبل الوفود من شتى بقاع الأرض، ويدير شؤون الدولة الإسلامية الناشئة بالحكمة والعدل.",
        habit: "القيلولة (ساعة الراحة)",
        didYouKnow: "كان النبي ﷺ يقيل (ينام قليلاً) ليتقوى على قيام الليل، وكان يقول: قيلوا فإن الشياطين لا تقيل.",
        icon: Shield,
        color: "text-rose-500",
        bgLight: "radial-gradient(circle at 50% 50%, rgba(225,29,72,0.2), transparent 70%)",
        bg: "from-[#1a0508] to-[#010205]"
    },
    {
        id: 'asr',
        time: "16:00 - 18:00",
        label: "العصر",
        title: "مجلس العلم",
        desc: "يجتمع مع عامة الناس في المسجد، يعلمهم القرآن، يشرح لهم أحكام الدين، ويجيب على تساؤلاتهم برحمة وصبر.",
        habit: "التفقد والوعظ",
        didYouKnow: "كان النبي ﷺ يتخول أصحابه بالموعظة كراهة السآمة عليهم، مراعياً أحوالهم النفسية والبدنية.",
        icon: BookOpen,
        color: "text-emerald-500",
        bgLight: "radial-gradient(circle at 20% 80%, rgba(16,185,129,0.3), transparent 70%)",
        bg: "from-[#021a10] to-[#010205]"
    },
    {
        id: 'maghrib',
        time: "19:00 - 21:00",
        label: "المغرب",
        title: "الترابط الاجتماعي",
        desc: "يصلي بالناس، ثم يتفقد أحوال أصحابه. كان مجلسه مجلس علم وحلم وأمانة، لا تُرفع فيه الأصوات ولا تُنتهك فيه الحرمات.",
        habit: "أذكار المساء",
        didYouKnow: "كان النبي ﷺ يكره النوم قبل العشاء والحديث بعدها، إلا في أمر ينفع المسلمين أو يؤنس الأهل.",
        icon: Sunset,
        color: "text-orange-500",
        bgLight: "radial-gradient(circle at 0% 50%, rgba(249,115,22,0.3), transparent 70%)",
        bg: "from-[#1a0a02] to-[#010205]"
    },
    {
        id: 'night',
        time: "22:00 - 02:00",
        label: "الليل",
        title: "الأهل والسكينة",
        desc: "يقضي وقته مع زوجاته، يسامرهن ويلاطفهن، يعطيهن حقهن من الحب والاهتمام، ضاربًا أروع الأمثلة في حسن العشرة.",
        habit: "إكرام الأهل",
        didYouKnow: "كان النبي ﷺ يقول: خيركم خيركم لأهله، وأنا خيركم لأهلي. وكان يسابق عائشة تودداً إليها.",
        icon: Heart,
        color: "text-pink-400",
        bgLight: "radial-gradient(circle at 50% 100%, rgba(244,114,182,0.2), transparent 70%)",
        bg: "from-[#1a0510] to-[#010205]"
    }
];

export function SeerahPropheticDay() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    return (
        <section ref={containerRef} className="relative h-[700vh] bg-transparent" dir="rtl">
            {/* Ambient Dynamic Environment - Fixed */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden perspective-[1000px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`bg-${activeIndex}`}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className={cn("absolute inset-0 bg-gradient-to-b", daySlots[activeIndex].bg)}
                    >
                        {/* Dramatic Light Source */}
                        <div className="absolute inset-0" style={{ background: daySlots[activeIndex].bgLight }} />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Fixed Chrono Dial HUD */}
            <div className="fixed top-1/2 -translate-y-1/2 left-8 md:left-16 z-50 pointer-events-none hidden lg:block">
                <div className="relative w-64 h-64 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex items-center justify-center p-4 pointer-events-auto transform-gpu" style={{ transformStyle: "preserve-3d" }}>
                    
                    {/* Ring Path */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        <circle cx="50" cy="50" r="46" className="fill-none stroke-white/5 stroke-[2]" />
                        <motion.circle
                            cx="50" cy="50" r="46"
                            className={cn("fill-none stroke-[3] transition-colors duration-1000", daySlots[activeIndex].color.replace('text-', 'stroke-'))}
                            style={{ pathLength: smoothProgress, filter: 'drop-shadow(0 0 5px currentColor)' }}
                        />
                    </svg>

                    {/* Nodes on Dial */}
                    {daySlots.map((slot, i) => {
                        const angle = (i / (daySlots.length - 1)) * Math.PI * 2 - Math.PI / 2;
                        const radius = 46;
                        const cx = 50 + radius * Math.cos(angle);
                        const cy = 50 + radius * Math.sin(angle);
                        
                        return (
                            <button
                                key={slot.id}
                                onClick={() => {
                                    const section = document.getElementById(`day-stage-${slot.id}`);
                                    section?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${cx}%`, top: `${cy}%` }}
                            >
                                <div className={cn(
                                    "w-3 h-3 rounded-full border-2 transition-all duration-500",
                                    activeIndex === i ? cn("bg-white border-white scale-150 shadow-[0_0_15px_#fff]", slot.color) : "bg-black border-white/20 hover:scale-125"
                                )} />
                            </button>
                        );
                    })}

                    <div className="text-center relative z-10 flex flex-col items-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                                transition={{ duration: 0.6, type: "spring" }}
                                className={cn("w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-inner mb-3", daySlots[activeIndex].color)}
                            >
                                {React.createElement(daySlots[activeIndex].icon, { size: 30, className: "drop-shadow-md" })}
                            </motion.div>
                        </AnimatePresence>
                        <p className={cn("font-black text-xs uppercase tracking-[0.4em] transition-colors duration-500", daySlots[activeIndex].color)}>
                            {daySlots[activeIndex].time}
                        </p>
                        <h4 className="text-xl font-black text-white font-headline mt-1">{daySlots[activeIndex].label}</h4>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Sections */}
            <div className="relative z-10">
                {daySlots.map((slot, i) => (
                    <section
                        key={slot.id}
                        id={`day-stage-${slot.id}`}
                        className="h-[100vh] relative flex items-center justify-center lg:justify-end px-4 lg:pl-16 lg:pr-32"
                    >
                        <DayCard
                            slot={slot}
                            index={i}
                            onInView={() => setActiveIndex(i)}
                            isActive={activeIndex === i}
                        />
                    </section>
                ))}
            </div>
        </section>
    );
}

function DayCard({ slot, index, onInView, isActive }: { slot: any, index: number, onInView: () => void, isActive: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { margin: "-48% 0px -48% 0px" });

    // 3D Parallax tilt for cards
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { damping: 30, stiffness: 150 });
    const smoothY = useSpring(mouseY, { damping: 30, stiffness: 150 });
    const tiltX = useTransform(smoothY, [0, 800], [5, -5]);
    const tiltY = useTransform(smoothX, [0, 800], [-5, 5]);

    useEffect(() => {
        if (isInView) onInView();
    }, [isInView, onInView]);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    return (
        <div ref={ref} className="w-full max-w-4xl perspective-[2000px] touch-none">
            <motion.div
                initial={{ opacity: 0, y: 100, rotateX: 20 }}
                animate={isActive ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0.3, y: 50, rotateX: 10 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                style={{ rotateX: isActive ? tiltX : 0, rotateY: isActive ? tiltY : 0, transformStyle: "preserve-3d" }}
                onPointerMove={handlePointerMove}
                className={cn(
                    "relative p-10 md:p-16 rounded-[4rem] bg-[#0a0a0a]/80 backdrop-blur-3xl border transition-all duration-700 shadow-[0_30px_60px_rgba(0,0,0,0.8)]",
                    isActive ? "border-white/20" : "border-transparent"
                )}
            >
                {/* Dynamic interior light */}
                <motion.div 
                    className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none rounded-[4rem]"
                    style={{ background: useMotionTemplate`radial-gradient(circle 400px at ${smoothX}px ${smoothY}px, rgba(255,255,255,0.4), transparent)` }}
                />

                <div className="relative z-10 flex flex-col gap-10 transform-gpu" style={{ transform: "translateZ(30px)" }}>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/5 pb-10">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <span className={cn("px-5 py-1.5 rounded-full bg-white/5 border text-[10px] font-black tracking-[0.4em] uppercase", slot.color, slot.color.replace('text-', 'border-').replace('-400', '-500/30').replace('-500', '-500/30'))}>
                                    {slot.time}
                                </span>
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">{slot.label}</span>
                            </div>
                            <h3 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 font-headline leading-tight tracking-tighter drop-shadow-xl">
                                {slot.title}
                            </h3>
                        </div>
                        <div className={cn(
                            "w-24 h-24 rounded-[2rem] bg-black border border-white/10 flex items-center justify-center shrink-0 shadow-2xl transition-transform duration-700",
                            isActive ? "scale-110 rotate-12" : "scale-100 rotate-0"
                        )}>
                            <slot.icon size={48} className={slot.color} />
                        </div>
                    </div>

                    <p className="text-xl md:text-3xl text-white/70 font-bold leading-relaxed max-w-3xl border-r-4 pr-6" style={{ borderColor: 'currentColor', color: 'inherit' }}>
                        <span className="text-white/80">"{slot.desc}"</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                        <div className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5 flex flex-col gap-4 group/item hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <Smile className={cn("w-5 h-5", slot.color)} />
                                <span className="text-white/40 font-black text-[10px] uppercase tracking-widest">من هديه ﷺ</span>
                            </div>
                            <p className="text-white/90 font-black text-xl">{slot.habit}</p>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex flex-col gap-4 group/item hover:bg-amber-500/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                                <span className="text-amber-500/60 font-black text-[10px] uppercase tracking-widest">إضاءة سيرة</span>
                            </div>
                            <p className="text-white/70 font-bold text-sm leading-relaxed">{slot.didYouKnow}</p>
                        </div>
                    </div>
                </div>

                {/* Number Watermark */}
                <div className="absolute -bottom-10 left-10 text-[15rem] font-black text-white/[0.02] select-none pointer-events-none transform-gpu" style={{ transform: "translateZ(-20px)" }}>
                    0{index + 1}
                </div>
            </motion.div>
        </div>
    );
}
