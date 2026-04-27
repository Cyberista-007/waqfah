'use client';

import { Flame, Sparkles, Trophy, Target, Users, Zap, Search } from 'lucide-react';
import type { Challenge } from '@/lib/types';
import { useCollection } from '@/firebase';
import { ChallengeCard } from '@/components/challenge-card';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { CinematicAppLoader } from '@/components/skeletons';

function ChallengesListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[450px] rounded-[3.5rem] bg-white/5 animate-pulse border border-white/10" />
            ))}
        </div>
    );
}

function ChallengesList() {
    const { data: challenges, isLoading } = useCollection<Challenge>('challenges', { 
        where: ['isActive', '==', true],
        orderBy: ['endDate', 'asc'] 
    });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChallenges = useMemo(() => {
        if (!challenges) return [];
        return challenges.filter(c => 
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [challenges, searchQuery]);

    if (isLoading) {
        return <ChallengesListSkeleton />;
    }

    return (
        <div className="space-y-12">
            {/* Search Bar (Glassy & Premium) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="relative w-full md:w-[450px] group/search">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500 group-focus-within/search:text-primary transition-all duration-300" />
                    <Input 
                        placeholder="ابحث عن تحدي إيماني..." 
                        className="pr-14 h-16 bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all font-bold text-lg shadow-inner text-right"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">التحديات النشطة</span>
                        <div className="flex items-center gap-2">
                             <span className="text-3xl font-black text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">{filteredChallenges.length}</span>
                             <Flame className="h-5 w-5 text-orange-500/50" />
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {filteredChallenges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredChallenges.map((challenge, index) => (
                            <ChallengeCard challenge={challenge} key={challenge.id} index={index} />
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem]"
                    >
                        <div className="flex justify-center mb-6">
                            <Target className="h-16 w-16 text-zinc-700" />
                        </div>
                        <p className="text-2xl font-black text-zinc-500">لا توجد تحديات تطابق بحثك حالياً.</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-4 text-primary font-bold hover:underline"
                        >
                            إظهار كافة التحديات
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ChallengesPage() {
    return (
        <div className="min-h-screen pb-20 overflow-hidden" dir="rtl">
            {/* Hero Section */}
            <section className="relative pt-16 pb-24 overflow-hidden">
                {/* Background Animation Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner"
                        >
                            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500/80 italic">Faith & Knowledge Quest</span>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-tight"
                        >
                            تحديات <span className="text-orange-500 italic">الهمة</span> العالية
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
                        >
                            شحذ همتك، سابق في الخيرات، واكتسب العلم من خلال تحديات تفاعلية مصممة لرفع الوعي وتزكية النفس.
                        </motion.p>

                        {/* Quick Stats */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
                        >
                            {[
                                { label: 'تحدي نشط', value: '5+', icon: Target, color: 'text-orange-500' },
                                { label: 'مشارك', value: '2.5K+', icon: Users, color: 'text-blue-400' },
                                { label: 'وسام مُنح', value: '1.2K+', icon: Trophy, color: 'text-amber-400' },
                                { label: 'نقاط همة', value: '50K+', icon: Zap, color: 'text-emerald-400' },
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i} 
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        show: { opacity: 1, y: 0 }
                                    }}
                                    className="p-6 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] hover:bg-white/10 transition-colors group"
                                >
                                    <div className={`mb-3 flex justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div className="text-3xl font-black mb-1 tabular-nums">{stat.value}</div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-6">
                <ChallengesList />
            </main>
        </div>
    );
}
