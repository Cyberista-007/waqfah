"use client";

import { Trophy, Award, Loader2, Sparkles, Medal, User, Crown, Star, Flame, ChevronLeft } from 'lucide-react';
import { useCollection, useUser } from '@/firebase';
import type { UserProfile, GamificationBadge, UserBadge } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBadgeManager } from '@/hooks/useBadgeManager';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { iconMap } from '@/lib/icon-map';
import { motion, AnimatePresence } from 'framer-motion';

function BadgeItem({ badge, earned }: { badge: GamificationBadge, earned: boolean }) {
    const Icon = iconMap[badge.icon] || Sparkles;

    return (
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div 
                        whileHover={{ y: -5, scale: 1.05 }}
                        className={cn(
                            "group flex flex-col items-center justify-center text-center p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden",
                            earned 
                                ? "border-amber-500/30 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.1)]" 
                                : "border-white/5 bg-white/[0.02] grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                        )}
                    >
                        {earned && (
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        <div className={cn(
                            "flex items-center justify-center h-20 w-20 rounded-2xl mb-4 shadow-2xl transition-all duration-700 group-hover:rotate-12",
                             earned ? "bg-amber-500 text-white" : "bg-zinc-800 text-zinc-500"
                        )}>
                            <Icon className="h-10 w-10" />
                        </div>
                        <h4 className="font-black text-sm text-white">{badge.title}</h4>
                        <div className="mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                             +{badge.points} نقطة
                        </div>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-4 rounded-2xl bg-zinc-900 border-white/10 backdrop-blur-xl">
                    <p className="font-medium leading-relaxed">{badge.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export default function LeaderboardPage() {
    const { user } = useUser();
    useBadgeManager();

    const { data: users, isLoading: usersLoading } = useCollection<UserProfile>('users', { orderBy: ['points', 'desc'], limit: 100 });
    const { data: allBadges, isLoading: allBadgesLoading } = useCollection<GamificationBadge>('gamification_badges', { orderBy: ['points', 'asc'] });
    const userBadgesPath = user ? `users/${user.uid}/user_badges` : null;
    const { data: earnedBadges, isLoading: userBadgesLoading } = useCollection<UserBadge>(userBadgesPath);
    
    const isLoading = usersLoading || allBadgesLoading || (user && userBadgesLoading);
    
    const { top3, restOfUsers } = useMemo(() => {
        if (!users) return { top3: [], restOfUsers: [] };
        return {
            top3: users.slice(0, 3),
            restOfUsers: users.slice(3)
        };
    }, [users]);

    const userRank = useMemo(() => {
        if (!user || !users) return null;
        const rank = users.findIndex(u => u.id === user.uid);
        return rank !== -1 ? rank + 1 : null;
    }, [user, users]);

    const earnedBadgeIds = useMemo(() => new Set(earnedBadges?.map(b => b.id) || []), [earnedBadges]);
    
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#030303]">
                <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
            </div>
        )
    }

    return (
      <div className="min-h-screen pb-32 overflow-x-hidden">
        {/* ── Background Aura ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="container relative z-10 px-4">
            <header className="text-center pt-20 pb-16">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8"
                >
                    <Trophy className="w-4 h-4 fill-current" /> قاعة الخالدين
                </motion.div>
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-white mb-6"
                >
                    لوحة <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-amber-500 to-amber-700 italic">الصدارة</span>
                </motion.h1>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-2xl mx-auto text-xl text-white/40 font-medium leading-relaxed italic"
                >
                    "وفي ذلك فليتنافس المتنافسون".. رحلة التسابق في ميادين العلم والعمل الصالح تبدأ من هنا.
                </motion.p>
            </header>

            {/* ── Podium Section ── */}
            <section className="mb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-end">
                    {/* Second Place */}
                    {top3[1] && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="order-2 md:order-1"
                        >
                            <div className="flex flex-col items-center">
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-full border-4 border-slate-400 p-1 bg-zinc-900 shadow-2xl">
                                        <Avatar className="w-full h-full">
                                            <AvatarImage src={top3[1].photoURL} />
                                            <AvatarFallback className="bg-zinc-800 text-slate-400 font-black">{getInitials(top3[1].name)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-slate-400 flex items-center justify-center text-white font-black shadow-lg">2</div>
                                </div>
                                <div className="w-full h-32 bg-gradient-to-t from-white/5 to-white/[0.02] border border-white/5 rounded-t-[2rem] flex flex-col items-center justify-center p-6 text-center">
                                    <p className="text-xl font-black text-white line-clamp-1">{top3[1].name}</p>
                                    <p className="text-slate-400 font-black text-sm mt-1">{top3[1].points} نقطة</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* First Place */}
                    {top3[0] && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="order-1 md:order-2"
                        >
                            <div className="flex flex-col items-center -mt-8">
                                <div className="relative mb-8">
                                    <motion.div 
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 3 }}
                                        className="absolute -top-16 left-1/2 -translate-x-1/2"
                                    >
                                        <Crown className="w-16 h-16 text-amber-500 fill-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                    </motion.div>
                                    <div className="w-32 h-32 rounded-full border-4 border-amber-500 p-1.5 bg-zinc-900 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                                        <Avatar className="w-full h-full">
                                            <AvatarImage src={top3[0].photoURL} />
                                            <AvatarFallback className="bg-zinc-800 text-amber-500 font-black text-2xl">{getInitials(top3[0].name)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 px-6 py-1 rounded-full text-zinc-950 text-xs font-black uppercase tracking-widest shadow-xl">البطل</div>
                                </div>
                                <div className="w-full h-48 bg-gradient-to-t from-amber-500/10 to-amber-500/[0.02] border border-amber-500/20 rounded-t-[3rem] flex flex-col items-center justify-center p-8 text-center shadow-[0_-20px_50px_rgba(245,158,11,0.05)]">
                                    <p className="text-3xl font-black text-white font-headline leading-tight">{top3[0].name}</p>
                                    <div className="flex items-center gap-2 text-amber-500 font-black text-lg mt-2">
                                        <Sparkles className="w-5 h-5 fill-current" />
                                        {top3[0].points} نقطة
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Third Place */}
                    {top3[2] && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="order-3"
                        >
                            <div className="flex flex-col items-center">
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-full border-4 border-amber-700/50 p-1 bg-zinc-900 shadow-2xl">
                                        <Avatar className="w-full h-full">
                                            <AvatarImage src={top3[2].photoURL} />
                                            <AvatarFallback className="bg-zinc-800 text-amber-700 font-black">{getInitials(top3[2].name)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-amber-700/80 flex items-center justify-center text-white font-black shadow-lg">3</div>
                                </div>
                                <div className="w-full h-24 bg-gradient-to-t from-white/5 to-white/[0.02] border border-white/5 rounded-t-[2rem] flex flex-col items-center justify-center p-6 text-center">
                                    <p className="text-xl font-black text-white line-clamp-1">{top3[2].name}</p>
                                    <p className="text-amber-700 font-black text-sm mt-1">{top3[2].points} نقطة</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            <Tabs defaultValue="leaderboard" className="w-full">
                <div className="flex justify-center mb-12">
                    <TabsList className="h-auto p-2 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-full flex gap-2">
                        <TabsTrigger value="leaderboard" className="px-8 py-3 rounded-full data-[state=active]:bg-white data-[state=active]:text-black text-white/50 font-black text-sm transition-all flex items-center gap-2 tracking-tight">
                            <Medal className="h-4 w-4" /> المتصدرون
                        </TabsTrigger>
                        <TabsTrigger value="all-badges" className="px-8 py-3 rounded-full data-[state=active]:bg-white data-[state=active]:text-black text-white/50 font-black text-sm transition-all flex items-center gap-2 tracking-tight">
                            <Award className="h-4 w-4" /> الأوسمة
                        </TabsTrigger>
                        <TabsTrigger value="my-badges" className="px-8 py-3 rounded-full data-[state=active]:bg-white data-[state=active]:text-black text-white/50 font-black text-sm transition-all flex items-center gap-2 tracking-tight">
                            <Sparkles className="h-4 w-4" /> أوسمتي
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="max-w-5xl mx-auto">
                    <TabsContent value="leaderboard" className="mt-0 outline-none">
                        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-8 py-6 text-right text-xs font-black text-white/20 uppercase tracking-[0.3em]">الترتيب</th>
                                            <th className="px-8 py-6 text-right text-xs font-black text-white/20 uppercase tracking-[0.3em]">المستخدم</th>
                                            <th className="px-8 py-6 text-left text-xs font-black text-white/20 uppercase tracking-[0.3em]">النقاط المكتسبة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {restOfUsers?.map((u, index) => {
                                            const actualRank = index + 4;
                                            const isMe = user && u.id === user.uid;
                                            return (
                                                <tr key={u.id} className={cn(
                                                    "group transition-all duration-300 hover:bg-white/[0.03]",
                                                    isMe && "bg-primary/5"
                                                )}>
                                                    <td className="px-8 py-6">
                                                        <span className="text-2xl font-black text-white/10 group-hover:text-white/40 transition-colors tabular-nums">#{actualRank}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl border border-white/10 p-0.5 overflow-hidden group-hover:scale-110 transition-transform">
                                                                <Avatar className="w-full h-full rounded-xl">
                                                                    <AvatarImage src={u.photoURL} alt={u.name} />
                                                                    <AvatarFallback className="bg-zinc-800 text-white/40 font-bold text-xs">{getInitials(u.name)}</AvatarFallback>
                                                                </Avatar>
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <p className="font-black text-white group-hover:text-amber-400 transition-colors">{u.name}</p>
                                                                {isMe && <span className="text-[10px] font-black uppercase text-primary tracking-widest italic animate-pulse">أنت هنا</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-left">
                                                        <div className="inline-flex items-center gap-2 font-black text-xl text-white font-mono tracking-tighter">
                                                            {u.points || 0}
                                                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                             {user && userRank && (
                                <div className="p-10 bg-primary/10 border-t border-primary/20 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-white/40 text-xs font-black uppercase tracking-widest">موقعك الحالي</p>
                                        <h4 className="text-4xl font-black text-white tracking-tighter">المركز #{userRank}</h4>
                                    </div>
                                    <div className="w-16 h-16 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                                        <User className="w-8 h-8 text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="all-badges" className="mt-0 outline-none">
                         <div className="space-y-12">
                            <div className="text-center space-y-4">
                                <h2 className="text-4xl font-black font-headline text-white">متجر الأوسمة</h2>
                                <p className="text-white/30 text-lg font-medium italic">"أكمل المهام المعرفية لتحظى بهذه الأوسمة في ملفك الشخصي."</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {allBadges?.map(badge => (
                                    <BadgeItem key={badge.id} badge={badge} earned={earnedBadgeIds.has(badge.id)} />
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="my-badges" className="mt-0 outline-none">
                        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                             
                            {earnedBadges && earnedBadges.length > 0 ? (
                                <div className="space-y-12 relative z-10">
                                     <div className="flex items-center justify-between">
                                        <h3 className="text-3xl font-black font-headline text-white">إنجازاتك</h3>
                                        <div className="px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest">
                                            {earnedBadges.length} وسام مكتسب
                                        </div>
                                     </div>
                                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {allBadges?.filter(b => earnedBadgeIds.has(b.id)).map(badge => (
                                            <BadgeItem key={badge.id} badge={badge} earned={true} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 space-y-8 relative z-10">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                        <Award className="w-12 h-12 text-white/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-2xl font-black text-white/40">لم تحصل على أي أوسمة بعد</p>
                                        <p className="text-white/20 font-medium">ابدأ الاستماع للمحاضرات وإتمام السلاسل لتحصل على أول أوسمتك!</p>
                                    </div>
                                    <button className="px-8 py-3 rounded-full bg-white text-black font-black text-sm flex items-center gap-2 mx-auto hover:bg-zinc-200 transition-colors">
                                        ابدأ الرحلة الآن <ChevronLeft className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
      </div>
    )
}
