"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Series, Lecture } from '@/lib/types';
import { Play, MessageSquare, ChevronLeft, Layers, Clock } from 'lucide-react';
import { cn, getVideoIdFromUrl } from '@/lib/utils';
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlaceholderImage } from '@/lib/images';
import { useCollection } from '@/firebase';
import { ThreeDTilt } from './ui/three-d-tilt';

interface SeriesCardProps {
    series: Series;
    index?: number;
    pinnedMessage?: string;
}

const SeriesCardComponent = ({ series, index = 0, pinnedMessage }: SeriesCardProps) => {
    const { data: lectures } = useCollection<Lecture>('lectures', {
        where: ['seriesId', '==', series.id],
        limit: 1
    });

    const firstLecture = lectures?.[0];
    const videoId = firstLecture ? getVideoIdFromUrl(firstLecture.youtubeUrl) : null;
    
    const placeholder = getPlaceholderImage(series.imageId);
    const imageUrl = videoId 
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
        : (placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/1200/675`);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="h-full"
        >
            <ThreeDTilt tiltMax={8} className="h-full">
                <Link href={`/series/${series.slug}`} className="block h-full group">
                    <Card className="h-full flex flex-col relative overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl rounded-[2.5rem] transition-all duration-500 transform-gpu">
                    {/* Background Visuals */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 overflow-hidden">
                            <Image 
                                src={imageUrl} 
                                alt={series.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                priority={index < 4}
                                className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.3] group-hover:brightness-[0.4]"
                            />
                        </div>
                        
                        {/* Overlay Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-10" />
                        
                        {/* Glowing Accents */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/20 transition-colors duration-700" />
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-20 flex flex-col h-full">
                        <CardHeader className="pt-10 px-8 flex-grow">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                                    <Layers className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 italic">Scientific Series</span>
                                    <div className="h-0.5 w-10 bg-primary mt-1 rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                                </div>
                            </div>
                            
                            <CardTitle className="font-headline text-3xl md:text-4xl font-black text-white leading-tight mb-4 transition-all duration-500 group-hover:tracking-tight">
                                {series.title}
                            </CardTitle>
                            
                            <CardDescription className="text-zinc-400 font-medium line-clamp-3 text-base leading-relaxed mb-6 opacity-70 group-hover:opacity-100 transition-opacity">
                                {series.description}
                            </CardDescription>

                            <AnimatePresence>
                                {pinnedMessage && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-primary/10 p-3 rounded-2xl border border-primary/20 inline-flex"
                                    >
                                        <p className="text-xs text-primary/90 italic flex items-center gap-2">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            {pinnedMessage}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardHeader>
                        
                        <div className="px-8 pb-8 mt-auto">
                            <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] group-hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 text-white font-black text-lg">
                                            <span>{series.lectureCount || 0}</span>
                                            <Play className="w-4 h-4 text-primary fill-primary" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">محاضرة</span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1 text-zinc-300 font-bold text-xs">
                                            <Clock className="w-3 h-3 text-primary" />
                                            <span>{series.isCompleted ? 'مكتملة' : 'قيد النشر'}</span>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 italic">الحالة</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 group-active:scale-95 shadow-primary/20">
                                    <ChevronLeft className="w-6 h-6 text-primary-foreground stroke-[3px]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
                </Link>
            </ThreeDTilt>
        </motion.div>
    );
};

export const SeriesCard = memo(SeriesCardComponent);
