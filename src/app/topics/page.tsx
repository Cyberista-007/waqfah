
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import Image from 'next/image';
import Link from 'next/link';
import { Layers, Route, GraduationCap, Sparkles, BookOpen, Clock, Users } from 'lucide-react';
import { useCollection } from '@/firebase';
import type { Topic } from '@/lib/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function TopicsPageSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse flex flex-col p-6">
                    <div className="w-full h-48 bg-white/5 rounded-[2rem] mb-6" />
                    <div className="space-y-4">
                        <div className="w-2/3 h-8 bg-white/10 rounded-full" />
                        <div className="w-full h-4 bg-white/5 rounded-full" />
                        <div className="w-1/2 h-4 bg-white/5 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function TopicsPage() {
  const { data: topics, isLoading } = useCollection<Topic>('topics', { orderBy: ['name', 'asc'] });

  return (
    <div className="min-h-screen pb-32 overflow-x-hidden">
      {/* ── Background Atmospheric Blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container relative z-10">
        {/* ── Hero Section ── */}
        <div className="pt-20 pb-16 text-center">
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-8 uppercase tracking-[0.4em]"
            >
                <Layers className="w-3.5 h-3.5" /> هندسة الوعي والبناء
            </motion.div>
            
            <motion.h1 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-6xl md:text-8xl font-black text-white font-headline leading-tight mb-6 tracking-tighter"
            >
                مسارات <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-300 via-indigo-500 to-emerald-500 italic">التعلم</span>
            </motion.h1>
            
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/40 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed mb-16 font-medium"
            >
                رحلات معرفية منظمة، مصممة بعناية لتأخذك من البدايات إلى الإتقان في شتى علوم الشريعة وبناء الشخصية المسلمة.
            </motion.p>

            {/* ── Quick Stats ── */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
                {[
                    { label: 'مسار منهجي', value: topics?.length || 0, icon: Route, color: 'text-indigo-400' },
                    { label: 'ساعة تعليمية', value: '+500', icon: Clock, color: 'text-emerald-400' },
                    { label: 'محطة معرفية', value: '+120', icon: BookOpen, color: 'text-sky-400' },
                    { label: 'متعلم نشط', value: '+25k', icon: Users, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl group hover:bg-white/[0.06] transition-all">
                        <stat.icon className={cn("w-6 h-6 mx-auto mb-4 opacity-40 group-hover:opacity-100 transition-opacity", stat.color)} />
                        <div className="text-3xl font-black text-white mb-1" translate="no">{stat.value}</div>
                        <div className="text-[10px] text-white/25 uppercase tracking-widest font-bold">{stat.label}</div>
                    </div>
                ))}
            </motion.div>
        </div>

        {/* ── Main Content ── */}
        <div className="mt-12 px-4 sm:px-6">
            {isLoading ? (
                <TopicsPageSkeleton />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {topics?.map((topic, index) => {
                        const placeholder = getPlaceholderImage(topic.imageId);
                        return (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/topics/${topic.slug}`} className="group block h-full">
                                    <Card className="h-full overflow-hidden transition-all duration-500 bg-[#09090b] border-white/5 group-hover:border-white/20 group-hover:bg-zinc-900/40 rounded-[3rem] relative flex flex-col">
                                        {/* Image Header */}
                                        <div className="relative h-56 overflow-hidden m-3 rounded-[2.2rem]">
                                            <Image
                                                src={placeholder?.imageUrl || `https://picsum.photos/seed/${topic.slug}/600/400`}
                                                alt={topic.name}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/20 to-transparent" />
                                            
                                            {/* Badge */}
                                            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">مسار مميز</span>
                                            </div>
                                        </div>

                                        <CardContent className="p-8 pt-2 flex-1 flex flex-col">
                                            <h2 className="text-3xl font-black text-white font-headline tracking-tighter mb-4 group-hover:text-indigo-300 transition-colors">
                                                {topic.name}
                                            </h2>
                                            <p className="text-white/40 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                                                {topic.description}
                                            </p>
                                            
                                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                    <GraduationCap className="w-4 h-4" />
                                                    محتوى أكاديمي
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                                                    <Route className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
            
            {!isLoading && (!topics || topics.length === 0) && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 space-y-6"
                >
                    <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                        <Layers className="w-10 h-10 text-white/10" />
                    </div>
                    <p className="text-2xl font-black text-white/20 italic">جاري إعداد المسارات المعرفية الجديدة...</p>
                </motion.div>
            )}
        </div>
      </div>
    </div>
  );
}

