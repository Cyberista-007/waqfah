"use client";

import { useCollection, useUser, useDoc } from '@/firebase';
import type { UserProfile, GamificationBadge, UserBadge } from '@/lib/types';
import { useBadgeManager } from '@/hooks/useBadgeManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Award, Lock, CheckCircle2, Headphones, BookOpen, Film, Gem, Star, Loader2, ArrowRight, Search, Share2, Copy, X, ArrowUpRight } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { iconMap } from '@/lib/icon-map';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

export default function BadgesPage() {
    const { user } = useUser();
    useBadgeManager();

    const userDocPath = user ? `users/${user.uid}` : null;
    const userBadgesPath = user ? `users/${user.uid}/user_badges` : null;

    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocPath);
    const { data: allBadges, isLoading: badgesLoading } = useCollection<GamificationBadge>('gamification_badges', { orderBy: ['points', 'asc'] });
    const { data: earnedBadges, isLoading: earnedBadgesLoading } = useCollection<UserBadge>(userBadgesPath);

    const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBadge, setSelectedBadge] = useState<GamificationBadge | null>(null);
    const [copied, setCopied] = useState(false);

    const isLoading = profileLoading || badgesLoading || (user && earnedBadgesLoading);
    const earnedBadgeIds = useMemo(() => new Set(earnedBadges?.map(b => b.id) || []), [earnedBadges]);

    const stats = useMemo(() => {
        if (!allBadges) return { total: 0, earned: 0, percentage: 0 };
        const total = allBadges.length;
        const earned = allBadges.filter(b => earnedBadgeIds.has(b.id)).length;
        const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
        return { total, earned, percentage };
    }, [allBadges, earnedBadgeIds]);

    // Dynamic gamification title based on progress percentage
    const collectorRank = useMemo(() => {
        const pct = stats.percentage;
        if (pct === 0) return { title: "مستكشف مبتدئ", color: "text-zinc-500", bg: "bg-zinc-500/10 border-zinc-500/20" };
        if (pct <= 30) return { title: "سالك طريق العلم", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" };
        if (pct <= 60) return { title: "جامع الفضائل", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
        if (pct <= 99) return { title: "صاحب الهمة العالية", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" };
        return { title: "فارس وقفة الذهبي", color: "text-amber-400 animate-pulse", bg: "bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]" };
    }, [stats.percentage]);

    // Trigger celebration confetti on mount if user has any earned badges
    useEffect(() => {
        if (!isLoading && stats.earned > 0) {
            const timer = setTimeout(() => {
                confetti({
                    particleCount: 50,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#f59e0b', '#10b981', '#6366f1']
                });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, stats.earned]);

    const filteredBadges = useMemo(() => {
        if (!allBadges) return [];
        return allBadges.filter(badge => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const matchesFilter = 
                filter === 'all' ? true :
                filter === 'earned' ? isEarned : !isEarned;
            
            const matchesSearch = 
                badge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                badge.description.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [allBadges, filter, searchTerm, earnedBadgeIds]);

    const handleBadgeClick = (badge: GamificationBadge, earned: boolean) => {
        setSelectedBadge(badge);
        if (earned) {
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']
            });
        }
    };

    const getMetricLabel = (metric: string) => {
        switch (metric) {
            case 'minutesListened': return 'دقائق استماع';
            case 'lecturesCompleted': return 'محاضرات مكتملة';
            case 'seriesCompleted': return 'سلاسل منجزة';
            case 'totalDonated': return 'جنيه تبرعات';
            case 'points': return 'نقاط مكتسبة';
            default: return 'عمليات';
        }
    };

    const handleCopyLink = (badge: GamificationBadge) => {
        const text = `الحمد لله! حصلت على وسام "${badge.title}" (+${badge.points} نقطة) من منصة وقفة لطلب العلم والعمل الصالح! 🎓✨`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnTwitter = (badge: GamificationBadge) => {
        const text = encodeURIComponent(`الحمد لله! حصلت على وسام "${badge.title}" من منصة وقفة لطلب العلم! 🎓✨ @waqfah_platform`);
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, '_blank');
    };

    const shareOnWhatsApp = (badge: GamificationBadge) => {
        const text = encodeURIComponent(`الحمد لله! حصلت على وسام "${badge.title}" من منصة وقفة لطلب العلم! 🎓✨`);
        const url = `https://api.whatsapp.com/send?text=${text}`;
        window.open(url, '_blank');
    };

    if (isLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-transparent space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-white/20 font-black uppercase tracking-widest text-xs">جاري تحميل الأوسمة والإنجازات...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 overflow-hidden bg-transparent text-right" dir="rtl">
            <div className="container relative z-10 px-4 max-w-6xl mx-auto">
                {/* 🏛️ Header Section */}
                <header className="pt-20 pb-12 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5">
                    <div className="space-y-4 text-center md:text-right">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-xs font-black text-white/40 hover:text-primary transition-colors mb-2 group"
                        >
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> العودة للرئيسية
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-white">
                            أوسمة <span className="text-primary italic">وقفة</span>
                        </h1>
                        <p className="text-lg text-white/40 font-medium max-w-xl">
                            سجل شرف مخصص لرحلتك المعرفية والدعوية. تدرّج في طلب العلم وحصّل الإنجازات لتزيين ملفك.
                        </p>
                    </div>

                    {/* 👤 User Progress Summary */}
                    {user ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full md:w-80 p-6 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-3xl border border-white/5 shadow-2xl space-y-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl border border-white/10 p-0.5 overflow-hidden">
                                    <Avatar className="w-full h-full rounded-xl">
                                        <AvatarImage src={userProfile?.photoURL || ''} alt={userProfile?.name} />
                                        <AvatarFallback className="bg-zinc-800 text-white/40 font-bold text-lg">
                                            {getInitials(userProfile?.name || '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="space-y-0.5 flex-1">
                                    <h3 className="font-black text-white text-lg line-clamp-1">{userProfile?.name}</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">{userProfile?.points || 0} نقطة</span>
                                        <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", collectorRank.color, collectorRank.bg)}>
                                            {collectorRank.title}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2 pt-2 border-t border-white/5">
                                <div className="flex justify-between text-xs font-black text-white/40">
                                    <span>الأوسمة المكتسبة</span>
                                    <span>{stats.earned} من {stats.total}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-primary" 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${stats.percentage}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-500 font-bold text-center">أكملت {stats.percentage}% من إنجازات المنصة</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="w-full md:w-80 p-8 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-3xl border border-white/5 text-center space-y-4 shadow-2xl">
                            <Award className="w-12 h-12 text-zinc-700 mx-auto animate-pulse" />
                            <h3 className="text-lg font-black text-white">سجّل دخولك لمتابعة إنجازاتك</h3>
                            <Link href="/auth/login" className="block w-full h-12 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all">
                                تسجيل الدخول
                            </Link>
                        </div>
                    )}
                </header>

                {/* 🎛️ Search & Filter Controls */}
                <div className="mt-12 flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="ابحث عن وسام معين..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-12 pl-6 h-14 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-white text-sm"
                        />
                    </div>

                    <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl w-full md:w-auto overflow-x-auto">
                        {[
                            { id: 'all', label: 'الكل' },
                            { id: 'earned', label: 'المكتسبة' },
                            { id: 'locked', label: 'قيد الإنجاز' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id as any)}
                                className={cn(
                                    "relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none text-center",
                                    filter === tab.id
                                        ? "bg-white text-zinc-950 font-black"
                                        : "text-zinc-400 hover:text-white"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 🏆 Badges Grid */}
                <main className="mt-12">
                    <AnimatePresence mode="popLayout">
                        {filteredBadges.length > 0 ? (
                            <motion.div 
                                layout
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                            >
                                {filteredBadges.map((badge) => {
                                    const isEarned = earnedBadgeIds.has(badge.id);
                                    const IconComponent = iconMap[badge.icon] || Trophy;
                                    
                                    // Progress calculations
                                    const userValue = userProfile ? ((userProfile as any)[badge.metric] || 0) : 0;
                                    const rawProgress = badge.threshold > 0 ? (userValue / badge.threshold) * 100 : 0;
                                    const progress = Math.min(100, Math.max(0, rawProgress));

                                    return (
                                        <motion.div
                                            key={badge.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -6, scale: 1.02 }}
                                            onClick={() => handleBadgeClick(badge, isEarned)}
                                            className={cn(
                                                "group p-6 rounded-[2.2rem] border transition-all duration-500 flex flex-col relative overflow-hidden select-none cursor-pointer",
                                                isEarned 
                                                    ? "border-amber-500/20 bg-amber-500/[0.03] shadow-[0_20px_50px_rgba(245,158,11,0.05)]"
                                                    : "border-white/5 bg-white/[0.01] hover:border-white/15"
                                            )}
                                        >
                                            {/* Glowing light behind badge */}
                                            {isEarned && (
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all duration-500" />
                                            )}

                                            {/* Icon Header */}
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={cn(
                                                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-700 group-hover:rotate-6",
                                                    isEarned 
                                                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950" 
                                                        : "bg-zinc-900 text-zinc-600 border border-white/5"
                                                )}>
                                                    <IconComponent className="w-8 h-8" />
                                                </div>
                                                
                                                {isEarned ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> مكتسب
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 bg-white/5 px-3 py-1 rounded-full">
                                                        <Lock className="w-3.5 h-3.5" /> مقفل
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors mb-2">
                                                {badge.title}
                                            </h3>
                                            
                                            <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-6 flex-1 line-clamp-2">
                                                {badge.description}
                                            </p>

                                            {/* Footer with points & progress */}
                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="flex justify-between items-center text-xs font-black">
                                                    <span className="text-zinc-500">الجائزة</span>
                                                    <span className="text-amber-400 font-black">+{badge.points} نقطة</span>
                                                </div>

                                                {/* Progress bar for locked badges */}
                                                {!isEarned && userProfile && (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                                                            <span>التقدم</span>
                                                            <span>{Math.round(userValue)} / {badge.threshold} {getMetricLabel(badge.metric)}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-zinc-700" 
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-24 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] space-y-6"
                            >
                                <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                    <Trophy className="w-10 h-10 text-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black text-white/40">لا توجد أوسمة تطابق فلتر البحث</p>
                                    <p className="text-zinc-500 font-medium text-sm">حاول تغيير خيارات البحث أو الفلترة أعلاه.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* 🔮 Interactive Details Modal */}
            <AnimatePresence>
                {selectedBadge && (() => {
                    const isEarned = earnedBadgeIds.has(selectedBadge.id);
                    const IconComponent = iconMap[selectedBadge.icon] || Trophy;
                    const userValue = userProfile ? ((userProfile as any)[selectedBadge.metric] || 0) : 0;
                    const progress = selectedBadge.threshold > 0 ? Math.min(100, (userValue / selectedBadge.threshold) * 100) : 0;

                    return (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative w-full max-w-lg p-8 rounded-[3rem] bg-zinc-950/90 border border-white/10 shadow-2xl space-y-6 overflow-hidden text-right"
                            >
                                {/* Decorative ambient background */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
                                
                                <button 
                                    onClick={() => setSelectedBadge(null)}
                                    className="absolute left-6 top-6 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex flex-col items-center text-center space-y-4 pt-4">
                                    <motion.div 
                                        animate={isEarned ? { 
                                            rotate: [0, 5, -5, 0],
                                            scale: [1, 1.05, 1] 
                                        } : {}}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        onClick={() => isEarned && handleBadgeClick(selectedBadge, true)}
                                        className={cn(
                                            "w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl cursor-pointer transition-transform hover:scale-105",
                                            isEarned 
                                                ? "bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-amber-500/20" 
                                                : "bg-zinc-900 text-zinc-600 border border-white/5"
                                        )}
                                    >
                                        <IconComponent className="w-12 h-12" />
                                    </motion.div>

                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black text-white flex items-center justify-center gap-2">
                                            {selectedBadge.title}
                                            {isEarned && <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />}
                                        </h2>
                                        <p className="text-sm font-black text-amber-500">+{selectedBadge.points} نقطة مكافأة</p>
                                    </div>

                                    <p className="text-zinc-300 font-medium leading-relaxed max-w-sm pt-2">
                                        {selectedBadge.description}
                                    </p>
                                </div>

                                {/* Progress details */}
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                    <div className="flex justify-between items-center text-xs font-black">
                                        <span className="text-zinc-400">حالة الإنجاز</span>
                                        <span className={cn(isEarned ? "text-emerald-400" : "text-zinc-500")}>
                                            {isEarned ? "مكتمل وحصلت على النقاط" : "قيد العمل والتطوير"}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-zinc-400">
                                            <span>معدل التقدم الحالي</span>
                                            <span>{Math.round(userValue)} / {selectedBadge.threshold} {getMetricLabel(selectedBadge.metric)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={cn("h-full transition-all duration-1000", isEarned ? "bg-amber-500" : "bg-zinc-600")}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {isEarned ? (
                                    <div className="space-y-3 pt-2">
                                        <p className="text-center text-xs font-black text-zinc-500 uppercase tracking-widest">شارك هذا الإنجاز مع أصدقائك</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button 
                                                onClick={() => shareOnTwitter(selectedBadge)}
                                                className="h-12 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/25 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                                            >
                                                تويتر <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => shareOnWhatsApp(selectedBadge)}
                                                className="h-12 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/25 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                                            >
                                                واتساب <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleCopyLink(selectedBadge)}
                                                className={cn(
                                                    "h-12 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2",
                                                    copied 
                                                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                                                        : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10"
                                                )}
                                            >
                                                {copied ? "تم النسخ!" : "نسخ النص"}
                                                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-2 text-center">
                                        <Link 
                                            href="/lectures"
                                            onClick={() => setSelectedBadge(null)}
                                            className="inline-flex h-12 px-8 rounded-xl bg-primary text-white font-black text-sm items-center justify-center hover:scale-[1.02] active:scale-95 transition-all gap-2"
                                        >
                                            ابدأ بالتعلم وتحصيل نقاط الوسام
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
}
