'use client';

import { ListVideo, Search, Sparkles, BookOpen, Clock, Play, GraduationCap } from 'lucide-react';
import { SeriesCard } from '@/components/series-card';
import { useCollection } from '@/firebase';
import type { Series } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { CinematicAppLoader } from '@/components/skeletons';

function SeriesListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-[3rem] bg-white/5 animate-pulse border border-white/10" />
            ))}
        </div>
    );
}

function SeriesList() {
    const { data: allSeries, isLoading } = useCollection<Series>('series', { 
        orderBy: ['createdAt', 'desc']
    });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSeries = useMemo(() => {
        if (!allSeries) return [];
        return allSeries.filter(s => 
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.programName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allSeries, searchQuery]);

    if (isLoading) {
        return <SeriesListSkeleton />;
    }

    return (
        <div className="space-y-12">
            {/* Search Bar (Glassy & Premium) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="relative w-full md:w-[450px] group/search">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500 group-focus-within/search:text-primary transition-all duration-300" />
                    <Input 
                        placeholder="ابحث عن سلسلة علمية..." 
                        className="pr-14 h-16 bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all font-bold text-lg shadow-inner text-right"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">إجمالي السلاسل</span>
                        <div className="flex items-center gap-2">
                             <span className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{filteredSeries.length}</span>
                             <ListVideo className="h-5 w-5 text-primary/50" />
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {filteredSeries.length > 0 ? (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                    >
                        {filteredSeries.map((series, index) => (
                            <SeriesCard series={series} key={series.id} index={index} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem]"
                    >
                        <div className="flex justify-center mb-6">
                            <Search className="h-16 w-16 text-zinc-700" />
                        </div>
                        <p className="text-2xl font-black text-zinc-500">لا توجد نتائج تطابق بحثك حالياً.</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-4 text-primary font-bold hover:underline"
                        >
                            مسح البحث
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function SeriesListPage() {
  return (
    <div className="min-h-screen pb-20 overflow-hidden" dir="rtl">
        {/* Hero Section */}
        <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-8 pt-16 pb-24 overflow-hidden border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl bg-white/[0.02]">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner"
                    >
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/80 italic">Scientific Series Roadmap</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-tight"
                    >
                        السلاسل <span className="text-primary italic">العلمية</span> المنهجية
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        تعلم العلم الشرعي بخطوات ثابتة ومنهجية واضحة، من خلال سلاسل مترابطة تشمل شتى فنون المعرفة.
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
                            { label: 'سلسلة علمية', value: '30+', icon: Play, color: 'text-primary' },
                            { label: 'مادة مسجلة', value: '450+', icon: Clock, color: 'text-violet-400' },
                            { label: 'كتاب مشروح', value: '25+', icon: BookOpen, color: 'text-emerald-400' },
                            { label: 'طالب علم', value: '5K+', icon: GraduationCap, color: 'text-amber-400' },
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
                                <div className="text-3xl font-black mb-1">{stat.value}</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-6">
            <SeriesList />
        </main>
    </div>
  );
}
