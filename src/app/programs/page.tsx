'use client';

import { Podcast, Search, Sparkles, Flame, Users, BookOpen, GraduationCap } from 'lucide-react';
import type { Program } from '@/lib/types';
import { ProgramCard } from '@/components/program-card';
import { useCollection } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { usePathname } from 'next/navigation';
import ProgramPageClient from './[slug]/ProgramPageClient';

function ProgramsListSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[500px] rounded-[3rem] bg-white/5 animate-pulse border border-white/10" />
            ))}
        </div>
    );
}

function ProgramsList() {
    const { data: programs, isLoading } = useCollection<Program>('programs', { 
        orderBy: ['followerCount', 'desc']
    });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPrograms = useMemo(() => {
        if (!programs) return [];
        return programs.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.bio?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [programs, searchQuery]);

    if (isLoading) {
        return <ProgramsListSkeleton />;
    }

    return (
        <div className="space-y-12">
            {/* Search and Filters Bar (Glassy & Premium) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="relative w-full md:w-[450px] group/search">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500 group-focus-within/search:text-primary transition-all duration-300" />
                    <Input 
                        placeholder="ابحث عن برنامجك المفضل..." 
                        className="pr-14 h-16 bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all font-bold text-lg shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">إجمالي البرامج</span>
                        <div className="flex items-center gap-2">
                             <span className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{filteredPrograms.length}</span>
                             <Podcast className="h-5 w-5 text-primary/50" />
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {filteredPrograms.length > 0 ? (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
                    >
                        {filteredPrograms.map((program, index) => (
                            <ProgramCard program={program} key={program.id} index={index} />
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
                            مسح جميع الفلاتر
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ProgramsPage() {
    const pathname = usePathname();
    const pathParts = pathname.split('/').filter(Boolean);
    const isIndividualProgram = pathParts.length > 1;

    if (isIndividualProgram) {
        return <ProgramPageClient />;
    }

    return (
        <div className="min-h-screen pb-20 overflow-hidden" dir="rtl">
            {/* Hero Section */}
            <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-8 pt-16 pb-24 overflow-hidden border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl bg-white/[0.02]">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner"
                        >
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/80 italic">The World of Knowledge</span>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-tight"
                        >
                            عالم <span className="text-primary italic">البرامج</span> العلمية
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
                        >
                            رحلة معرفية فريدة تأخذك عبر شتى العلوم والآداب، مقدمة من نخبة المحاضرين والعلماء.
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
                                { label: 'برنامج علمي', value: '45+', icon: GraduationCap, color: 'text-primary' },
                                { label: 'محاضـر', value: '12+', icon: Users, color: 'text-blue-400' },
                                { label: 'ساعة محتوى', value: '800+', icon: BookOpen, color: 'text-emerald-400' },
                                { label: 'متابع نشط', value: '10K+', icon: Flame, color: 'text-orange-400' },
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
                <ProgramsList />
            </main>
        </div>
    );
}
