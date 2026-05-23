'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { DestructiveSin, MuhlikatProgressItem } from '@/lib/types';
import { 
    Loader2, AlertTriangle, EyeOff, Angry, MessageSquareX, X, Info, 
    CalendarDays, BookOpen, ScrollText, Video, TriangleAlert, ArrowLeft, 
    Search, Filter, Sparkles, Target, Zap, MousePointer2, Stethoscope, 
    ShieldPlus, ActivitySquare, Network, ArrowRight, CheckCircle2, Send, Check
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';
import { useSync } from '@/hooks/useSync';
import { DeedsScale } from '@/components/muhlikat/deeds-scale';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
    progress,
    toggleFocus,
    updateProgress,
    rewardPoints,
    isReadingMode,
    fontSize,
    allSins,
    activeSinId,
    setActiveSinId
}: {
    sin: DestructiveSin;
    progress: MuhlikatProgressItem | null;
    toggleFocus: (id: string, e: React.MouseEvent) => void;
    updateProgress: (id: string, progress: Partial<MuhlikatProgressItem>) => void;
    rewardPoints: (amount: number) => void;
    isReadingMode?: boolean;
    fontSize?: number;
    allSins: DestructiveSin[];
    activeSinId: string | null;
    setActiveSinId: (id: string | null) => void;
}) => {
    const theme = getSinTheme(sin.title);
    const [activeTab, setActiveTab] = useState<'info' | 'cure' | 'test'>('info');
    const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const isFocused = !!progress;
    const isCompleted = progress?.status === 'completed';
    const checkedSteps = progress?.checkedSteps || [];
    const savedScore = progress?.score;
    const lastTestedAt = progress?.lastTestedAt;

    const [showQuiz, setShowQuiz] = useState(false);
    const isTestComplete = savedScore !== undefined && !showQuiz;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
    const isAllAnswered = Object.keys(testAnswers).length === testQuestions.length;

    const handleQuizComplete = () => {
        const calculatedScore = Object.values(testAnswers).reduce((a, b) => a + b, 0);
        updateProgress(sin.id, {
            status: isCompleted ? 'completed' : 'focused',
            score: calculatedScore,
            lastTestedAt: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
        });
        setShowQuiz(false);
    };

    const handleReevaluate = () => {
        setTestAnswers({});
        setShowQuiz(true);
    };

    const { toast } = useToast();

    const handleToggleStep = (stepIdx: number) => {
        if (!isFocused) return;
        
        let newChecked = [...checkedSteps];
        if (newChecked.includes(stepIdx)) {
            newChecked = newChecked.filter(i => i !== stepIdx);
        } else {
            newChecked.push(stepIdx);
        }
        
        const isAllChecked = newChecked.length === cureSteps.length;
        const willBeCompleted = isAllChecked;
        
        let shouldAwardPoints = false;
        if (willBeCompleted && !progress?.pointsAwarded) {
            shouldAwardPoints = true;
        }

        updateProgress(sin.id, {
            status: willBeCompleted ? 'completed' : 'focused',
            checkedSteps: newChecked,
            pointsAwarded: progress?.pointsAwarded || shouldAwardPoints
        });

        if (shouldAwardPoints) {
            rewardPoints(50);
            toast({
                title: "🎉 تزكية متميزة!",
                description: `لقد أتممت خطة علاج "${sin.title}" بالكامل وحصلت على +50 نقطة تزكية.`,
                variant: "default",
            });
        }
    };

    const cureProgressPercent = cureSteps.length > 0 ? (checkedSteps.length / cureSteps.length) * 100 : 0;

    const relatedSins = useMemo(() => {
        if (sin.relatedSinIds && sin.relatedSinIds.length > 0) {
            return allSins.filter(s => sin.relatedSinIds?.includes(s.id));
        }
        return allSins
            .filter(s => s.id !== sin.id && getSinTheme(s.title).category === theme.category)
            .slice(0, 3);
    }, [sin, allSins, theme.category]);

    return (
        <Dialog open={activeSinId === sin.id} onOpenChange={(open) => setActiveSinId(open ? sin.id : null)}>
            <div onClick={() => setActiveSinId(sin.id)} className="w-full">
                <motion.div
                    variants={itemVariants}
                    animate={calculateTilt()}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }); }}
                    onMouseMove={handleMouseMove}
                    whileTap={{ scale: 0.98 }}
                    style={{ transformStyle: "preserve-3d" }}
                    role="button"
                    tabIndex={0}
                    className={cn(
                        "group relative h-[420px] rounded-[3.5rem] overflow-hidden border transition-all duration-300 w-full text-right flex flex-col cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500",
                        "bg-[#09090b] border-white/5",
                        "hover:border-white/20 hover:bg-zinc-900/40",
                        isFocused ? "ring-1 ring-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : theme.shadow
                    )}
                >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                    <div className="absolute top-8 inset-x-8 z-20 flex justify-between items-center" style={{ transform: "translateZ(30px)" }}>
                        <div className="flex gap-2">
                            <div className={cn(
                                "px-4 py-1.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md",
                                theme.color, theme.border
                            )}>
                                {theme.level}
                            </div>
                            {savedScore !== undefined && (
                                <div className={cn(
                                    "px-4 py-1.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md",
                                    savedScore > 5 ? "text-red-400 border-red-500/20" :
                                    savedScore > 2 ? "text-amber-400 border-amber-500/20" :
                                    "text-emerald-400 border-emerald-500/20"
                                )}>
                                    {savedScore > 5 ? "حرج" : savedScore > 2 ? "تحذير" : "سليم"}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFocus(sin.id, e);
                            }}
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
                        <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.3em] mb-4">
                            {theme.category}
                        </p>

                        {isFocused ? (
                            <div className="w-full space-y-2 mt-2">
                                <div className="flex justify-between items-center text-[10px] text-white/40 px-1 font-bold">
                                    <span>خطة العلاج</span>
                                    <span>{checkedSteps.length} / {cureSteps.length}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-500", isCompleted ? "bg-emerald-500" : "bg-red-500")}
                                        style={{ width: `${(checkedSteps.length / cureSteps.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full py-4 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-center gap-3 group-hover:border-white/10 group-hover:bg-white/[0.05] transition-all mt-4">
                                <Stethoscope className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span className="text-[9px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.3em]">العيادة القلبية</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

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
                        <div className={cn("px-8 pb-8 pt-6", isReadingMode && "w-full mx-auto py-20")}>
                            
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
                                                        <p className={cn("font-quran text-xl text-amber-50/90 leading-loose text-center flex-1 transition-all", isReadingMode && "reading-text")} style={isReadingMode ? { fontSize: `${fontSize && fontSize + 6}px` } : {}}>
                                                            {sin.quranVerses[0]}
                                                        </p>
                                                    </div>
                                                )}
                                                {sin.hadiths?.[0] && (
                                                    <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/15 p-6 flex flex-col gap-3">
                                                        <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.4em]">
                                                            <ScrollText className="w-3.5 h-3.5" /> حديث شريف
                                                        </div>
                                                        <p className={cn("font-quran text-xl text-emerald-50/90 leading-loose text-center flex-1 transition-all", isReadingMode && "reading-text")} style={isReadingMode ? { fontSize: `${fontSize && fontSize + 6}px` } : {}}>
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
                                                {relatedSins.map(rel => (
                                                    <span 
                                                        key={rel.id} 
                                                        onClick={() => setActiveSinId(rel.id)}
                                                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold hover:bg-white/10 hover:text-white cursor-pointer transition-all flex items-center gap-2"
                                                    >
                                                        <span>{rel.title}</span>
                                                        <ArrowLeft className="w-3 h-3" />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'cure' && (
                                    <motion.div key="cure" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                        <div className={cn("p-6 rounded-2xl border flex flex-col gap-4", theme.bg, theme.border)}>
                                            <div>
                                                <h3 className={cn("text-lg font-black mb-2", theme.color)}>البروتوكول العلاجي</h3>
                                                <p className="text-white/60 text-sm leading-relaxed">تطبيق هذه الخطوات بصدق وإخلاص مع الدعاء المستمر كفيل بإذن الله بتطهير القلب من هذا الداء.</p>
                                            </div>
                                            {isFocused && (
                                                <div className="space-y-2 pt-2 border-t border-white/5">
                                                    <div className="flex justify-between items-center text-xs text-white/40">
                                                        <span>نسبة الشفاء المنجزة</span>
                                                        <span className="font-bold text-white">{Math.round(cureProgressPercent)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${cureProgressPercent}%` }}
                                                            transition={{ duration: 0.5 }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {!isFocused && (
                                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold flex items-center gap-3">
                                                <Target className="w-5 h-5 flex-shrink-0 animate-pulse" />
                                                <span>قم بتفعيل متابعة هذا الداء (بالضغط على زر المجهر 🎯 في الكرت الرئيسي) للبدء في خطة العلاج وتدوين تقدمك.</span>
                                            </div>
                                        )}
                                        
                                        <div className="space-y-4 relative before:absolute before:inset-y-0 before:right-4 before:w-px before:bg-white/10">
                                            {cureSteps.map((step, idx) => {
                                                const isStepChecked = checkedSteps.includes(idx);
                                                return (
                                                    <div key={idx} className="relative pr-12 group/step">
                                                        <button
                                                            onClick={() => handleToggleStep(idx)}
                                                            disabled={!isFocused}
                                                            className={cn(
                                                                "absolute right-1 top-4 w-6 h-6 rounded-lg border flex items-center justify-center transition-all z-10",
                                                                isStepChecked
                                                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                                                    : isFocused 
                                                                        ? "bg-white/5 border-white/20 text-transparent hover:border-white/40 hover:bg-white/10"
                                                                        : "bg-white/5 border-white/10 text-transparent cursor-not-allowed"
                                                            )}
                                                        >
                                                            <Check className="w-4 h-4 text-black font-black" strokeWidth={4} />
                                                        </button>
                                                        <div 
                                                            onClick={() => isFocused && handleToggleStep(idx)}
                                                            className={cn(
                                                                "p-5 rounded-2xl border transition-colors",
                                                                isStepChecked 
                                                                    ? "bg-emerald-950/10 border-emerald-500/20 text-white/90" 
                                                                    : "bg-white/[0.02] border-white/5 hover:border-white/10 text-white/60",
                                                                isFocused && "cursor-pointer"
                                                            )}
                                                        >
                                                            <p className="text-white/80 font-medium leading-relaxed">{step}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {isCompleted && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 15 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-center space-y-3"
                                            >
                                                <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                                                <h4 className="text-lg font-black text-emerald-400">تهانينا! لقد أتممت خطة العلاج بنجاح</h4>
                                                <p className="text-white/60 text-sm">
                                                    تم منحك <span className="text-emerald-400 font-bold">+50 نقطة تزكية</span> تقديراً لمجاهدتك وتزكيتك لنفسك.
                                                </p>
                                            </motion.div>
                                        )}
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

                                                {isAllAnswered && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                                                        <Button onClick={handleQuizComplete} className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black rounded-xl text-lg shadow-xl">
                                                            حفظ وحساب مستوى الخطورة
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 px-6">
                                                <div className={cn("w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 border-4", savedScore > 5 ? "bg-red-500/20 border-red-500/50 text-red-500" : savedScore > 2 ? "bg-amber-500/20 border-amber-500/50 text-amber-500" : "bg-emerald-500/20 border-emerald-500/50 text-emerald-500")}>
                                                    <span className="text-4xl font-black">{savedScore}</span>
                                                </div>
                                                <h3 className="text-3xl font-black text-white mb-2">
                                                    {savedScore > 5 ? "مستوى حرج جداً" : savedScore > 2 ? "مستوى تحذيري" : "قلب سليم بفضل الله"}
                                                </h3>
                                                <p className="text-white/50 text-lg leading-relaxed mb-4">
                                                    {savedScore > 5 ? "هذه المهلكة متأصلة بشكل كبير، وعليك التوجه فوراً لخطة العلاج وتطبيقها بصرامة." : savedScore > 2 ? "أنت على حافة الخطر، سارع بتدارك نفسك قبل أن يتفاقم الداء." : "الحمد لله، استمر في مراقبة نفسك لتظل في أمان."}
                                                </p>
                                                {lastTestedAt && (
                                                    <p className="text-white/30 text-xs flex items-center justify-center gap-1.5 mb-8 font-bold">
                                                        <CalendarDays className="w-3.5 h-3.5" /> تم التقييم في: {lastTestedAt}
                                                    </p>
                                                )}
                                                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                                    <Button onClick={() => setActiveTab('cure')} className="h-14 px-8 rounded-xl font-black text-lg bg-white text-black hover:bg-zinc-200 w-full sm:w-auto">
                                                        {isCompleted ? "عرض خطوات الشفاء" : "بدء خطة العلاج فوراً"} <ArrowRight className="w-5 h-5 mr-2" />
                                                    </Button>
                                                    <Button variant="ghost" onClick={handleReevaluate} className="text-white/40 hover:text-white mt-2 sm:mt-0 font-bold">إعادة التقييم الذاتي</Button>
                                                </div>
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
    const { state: userState, updateState: syncUpdate } = useSync();
    const { data: sins, isLoading } = useCollection<DestructiveSin>('destructive_sins');
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('الكل');
    const [isClient, setIsClient] = useState(false);
    const [activeSinId, setActiveSinId] = useState<string | null>(null);

    // Suggest a Sin states
    const [isSuggestOpen, setIsSuggestOpen] = useState(false);
    const [suggestTitle, setSuggestTitle] = useState('');
    const [suggestCategory, setSuggestCategory] = useState('غلاظ');
    const [suggestDescription, setSuggestDescription] = useState('');
    const [suggestConcept, setSuggestConcept] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    const db = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const focusedSins = userState.muhlikatProgress ? Object.keys(userState.muhlikatProgress) : [];

    const toggleFocus = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const currentProgress = userState.muhlikatProgress || {};
        const isFocused = !!currentProgress[id];
        
        const nextProgress = { ...currentProgress };
        if (isFocused) {
            delete nextProgress[id];
        } else {
            nextProgress[id] = {
                status: 'focused',
                checkedSteps: []
            };
        }

        syncUpdate({ muhlikatProgress: nextProgress });
    };

    const updateProgress = (id: string, progressUpdates: Partial<MuhlikatProgressItem>) => {
        const currentProgress = userState.muhlikatProgress || {};
        const existingItem = currentProgress[id];
        
        let updatedItem: MuhlikatProgressItem;
        if (typeof existingItem === 'number') {
            updatedItem = {
                status: existingItem === 1 ? 'focused' : 'completed',
                ...progressUpdates
            };
        } else {
            const parsedItem = existingItem as MuhlikatProgressItem | undefined;
            updatedItem = {
                status: 'focused',
                ...parsedItem,
                ...progressUpdates
            };
        }

        const nextProgress = {
            ...currentProgress,
            [id]: updatedItem
        };

        syncUpdate({ muhlikatProgress: nextProgress });
    };

    const rewardPoints = (amount: number) => {
        syncUpdate({ points: (userState.points || 0) + amount });
    };

    const handleSuggestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!suggestTitle.trim()) return;

        setIsSending(true);
        try {
            await addDoc(collection(db, 'destructive_sin_reports'), {
                title: suggestTitle,
                category: suggestCategory,
                description: suggestDescription,
                concept: suggestConcept,
                userId: user?.uid || 'anonymous',
                createdAt: serverTimestamp(),
            });
            setSendSuccess(true);
            toast({
                title: "شكرًا لمساهمتك",
                description: "تم إرسال اقتراح المهلكة بنجاح للمراجعة والتدقيق.",
                variant: "default",
            });
            setTimeout(() => {
                setSuggestTitle('');
                setSuggestDescription('');
                setSuggestConcept('');
                setSendSuccess(false);
                setIsSuggestOpen(false);
            }, 2000);
        } catch (error: any) {
            toast({
                title: "خطأ في الإرسال",
                description: "تعذر إرسال المقترح حالياً، يرجى المحاولة لاحقاً.",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
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
                <div className="relative group/frame w-full mx-auto rounded-[4rem] p-1 bg-gradient-to-br from-red-500/20 via-white/5 to-transparent shadow-2xl">
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
                                <p className="text-white/30 text-lg md:text-2xl w-full mx-auto leading-relaxed font-tajawal">
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
                        <div className={cn("w-full mx-auto mb-20 hide-in-reading-mode relative z-10")}>
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
                                                    progress={userState.muhlikatProgress?.[sin.id] as MuhlikatProgressItem || null} 
                                                    toggleFocus={toggleFocus}
                                                    updateProgress={updateProgress}
                                                    rewardPoints={rewardPoints}
                                                    isReadingMode={isReadingMode}
                                                    fontSize={fontSize}
                                                    allSins={sins || []}
                                                    activeSinId={activeSinId}
                                                    setActiveSinId={setActiveSinId}
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

            {/* ⚖️ Interactive Deeds Scale */}
            <div className="mt-24">
                <DeedsScale />
            </div>

            {/* 💬 Suggest a Sin Dialog */}
            <Dialog open={isSuggestOpen} onOpenChange={setIsSuggestOpen}>
                <DialogTrigger asChild>
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
                </DialogTrigger>
                <DialogContent className="max-w-md border border-white/10 bg-[#0c0c0f] text-white rounded-3xl p-6" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            <TriangleAlert className="text-red-500 w-6 h-6" /> اقتراح مهلكة جديدة
                        </DialogTitle>
                        <DialogDescription className="text-white/40 text-sm">
                            ساعدنا في توسيع الموسوعة من خلال اقتراح سلوك أو معصية مهلكة للنفس مع تفاصيلها لمراجعتها وإضافتها.
                        </DialogDescription>
                    </DialogHeader>

                    {sendSuccess ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10 gap-3 text-center">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                            <h3 className="text-xl font-bold text-emerald-400">تم إرسال المقترح بنجاح</h3>
                            <p className="text-white/60 text-sm">جزاك الله خيراً، سيقوم المشرفون بمراجعته قريباً.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSuggestSubmit} className="space-y-4 mt-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white/50">اسم المهلكة / الآفة</label>
                                <Input 
                                    required
                                    value={suggestTitle}
                                    onChange={(e) => setSuggestTitle(e.target.value)}
                                    placeholder="مثال: الحسد، الغيبة، الرياء..." 
                                    className="bg-white/5 border-white/10 rounded-xl text-white focus-visible:ring-red-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white/50">تصنيف المهلكة</label>
                                <select 
                                    value={suggestCategory}
                                    onChange={(e) => setSuggestCategory(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 text-sm"
                                >
                                    <option value="غلاظ" className="bg-[#0c0c0f]">غلاظ</option>
                                    <option value="قلبية" className="bg-[#0c0c0f]">قلبية</option>
                                    <option value="باطنة" className="bg-[#0c0c0f]">باطنة</option>
                                    <option value="لسانية" className="bg-[#0c0c0f]">لسانية</option>
                                    <option value="أخرى" className="bg-[#0c0c0f]">أخرى</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white/50">التشخيص / المفهوم العام</label>
                                <textarea 
                                    required
                                    value={suggestConcept}
                                    onChange={(e) => setSuggestConcept(e.target.value)}
                                    placeholder="شرح بسيط لمعنى هذه المهلكة وأثرها على النفس..." 
                                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 text-sm resize-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white/50">أمثلة واقعية وعلاج مقترح (اختياري)</label>
                                <textarea 
                                    value={suggestDescription}
                                    onChange={(e) => setSuggestDescription(e.target.value)}
                                    placeholder="أمثلة من الحياة اليومية أو بعض الخطوات العلاجية الموصى بها..." 
                                    className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 text-sm resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost" className="flex-1 rounded-xl text-white/60 hover:text-white">إلغاء</Button>
                                </DialogClose>
                                <Button 
                                    type="submit" 
                                    disabled={isSending} 
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> إرسال...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" /> إرسال المقترح
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
