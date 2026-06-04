"use client";

import { useCollection, useUser, useDoc } from '@/firebase';
import type { UserProfile, GamificationBadge, UserBadge } from '@/lib/types';
import { useBadgeManager } from '@/hooks/useBadgeManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Award, Lock, CheckCircle2, Headphones, BookOpen, Film, Gem, Star, Loader2, ArrowRight, Search, Share2, Copy, X, ArrowUpRight, Compass, Heart, Home, Calendar, Clock } from 'lucide-react';
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

    // Time-sensitive customized Arabic greeting
    const timeGreeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return {
                text: "صباح الخير والبركة والنشاط العلمي",
                subtext: "يوم جديد مشرق، نسأل الله أن يرزقك علماً نافعاً وعملاً متقبلاً ☀️"
            };
        } else if (hour >= 12 && hour < 17) {
            return {
                text: "طاب يومك بالخير والمسرات والبركات",
                subtext: "سعداء بمتابعتك المستمرة، هل خصصت وقتاً لمجلس علم اليوم؟ ⛅️"
            };
        } else {
            return {
                text: "مساء السكينة والوقار والهدوء الإيماني",
                subtext: "بعد عناء يومك، خذ نفساً عميقاً في بيتك المعرفي وتزود من العلم النافع 🌙"
            };
        }
    }, []);

    // Daily Islamic spiritual reminders
    const dailySpiritualReminder = useMemo(() => {
        const reminders = [
            { text: "«مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ»", source: "حديث شريف" },
            { text: "«يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ»", source: "سورة المجادلة: ١١" },
            { text: "«وَقُل رَّبِّ زِدْنِي عِلْمًا»", source: "سورة طه: ١١٤" },
            { text: "«إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ»", source: "سورة فاطر: ٢٨" },
            { text: "«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»", source: "حديث شريف" }
        ];
        const day = new Date().getDate();
        return reminders[day % reminders.length];
    }, []);

    // Calculate days since user registered
    const daysWithWaqfah = useMemo(() => {
        if (!userProfile?.createdAt) return 1;
        const createdAt = userProfile.createdAt as any;
        const regDate = createdAt && typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
        const diffTime = Math.abs(Date.now() - regDate.getTime());
        return Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    }, [userProfile?.createdAt]);

    // Format metrics values
    const formatMinutesValue = (mins: number) => {
        if (!mins) return "0 دقيقة";
        if (mins < 60) return `${mins} دقيقة`;
        const hrs = Math.floor(mins / 60);
        const rem = mins % 60;
        return rem > 0 ? `${hrs} ساعة و ${rem} دقيقة` : `${hrs} ساعة`;
    };

    // Confetti celebration on mount if badges earned
    useEffect(() => {
        if (!isLoading && stats.earned > 0) {
            const timer = setTimeout(() => {
                confetti({
                    particleCount: 55,
                    spread: 75,
                    origin: { y: 0.6 },
                    colors: ['#f59e0b', '#10b981', '#6366f1']
                });
            }, 600);
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
        <div className="min-h-screen pb-32 overflow-hidden bg-transparent text-right font-sans" dir="rtl">
            <div className="container relative z-10 px-4 max-w-6xl mx-auto">
                
                {/* 🏡 Warm Welcome Home Section (بيت وقفة المعرفي) */}
                <section className="pt-16 pb-8">
                    {user && userProfile ? (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative overflow-hidden rounded-[3rem] p-8 md:p-10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
                        >
                            {/* Ambient Light */}
                            <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                {/* Profile & Custom Time Greeting */}
                                <div className="lg:col-span-5 space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-primary/25 rounded-3xl blur-md group-hover:blur-lg transition-all" />
                                            <div className="relative w-18 h-18 rounded-3xl border-2 border-white/20 p-1 bg-zinc-950 overflow-hidden">
                                                <Avatar className="w-full h-full rounded-2xl">
                                                    <AvatarImage src={userProfile.photoURL || ''} alt={userProfile.name} />
                                                    <AvatarFallback className="bg-zinc-800 text-white/50 font-bold text-xl">
                                                        {getInitials(userProfile.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Home className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-black text-primary uppercase tracking-widest">بيتك المعرفي</span>
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                                                مرحباً بك، {userProfile.name}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-base text-zinc-300 font-bold">{timeGreeting.text} 🌾</p>
                                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">{timeGreeting.subtext}</p>
                                    </div>

                                    {/* Member Badge & Counter */}
                                    <div className="flex items-center gap-3 flex-wrap pt-2">
                                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-zinc-300 text-xs font-bold shadow-md">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            فرد من وقفة منذ <strong className="text-white font-black">{daysWithWaqfah} يوماً</strong>
                                        </span>
                                        <span className={cn("inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border text-xs font-black shadow-md", collectorRank.color, collectorRank.bg)}>
                                            <Trophy className="w-3.5 h-3.5" />
                                            رتبة: {collectorRank.title}
                                        </span>
                                    </div>
                                </div>

                                {/* Cozy Progress Shelf */}
                                <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner space-y-2 hover:bg-white/[0.04] transition-colors group">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-zinc-400">زمن الاستماع</span>
                                            <Headphones className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <p className="text-sm font-black text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                            {formatMinutesValue(userProfile.minutesListened || 0)}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner space-y-2 hover:bg-white/[0.04] transition-colors group">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-zinc-400">محاضرات مكتملة</span>
                                            <BookOpen className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <p className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                                            {userProfile.lecturesCompleted || 0} محاضرة
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner space-y-2 hover:bg-white/[0.04] transition-colors group">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-zinc-400">السلاسل المنجزة</span>
                                            <Film className="w-4 h-4 text-violet-500" />
                                        </div>
                                        <p className="text-lg font-black text-white group-hover:text-violet-400 transition-colors">
                                            {userProfile.seriesCompleted || 0} سلسلة
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner space-y-2 hover:bg-white/[0.04] transition-colors group">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-zinc-400">النقاط والتقدير</span>
                                            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        </div>
                                        <p className="text-lg font-black text-amber-400">
                                            {userProfile.points || 0} نقطة
                                        </p>
                                    </div>
                                </div>

                                {/* Spiritual Reminder Box */}
                                <div className="lg:col-span-3 p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 translate-x-[-15%] translate-y-[-15%] opacity-5 text-white">
                                        <BookOpen className="w-24 h-24" />
                                    </div>
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1.5">
                                        <Heart className="w-3 h-3 fill-current" /> تذكرة مجالس العلم
                                    </h4>
                                    <p className="text-xs text-zinc-300 font-bold leading-relaxed italic">
                                        {dailySpiritualReminder.text}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 font-bold text-left">— {dailySpiritualReminder.source}</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 text-center max-w-xl mx-auto space-y-6">
                            <Home className="w-16 h-16 text-zinc-700 mx-auto" />
                            <h2 className="text-2xl font-black text-white">سجّل دخولك لفتح بيتك المعرفي</h2>
                            <p className="text-zinc-400 text-sm">بمجرد تسجيل حسابك، ستتمكن من قياس وتتبع ساعات الاستماع وإكمال المناهج وحصد الأوسمة العلمية وتطوير رتبتك.</p>
                            <Link href="/auth/login" className="inline-flex h-12 px-10 rounded-xl bg-primary text-white font-black text-sm items-center justify-center hover:scale-[1.02] active:scale-95 transition-all">
                                تسجيل الدخول الآن
                            </Link>
                        </div>
                    )}
                </section>

                {/* 🏛️ Title Header */}
                <div className="pt-10 pb-8 flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black text-white font-headline">
                            أوسمة وإنجازات المنصة
                        </h1>
                        <p className="text-zinc-500 text-xs font-bold">
                            تصفح الأوسمة المتاحة في قاعدة البيانات وتعرف على شروط تحصيلها
                        </p>
                    </div>
                    {user && (
                        <div className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                            <span>الإنجاز الإجمالي:</span>
                            <strong className="text-white font-black bg-white/5 border border-white/5 px-3 py-1 rounded-xl">
                                {stats.earned} وسام مكتمل ({stats.percentage}%)
                            </strong>
                        </div>
                    )}
                </div>

                {/* 🎛️ Search & Filter Controls */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
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
