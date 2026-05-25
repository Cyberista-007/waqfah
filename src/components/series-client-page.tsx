
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase';
import type { Series, Lecture, Program, ListenHistoryItem } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/images';
import { Play, Search, Share2, Clock, ListVideo, Rss } from 'lucide-react';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LectureListItem } from '@/components/lecture-list-item';
import { formatTotalDuration, getVideoIdFromUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getInitials } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { SeriesCertificate } from './series-certificate';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SeriesClientPageProps {
  series: Series;
  lecturesInSeries: Lecture[];
  seriesCreator: Program | null;
}

export function SeriesClientPage({ series, lecturesInSeries, seriesCreator }: SeriesClientPageProps) {
  const { playTrack, playIframe } = useAudioPlayer();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory } = useCollection<ListenHistoryItem>(
      listenHistoryPath, 
      { where: ['seriesId', '==', series.id] }
  );

  const filteredLectures = useMemo(() => {
    if (!searchTerm) {
        return lecturesInSeries;
    }
    return lecturesInSeries.filter(lecture => lecture.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [lecturesInSeries, searchTerm]);
  
  const seriesProgress = useMemo(() => {
    if (!listenHistory || !lecturesInSeries || lecturesInSeries.length === 0) return 0;
    const completedLecturesCount = listenHistory.filter(item => {
        const lecture = lecturesInSeries.find(l => l.id === item.lectureId);
        return lecture && item.duration > 0 && (item.position / item.duration > 0.95);
    }).length;
    return (completedLecturesCount / lecturesInSeries.length) * 100;
  }, [listenHistory, lecturesInSeries]);

  const totalDuration = useMemo(() => {
      return lecturesInSeries.reduce((acc, lecture) => acc + (lecture.duration || 0), 0);
  }, [lecturesInSeries]);
  
  const handleShare = async () => {
    const shareData = {
        title: `سلسلة: ${series.title}`,
        text: `شاهد سلسلة "${series.title}" على منصة وقفة`,
        url: window.location.href,
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
             await navigator.clipboard.writeText(window.location.href);
             toast({ title: 'تم نسخ الرابط!' });
        }
    } catch (error) {
        console.error('Error sharing:', error);
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'تم نسخ الرابط!' });
    }
  };
  
  const router = useRouter();

  const handlePlayAll = () => {
    const firstLecture = lecturesInSeries[0];
    if (firstLecture) {
        router.push(`/lectures/${firstLecture.slug}`);
    } else {
        toast({ variant: 'destructive', title: 'لا توجد محاضرات في هذه السلسلة.' });
    }
  };

  const handleSubscribePodcast = async () => {
    const feedUrl = `${window.location.origin}/api/podcasts/${series.slug}`;
    try {
        await navigator.clipboard.writeText(feedUrl);
        toast({ 
            title: 'تم نسخ رابط البودكاست!', 
            description: 'يمكنك الآن لصق هذا الرابط في تطبيق البودكاست المفضل لديك (مثل Apple Podcasts) للاشتراك ومتابعة السلسلة.'
        });
    } catch (error) {
        console.error('Error copying RSS url:', error);
        toast({ variant: 'destructive', title: 'فشل نسخ الرابط', description: feedUrl });
    }
  };

  const { imageUrl, imageHint } = useMemo(() => {
    if (lecturesInSeries && lecturesInSeries.length > 0) {
        const lectureWithImage = lecturesInSeries.find(l => l.youtubeUrl || l.imageId);
        if (lectureWithImage) {
            const videoId = getVideoIdFromUrl(lectureWithImage.youtubeUrl);
            if (videoId) {
                return {
                    imageUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    imageHint: 'youtube thumbnail'
                };
            }
            const placeholder = getPlaceholderImage(lectureWithImage.imageId);
            if (placeholder) {
                return { imageUrl: placeholder.imageUrl, imageHint: placeholder.imageHint };
            }
        }
    }
    const seriesPlaceholder = getPlaceholderImage(series.imageId);
    return { 
        imageUrl: seriesPlaceholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/600/600`,
        imageHint: seriesPlaceholder?.imageHint || 'islamic art'
    };
  }, [lecturesInSeries, series.imageId, series.slug]);


  return (
    <div className="relative min-h-screen overflow-hidden">
        {/* 🎬 Atmospheric Background Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div 
                className="absolute inset-0 bg-cover bg-center filter blur-[120px] opacity-30 saturate-[1.5] brightness-[0.6] scale-110"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-20 mt-16 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col gap-16">
            
            {/* 🌋 Legendary Hero Section */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden group p-8 lg:p-14 flex flex-col md:flex-row items-center md:items-stretch gap-10 lg:gap-16 ring-1 ring-white/5"
            >
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000 z-0 opacity-40" />
                
                {/* Visual Anchor */}
                <div className="relative w-full max-w-sm md:w-[400px] shrink-0 aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/5 z-10 group-hover:scale-[1.03] transition-all duration-700 hover:shadow-primary/20">
                    <Image
                        src={imageUrl}
                        alt={series.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        priority
                        data-ai-hint={imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
                
                {/* Content Citadel */}
                <div className="flex-grow flex flex-col justify-center space-y-8 relative z-10 text-center md:text-start w-full">
                    <div className="space-y-4">
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl lg:text-7xl font-black font-headline leading-tight tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60 drop-shadow-2xl"
                        >
                            {series.title}
                        </motion.h1>
                        
                        {seriesCreator && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center justify-center md:justify-start gap-4"
                            >
                                <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 transition-colors">
                                    <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                                        <AvatarImage src={seriesCreator.imageUrl} alt={seriesCreator.name} />
                                        <AvatarFallback>{getInitials(seriesCreator.name)}</AvatarFallback>
                                    </Avatar>
                                    <Link href={`/programs/${seriesCreator.slug}`} className="hover:text-primary transition-colors font-bold text-lg pe-2">{seriesCreator.name}</Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    
                    <p className="text-muted-foreground/90 lg:text-xl leading-relaxed font-medium max-w-2xl">{series.description}</p>
                    
                    {/* Stats & Progress HUD */}
                    <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-start items-center gap-6 text-sm font-black tracking-wide bg-gradient-to-r from-primary/10 to-transparent p-5 rounded-[2rem] border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <div className="flex items-center gap-2.5 text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"><ListVideo className="h-5 w-5" /> <span>{lecturesInSeries.length} محاضرة</span></div>
                        <div className="w-px h-8 bg-white/10 hidden md:block" />
                        <div className="flex items-center gap-2.5 text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"><Clock className="h-5 w-5" /> <span>{formatTotalDuration(totalDuration)}</span></div>
                        {user && (
                            <>
                                <div className="w-px h-8 bg-white/10 hidden md:block" />
                                <div className="flex items-center gap-4 flex-grow max-w-xs">
                                    <span className="text-white/40 text-xs">تقدّمك:</span>
                                    <div className="flex-grow space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] text-primary/70">{Math.round(seriesProgress)}%</span>
                                        </div>
                                        <Progress value={seriesProgress} className="h-1.5 bg-black/40" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div className="flex justify-center md:justify-start gap-4 pt-4">
                         <Button onClick={handlePlayAll} size="lg" className="h-16 px-12 rounded-2xl text-xl font-black font-headline bg-primary hover:bg-primary/90 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)] group overflow-hidden relative transition-all active:scale-95 leading-none">
                            <span className="relative z-10 flex items-center gap-3">
                                <Play className="w-6 h-6 fill-current" />
                                ابدأ الرحلة التعليمية
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                         </Button>
                         <Button onClick={handleShare} size="lg" variant="outline" className="h-16 w-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/20 text-primary transition-all hover:scale-110 active:scale-90" title="مشاركة السلسلة">
                            <Share2 className="w-6 h-6" />
                         </Button>
                         <Button 
                             onClick={handleSubscribePodcast} 
                             size="lg" 
                             variant="outline" 
                             className="h-16 px-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/20 text-primary transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-3"
                             title="الاشتراك كبودكاست RSS"
                         >
                            <Rss className="w-5 h-5 text-orange-500" />
                            <span className="font-bold text-sm hidden sm:inline">بودكاست RSS</span>
                         </Button>
                    </div>
                </div>
            </motion.div>
    
            {/* 📜 Structured Syllabus Section */}
            <div className="w-full space-y-10">
                {seriesProgress >= 98 && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <SeriesCertificate 
                          seriesTitle={series.title}
                          userName={user?.displayName || 'طالب علم'}
                          seriesId={series.id}
                        />
                    </motion.div>
                )}
                
                <div className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                   <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
                   
                   <div className="relative z-10 space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="space-y-1 text-center md:text-start">
                                <h3 className="text-3xl font-black font-headline tracking-tight">محطات السلسلة المنهجية</h3>
                                <p className="text-muted-foreground font-medium">تصفح المحاضرات وابدأ في بناء معرفتك خطوة بخطوة.</p>
                            </div>
                            <div className="relative w-full md:w-[400px]">
                                <Input 
                                    placeholder="ابحث عن محطة محددة..."
                                    className="pe-12 h-14 text-lg rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 focus-visible:ring-primary/50 font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-muted-foreground"/>
                            </div>
                        </div>
                        
                        <div className="space-y-6 pt-4">
                            <AnimatePresence mode="popLayout">
                                {filteredLectures.length > 0 ? (
                                    filteredLectures.map((lecture, index) => (
                                        <motion.div 
                                            key={lecture.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <LectureListItem lecture={lecture} index={index + 1} />
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-24 bg-white/2 border-2 border-dashed border-white/5 rounded-[3rem]">
                                        <ListVideo className="w-20 h-20 text-white/10 mx-auto mb-6" />
                                        <h3 className="text-2xl font-black font-headline mb-3 text-white/50">لم نعثر على هذا العنوان</h3>
                                        <p className="text-muted-foreground font-bold">حاول البحث بكلمة مفتاحية مختلفة.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                   </div>
                </div>
            </div>
          </div>
        </div>
    </div>
  );
}
