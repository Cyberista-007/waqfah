'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCollection } from '@/firebase';
import type { DestructiveSin } from '@/lib/types';
import { Loader2, AlertTriangle, EyeOff, Angry, MessageSquareX, X, Info, CalendarDays, BookOpen, ScrollText, Video, TriangleAlert, ArrowLeft, Search, Filter, Sparkles, Target, Zap, MousePointer2, Stethoscope, ShieldPlus, ActivitySquare, Network, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 20
        }
    }
} as const;

const getSinTheme = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('غضب') || t.includes('قتل') || t.includes('عقوق')) return { color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5', glow: 'from-red-600/20', shadow: 'shadow-red-500/10', level: 'عظيم', category: 'غلاظ' };
    if (t.includes('حسد') || t.includes('بخل')) return { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', glow: 'from-emerald-600/20', shadow: 'shadow-emerald-500/10', level: 'شديد', category: 'قلبية' };
    if (t.includes('كبر') || t.includes('عجب')) return { color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', glow: 'from-amber-600/20', shadow: 'shadow-amber-500/10', level: 'عظيم', category: 'باطنة' };
    if (t.includes('نفاق') || t.includes('كذب') || t.includes('غيبة') || t.includes('لسان')) return { color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', glow: 'from-purple-600/20', shadow: 'shadow-purple-500/10', level: 'شديد', category: 'لسانية' };
    return { color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/5', glow: 'from-rose-600/20', shadow: 'shadow-rose-500/10', level: 'تنبيه', category: 'أخرى' };
};

const getIcon = (iconName: string, className?: string) => {
    const iconClass = cn("h-12 w-12 text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]", className);
    if (iconName?.startsWith('http')) {
        return <img src={iconName} alt="icon" className={cn(iconClass, "object-contain")} />;
    }
    switch (iconName) {
        case 'MessageSquareX': return <MessageSquareX className={iconClass} />;
        case 'EyeOff': return <EyeOff className={iconClass} />;
        case 'Angry': return <Angry className={iconClass} />;
        default: return <AlertTriangle className={iconClass} />;
    }
};

const SinCard = memo(({
    sin,
    isFocused,
    toggleFocus,
    isReadingMode,
    fontSize
}: {
    sin: DestructiveSin,
    isFocused: boolean,
    toggleFocus: (id: string, e: React.MouseEvent) => void,
    isReadingMode?: boolean,
    fontSize?: number
}) => {
    const theme = getSinTheme(sin.title);
    const [activeTab, setActiveTab] = useState<'info' | 'cure' | 'test'>('info');
    const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setMousePos({ x, y });
    };

    const calculateTilt = () => {
        if (!isHovered) return { rotateX: 0, rotateY: 0 };
        return {
            rotateX: mousePos.y * -0.02,
            rotateY: mousePos.x * 0.02,
        };
    };

    const cureSteps = sin.curePlan && sin.curePlan.length > 0 ? sin.curePlan : [
        "الاستعانة بالله والدعاء الصادق بالشفاء من هذا الداء.",
        "تأمل النصوص القرآنية والأحاديث المحذرة من عواقب هذا الفعل.",
        "مراقبة النفس ومحاسبتها يومياً قبل النوم.",
        "الابتعاد عن البيئة أو الأشخاص الذين يهيجون هذا الداء."
    ];
    
    const testQuestions = sin.testQuestions && sin.testQuestions.length > 0 ? sin.testQuestions : [
        `هل تشعر بهذا الداء يتحكم في ردود أفعالك عند الغضب؟`,
        `هل تجد صعوبة في مجاهدة نفسك لترك هذا الفعل؟`,
        `هل تشعر بالندم السريع بعد الوقوع فيه؟`
    ];

    const score = Object.values(testAnswers).reduce((a, b) => a + b, 0);
    const isTestComplete = Object.keys(testAnswers).length === testQuestions.length;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <motion.button
                    variants={itemVariants}
                    animate={calculateTilt()}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }); }}
                    onMouseMove={handleMouseMove}
                    whileTap={{ scale: 0.98 }}
                    style={{ transformStyle: "preserve-3d" }}
                    className={cn(
                        "group relative h-[420px] rounded-[3.5rem] overflow-hidden border transition-all duration-300 w-full text-right flex flex-col",
                        "bg-[#09090b] border-white/5",
                        "hover:border-white/20 hover:bg-zinc-900/40",
                        isFocused ? "ring-1 ring-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : theme.shadow
                    )}
                >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                    <div className="absolute top-8 inset-x-8 z-20 flex justify-between items-center" style={{ transform: "translateZ(30px)" }}>
                        <div className={cn(
                            "px-4 py-1.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md",
                            theme.color, theme.border
                        )}>
                            {theme.level}
                        </div>
                        <button
                            onClick={(e) => toggleFocus(sin.id, e)}
                            className={cn(
                                "h-10 w-10 rounded-xl border flex items-center justify-center transition-all",
                                isFocused ? "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-white/5 text-white/10 border-white/10 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <Target className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="relative h-56 w-full flex items-center justify-center pt-8" style={{ transform: "translateZ(50px)" }}>
                        <div className={cn(
                            "absolute inset-0 blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-700",
                            theme.glow
                        )} />
                        <div className="relative w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl">
                            {getIcon(sin.icon, cn("h-12 w-12", theme.color))}
                        </div>
                    </div>

                    <div className="relative flex-1 p-10 pt-0 flex flex-col items-center text-center" style={{ transform: "translateZ(20px)" }}>
                        <h3 className="text-3xl font-black text-white tracking-tighter mb-2 group-hover:text-red-100 transition-colors">
                            {sin.title}
                        </h3>
                        <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.3em] mb-8">
                            {theme.category}
                        </p>

                        <div className="w-full py-4 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-center gap-3 group-hover:border-white/10 group-hover:bg-white/[0.05] transition-all">
                            <Stethoscope className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[9px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.3em]">العيادة القلبية</span>
                        </div>
                    </div>
                </motion.button>
            </DialogTrigger>

            <DialogContent hideCloseButton className="max-w-2xl p-0 border-0 bg-transparent text-white shadow-none overflow-visible" dir="rtl">
                <DialogHeader className="sr-only">
                    <DialogTitle>{sin.title}</DialogTitle>
                </DialogHeader>

                <div className={cn(
                    "relative rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] bg-[#0c0c0f] border border-white/8 shadow-[0_40px_120px_rgba(0,0,0,0.9)] transition-all duration-500",
                    isReadingMode && "border-white/2"
                )}>

                    <div className={cn("relative h-52 flex-shrink-0 overflow-hidden transition-all duration-500", isReadingMode && "h-0 opacity-0")}>
                        <div className={cn("absolute inset-0 opacity-40", `bg-gradient-to-br ${theme.glow} to-transparent`)} />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0c0c0f]" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                        <DialogClose asChild>
                            <button className="absolute top-5 left-5 h-10 w-10 rounded-2xl bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center transition-all backdrop-blur-md z-10 hover:scale-105">
                                <X className="h-4 w-4 text-white/60" />
                            </button>
                        </DialogClose>
                        <div className="absolute bottom-0 right-0 p-8 flex items-end gap-5">
                            <div className={cn("w-20 h-20 rounded-3xl bg-black/50 border flex items-center justify-center backdrop-blur-2xl flex-shrink-0", theme.border)}>
                                {getIcon(sin.icon, cn("h-10 w-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]", theme.color))}
                            </div>
                            <div className="mb-1">
                                <div className={cn("text-[9px] font-black uppercase tracking-[0.5em] mb-1.5 opacity-70", theme.color)}>
                                    {theme.category} · {theme.level}
                                </div>
                                <h2 className="text-5xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">{sin.title}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className={cn("flex border-b border-white/5 bg-black/20 backdrop-blur-md relative z-20", isReadingMode && "hidden")}>
                        {[
                            { id: 'info', label: 'التشخيص', icon: Info },
                            { id: 'cure', label: 'خطة العلاج', icon: ShieldPlus },
                            { id: 'test', label: 'التقييم الذاتي', icon: ActivitySquare }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)} 
                                className={cn(
                                    "flex-1 p-4 flex items-center justify-center gap-2 text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-300 relative",
                                    activeTab === tab.id ? cn(theme.color, "bg-white/[0.02]") : "text-white/40 hover:text-white/80 hover:bg-white/[0.01]"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.id && <motion.div layoutId="activeTabIndicator" className={cn("absolute bottom-0 left-0 right-0 h-0.5", theme.bg.replace('/5', 'bg-').replace('bg-bg-', 'bg-'))} />}
                            </button>
                        ))}
                    </div>

                    <ScrollArea className="flex-1 min-h-0">
                        <div className={cn("px-8 pb-8 pt-6", isReadingMode && "max-w-xl mx-auto py-20")}>
                            
                            <AnimatePresence mode="wait">
                                {activeTab === 'info' && (
                                    <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                        {isReadingMode && (
                                            <div className="text-center mb-16">
                                                <h2 className="text-4xl font-black text-white mb-2">{sin.title}</h2>
                                                <div className={cn("text-[10px] font-black uppercase tracking-widest", theme.color)}>{theme.category}</div>
                                            </div>
                                        )}

                                        {sin.concept && (
                                            <div className="rounded-2xl bg-white/[0.03] border border-white/6 p-6">
                                                <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] mb-4", theme.color)}>
                                                    <Info className="w-3.5 h-3.5" /> التشخيص
                                                </div>
                                                <p className={cn("text-white/75 text-base leading-[1.9] transition-all", isReadingMode && "reading-text")} style={isReadingMode ? { fontSize: `${fontSize}px` } : {}}>
                                                    {sin.concept}
                                                </p>
                                            </div>
                                        )}

                                        {(sin.quranVerses?.[0] || sin.hadiths?.[0]) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {sin.quranVerses?.[0] && (
                                                    <div className="rounded-2xl bg-amber-950/30 border border-amber-500/15 p-6 flex flex-col gap-3">
                                                        <div className="flex items-center gap-2 text-[9px] font-black text-amber-500/70 uppercase tracking-[0.4em]">
                                                            <BookOpen className="w-3.5 h-3.5" /> قرآن كريم
                                                        </div>
                                                        <p className={cn("font-amiri text-xl text-amber-50/90 leading-loose text-center flex-1 transition-all", isReadingMode && "reading-text")} style={isReadingMode ? { fontSize: `${fontSize && fontSize + 6}px` } : {}}>
                                                            {sin.quranVerses[0]}
                                                        </p>
                                                    </div>
                                                )}
                                                {sin.hadiths?.[0] && (
                                                    <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/15 p-6 flex flex-col gap-3">
                                                        <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.4em]">
                                                            <ScrollText className="w-3.5 h-3.5" /> حديث شريف
                                                        </div>
                                                        <p className={cn("font-amiri text-xl text-emerald-50/90 leading-loose text-center flex-1 transition-all", isReadingMode && "reading-text")} style={isReadingMode ? { fontSize: `${fontSize && fontSize + 6}px` } : {}}>
                                                            {sin.hadiths[0]}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {sin.dailyLifeExamples?.[0] && (
                                            <div className="rounded-2xl bg-indigo-950/20 border border-indigo-500/10 p-6">
                                                <div className="flex items-center gap-2 text-[9px] font-black text-indigo-400/60 uppercase tracking-[0.4em] mb-4">
                                                    <Zap className="w-3.5 h-3.5" /> مثال من الواقع
                                                </div>
                                                <p className="text-white/50 text-base leading-relaxed italic border-r-2 border-indigo-500/20 pr-5">
                                                    {sin.dailyLifeExamples[0]}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 mt-6">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">
                                                <Network className="w-3.5 h-3.5" /> مهلكات مرتبطة (احذر منها)
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {['الكبر', 'الحسد', 'الرياء'].map(rel => (
                                                    <span key={rel} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold hover:bg-white/10 hover:text-white cursor-pointer transition-all">
                                                        {rel}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'cure' && (
                                    <motion.div key="cure" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                        <div className={cn("p-6 rounded-2xl border", theme.bg, theme.border)}>
                                            <h3 className={cn("text-lg font-black mb-2", theme.color)}>البروتوكول العلاجي</h3>
                                            <p className="text-white/60 text-sm leading-relaxed">تطبيق هذه الخطوات بصدق وإخلاص مع الدعاء المستمر كفيل بإذن الله بتطهير القلب من هذا الداء.</p>
                                        </div>
                                        
                                        <div className="space-y-4 relative before:absolute before:inset-y-0 before:right-4 before:w-px before:bg-white/10">
                                            {cureSteps.map((step, idx) => (
                                                <div key={idx} className="relative pr-12">
                                                    <div className={cn("absolute right-2 top-1 w-5 h-5 rounded-full border-[3px] border-[#0c0c0f] flex items-center justify-center text-[10px] font-black bg-white", theme.color)}>
                                                        <span className="text-[#0c0c0f]">{idx + 1}</span>
                                                    </div>
                                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                                                        <p className="text-white/80 font-medium leading-relaxed">{step}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'test' && (
                                    <motion.div key="test" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                        {!isTestComplete ? (
                                            <>
                                                <div className="text-center p-6 mb-4">
                                                    <ActivitySquare className={cn("w-12 h-12 mx-auto mb-4 opacity-50", theme.color)} />
                                                    <h3 className="text-xl font-black text-white mb-2">مقياس خطورة الداء</h3>
                                                    <p className="text-white/40 text-sm">أجب بصدق بينك وبين نفسك لتعرف مستوى تغلغل هذه المهلكة في قلبك.</p>
                                                </div>
                                                <div className="space-y-6">
                                                    {testQuestions.map((q, idx) => (
                                                        <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                                            <p className="text-white/90 font-bold mb-6 text-lg">{q}</p>
                                                            <div className="flex flex-col sm:flex-row gap-2">
                                                                <button onClick={() => setTestAnswers(prev => ({ ...prev, [idx]: 3 }))} className={cn("flex-1 p-3 rounded-xl border text-sm font-bold transition-all", testAnswers[idx] === 3 ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10")}>دائماً (حرج)</button>
                                                                <button onClick={() => setTestAnswers(prev => ({ ...prev, [idx]: 2 }))} className={cn("flex-1 p-3 rounded-xl border text-sm font-bold transition-all", testAnswers[idx] === 2 ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10")}>أحياناً (متوسط)</button>
                                                                <button onClick={() => setTestAnswers(prev => ({ ...prev, [idx]: 0 }))} className={cn("flex-1 p-3 rounded-xl border text-sm font-bold transition-all", testAnswers[idx] === 0 ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10")}>نادراً (سليم)</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 px-6">
                                                <div className={cn("w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 border-4", score > 5 ? "bg-red-500/20 border-red-500/50 text-red-500" : score > 2 ? "bg-amber-500/20 border-amber-500/50 text-amber-500" : "bg-emerald-500/20 border-emerald-500/50 text-emerald-500")}>
                                                    <span className="text-4xl font-black">{score}</span>
                                                </div>
                                                <h3 className="text-3xl font-black text-white mb-2">
                                                    {score > 5 ? "مستوى حرج جداً" : score > 2 ? "مستوى تحذيري" : "قلب سليم بفضل الله"}
                                                </h3>
                                                <p className="text-white/50 text-lg leading-relaxed mb-8">
                                                    {score > 5 ? "هذه المهلكة متأصلة بشكل كبير، وعليك التوجه فوراً لخطة العلاج وتطبيقها بصرامة." : score > 2 ? "أنت على حافة الخطر، سارع بتدارك نفسك قبل أن يتفاقم الداء." : "الحمد لله، استمر في مراقبة نفسك لتظل في أمان."}
                                                </p>
                                                <Button onClick={() => setActiveTab('cure')} className="h-14 px-8 rounded-xl font-black text-lg bg-white text-black hover:bg-zinc-200">
                                                    بدء خطة العلاج فوراً <ArrowRight className="w-5 h-5 mr-2" />
                                                </Button>
                                                <Button variant="ghost" onClick={() => setTestAnswers({})} className="mt-4 text-white/40 hover:text-white">إعادة التقييم</Button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </ScrollArea>

                    {/* ── Sticky Footer ── */}
                    <div className={cn("transition-all duration-500", isReadingMode && "opacity-0 h-0 p-0 overflow-hidden")}>
                        {sin.linkedVideoId ? (
                            <div className="flex-shrink-0 p-6 border-t border-white/5 bg-[#0c0c0f]">
                                <Button asChild className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-100 font-black text-lg gap-3 group/cta transition-all">
                                    <Link href={`/lectures/${sin.linkedVideoId}`}>
                                        <Video className="w-5 h-5 group-hover/cta:scale-110 transition-transform" />
                                        مشاهدة الدرس التطبيقي
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex-shrink-0 h-6 bg-[#0c0c0f]" />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
});
SinCard.displayName = 'SinCard';

export default function MuhlikatPage() {
    const { isReadingMode, fontSize } = useReadingMode();
    const { data: sins, isLoading } = useCollection<DestructiveSin>('destructive_sins');
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('الكل');
    const [focusedSins, setFocusedSins] = useState<string[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem('muhlikat_focus');
        if (saved) {
            try { setFocusedSins(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    const toggleFocus = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = focusedSins.includes(id)
            ? focusedSins.filter(i => i !== id)
            : [...focusedSins, id];
        setFocusedSins(next);
        localStorage.setItem('muhlikat_focus', JSON.stringify(next));
    };

    const filteredSins = useMemo(() => {
        if (!sins) return [];
        return sins.filter(s => {
            const matchesSearch = s.title.includes(search) || (s.concept?.includes(search));
            const matchesCategory = activeFilter === 'الكل' || getSinTheme(s.title).category === activeFilter;
            return matchesSearch && matchesCategory;
        });
    }, [sins, search, activeFilter]);

    const categories = ['الكل', 'غلاظ', 'قلبية', 'باطنة', 'لسانية', 'أخرى'];

    if (!isClient) return null;

    return (
        <div className="min-h-screen pb-24 bg-[#0a0a0c] text-white selection:bg-red-500/30 overflow-x-hidden relative">
            {/* ── Background: Cinematic Slate ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className={cn("container relative z-10 px-4 sm:px-6", isReadingMode && "reading-content")}>
                <div className="flex justify-center mb-10 relative z-50">
                    <ReadingModeToggle />
                </div>
                
                {/* ── The "Frame" (Main Container) ── */}
                <div className="relative group/frame max-w-7xl mx-auto rounded-[4rem] p-1 bg-gradient-to-br from-red-500/20 via-white/5 to-transparent shadow-2xl">
                    <div className="relative bg-[#0d0d10] rounded-[3.9rem] overflow-hidden p-8 md:p-16">
                        
                        {/* Background Decor inside frame */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[radial-gradient(#ff0000_1px,transparent_1px)] bg-[size:40px_40px]" />

                        {/* ── Hero inside frame ── */}
                        <div className={cn("text-center pb-16 transition-all duration-500 relative z-10", isReadingMode && "opacity-0 h-0 p-0 overflow-hidden")}>
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black mb-8 uppercase tracking-[0.4em]">
                                    <Zap className="w-3.5 h-3.5 fill-red-500" /> مجهر النفس والتزكية
                                </div>
                                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
                                    موسوعة <span className="text-red-500">المهلكات</span>
                                </h1>
                                <p className="text-white/30 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-tajawal">
                                    تشخيص دقيق لأدوية القلوب المهلكة وسبل الوقاية منها — رحلة التزكية تبدأ من هنا.
                                </p>

                                {/* Focus Stats */}
                                <div className="flex items-center justify-center gap-12 mt-12">
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-black text-white">{sins?.length || 0}</span>
                                        <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-1">مرضاً نفسياً</span>
                                    </div>
                                    <div className="w-px h-12 bg-white/10" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-black text-red-500">{focusedSins.length}</span>
                                        <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-1">تحت العلاج</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* ── Search & Filter ── */}
                        <div className={cn("max-w-4xl mx-auto mb-20 hide-in-reading-mode relative z-10")}>
                            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-3 flex flex-col md:flex-row items-center gap-4 group focus-within:border-red-500/20 transition-all">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-red-500 transition-colors" />
                                    <Input 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="ابحث عن داء أو علاج..."
                                        className="bg-transparent border-none text-xl pr-14 h-14 focus-visible:ring-0 placeholder:text-white/10 text-white"
                                    />
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 px-4">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveFilter(cat)}
                                            className={cn(
                                                "px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all whitespace-nowrap",
                                                activeFilter === cat 
                                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20 scale-105" 
                                                    : "text-white/30 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Grid ── */}
                        <div className="relative z-10">
                            {isLoading ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className="h-[420px] rounded-[3.5rem] bg-white/[0.02] border border-white/5 animate-pulse flex flex-col p-10">
                                            <div className="flex justify-between items-center mb-12">
                                                <div className="w-16 h-6 bg-white/5 rounded-2xl" />
                                                <div className="w-10 h-10 bg-white/5 rounded-xl" />
                                            </div>
                                            <div className="flex-1 flex items-center justify-center mb-8">
                                                <div className="w-24 h-24 bg-white/5 rounded-3xl" />
                                            </div>
                                            <div className="space-y-4 flex flex-col items-center">
                                                <div className="w-32 h-8 bg-white/10 rounded-full" />
                                                <div className="w-20 h-3 bg-white/5 rounded-full" />
                                                <div className="w-full h-12 bg-white/5 rounded-3xl mt-4" />
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    variants={containerVariants}
                                    initial={false}
                                    animate="show"
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                                >
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {filteredSins.map((sin) => (
                                                <SinCard 
                                                    key={sin.id} 
                                                    sin={sin} 
                                                    isFocused={focusedSins.includes(sin.id)} 
                                                    toggleFocus={toggleFocus} 
                                                    isReadingMode={isReadingMode}
                                                    fontSize={fontSize}
                                                />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                            
                            {/* Empty State */}
                            {!isLoading && filteredSins.length === 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-32 gap-6">
                                    <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10">
                                        <Search className="w-16 h-16 text-white/10" />
                                    </div>
                                    <p className="text-white/30 font-black text-2xl">لا يوجد داء بهذا الوصف في موسوعتنا حالياً</p>
                                    <button onClick={() => { setSearch(''); setActiveFilter('الكل'); }} className="text-red-500/50 hover:text-red-500 font-bold underline underline-offset-8">
                                        العودة للموسوعة الكاملة
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 💬 Floating Action Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-8 left-8 z-50 bg-red-600 text-white rounded-full p-3 md:p-4 shadow-[0_0_40px_-5px_rgba(239,68,68,0.5)] flex items-center gap-3 border border-red-400/30 group transition-all"
            >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <TriangleAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-bold text-lg hidden sm:block pr-2 pl-2">إبلاغ عن مهلكة</span>
            </motion.button>
        </div>
    );
}
