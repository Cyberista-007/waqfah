'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, notFound, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, Facebook, FileDown, Twitter, Youtube, Play, Notebook, Share2, Copy, ChevronsUpDown, X, Loader2, MessageCircle, Sparkles, Zap, Star, ShieldCheck, Headphones, Eye, Info, Layers, Shuffle, ListMusic, Repeat, Repeat1 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LectureHeader } from '@/components/lecture-header';
import type { Lecture, ListenHistoryItem, Playlist } from '@/lib/types';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LectureCard } from './lecture-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { DownloaderModal } from './downloader-modal';
import { getVideoIdFromUrl, formatDuration } from '@/lib/utils';
import { Html5Player } from './html5-player';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListVideo, SkipForward, SkipBack, FileText } from 'lucide-react';
import { LectureChapters } from '@/components/lecture-chapters';
import Image from 'next/image';
import Link from 'next/link';
import { getPlaceholderImage } from '@/lib/images';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import Magnetic from './magnetic';

const InteractiveTranscript = dynamic(() => import('@/components/interactive-transcript').then(mod => mod.InteractiveTranscript), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>,
    ssr: false
});
const LectureNotes = dynamic(() => import('@/components/lecture-notes').then(mod => mod.LectureNotes), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>,
    ssr: false
});
const CommentsSection = dynamic(() => import('@/components/comments-section').then(mod => mod.CommentsSection), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>,
    ssr: false
});

interface LectureClientPageProps {
    lecture: Lecture;
    relatedLectures: Lecture[];
    playlist?: Playlist;
}

const revealVariant: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export function LectureClientPage({ lecture, relatedLectures, playlist }: LectureClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlist');
  const userId = searchParams.get('u');
  const { playTrack, hidePlayer, playIframe } = useAudioPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false);
  const [downloadFormats, setDownloadFormats] = useState([]);
  const [isFetchingFormats, setIsFetchingFormats] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const playerSeekRef = useRef<((t: number) => void) | null>(null);

  const historyDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'listenHistory', lecture.id) : null),
    [user, firestore, lecture.id]
  );
  const { data: lectureHistory } = useDoc<ListenHistoryItem>(historyDocRef);

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: allHistory } = useCollection<ListenHistoryItem>(listenHistoryPath);

  const playlistsPath = user ? `users/${user.uid}/playlists` : null;
  const { data: playlists } = useCollection<Playlist>(playlistsPath);

  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const queryParams = new URLSearchParams(window.location.search);
        const t = parseInt(queryParams.get('t') || '0', 10);
        if (!isNaN(t) && t > 0) {
            setInitialTime(t);
            setPlayerCurrentTime(t); // also update generic time state
        }
        
        let path = window.location.href.split('?')[0];
        // If there's a timestamp, set it
        if (t > 0) path += `?t=${t}`;
        setShareUrl(path);
    }
  }, []);
  
  if (!lecture) notFound();
  
  const videoId = getVideoIdFromUrl(lecture?.youtubeUrl);

  const handlePlay = () => {
    hidePlayer();
    let startTime = 0;
    if (lectureHistory && lectureHistory.position && lectureHistory.duration && (lectureHistory.duration - lectureHistory.position) > 10 && lectureHistory.position > 5) {
        startTime = lectureHistory.position;
        toast({
            title: "تكملة الاستماع",
            description: `تم استئناف المحاضرة من حيث توقفت.`,
        });
    }
    playTrack({
      id: lecture.id,
      title: lecture.title,
      audioSrc: lecture.audioSrc,
      imageId: lecture.imageId,
      seriesId: lecture.seriesId,
      seriesSlug: lecture.seriesSlug,
      seriesTitle: lecture.seriesTitle,
      slug: lecture.slug,
      programName: lecture.programName,
    }, startTime);
  };
  
  const handleWatchVideo = () => {
      if (videoId) {
          playIframe({ type: 'youtube', src: videoId, title: lecture.title, lectureId: lecture.id, seriesId: lecture.seriesId });
      }
  }

  const getLectureImageUrl = (item: Lecture) => {
    const vId = getVideoIdFromUrl(item.youtubeUrl);
    if (vId) return `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`;
    return getPlaceholderImage(item.imageId)?.imageUrl || `https://picsum.photos/seed/${item.slug}/600/400`;
  };

  const seriesLink = `/series/${lecture.seriesSlug}`;
  const shareText = `استمع إلى محاضرة "${lecture.title}"`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: 'تم نسخ الرابط!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
    }
  }, [shareUrl, toast]);

    // Update share URL whenever time changes if it's playing
    useEffect(() => {
        if (playerCurrentTime > 0 && typeof window !== 'undefined') {
             const path = window.location.href.split('?')[0];
             setShareUrl(`${path}?t=${Math.floor(playerCurrentTime)}`);
        }
    }, [playerCurrentTime]);

    const handleShare = useCallback(async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
          try {
            await navigator.share({
              title: shareText,
              text: shareText,
              url: shareUrl,
            });
          } catch (error) {
            console.log('Share was cancelled or failed.', error);
          }
        } else {
          handleCopyLink();
        }
    }, [shareText, shareUrl, handleCopyLink]);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (lecture.youtubeUrl) {
        setIsFetchingFormats(true);
        try {
            const response = await fetch(`${window.location.origin}/api/youtube-import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: lecture.youtubeUrl, getFormats: true }),
            });
            const data = await response.json();
            if (!response.status || response.status >= 400) {
                throw new Error(data.description || data.message || 'فشل في جلب صيغ التنزيل.');
            }
            if (data.formats && data.formats.length > 0) {
                setDownloadFormats(data.formats);
                setIsDownloaderOpen(true);
            } else {
                toast({ variant: 'destructive', title: 'لم يتم العثور على صيغ تنزيل متاحة.' });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: error.message });
        } finally {
            setIsFetchingFormats(false);
        }
        return;
    }
    const audioUrl = lecture.audioSrc;
    if (!audioUrl) {
        toast({ variant: 'destructive', title: 'رابط التحميل غير متوفر' });
        return;
    }
    try {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `${lecture.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: 'بدأ التحميل!', description: 'جاري تحميل الملف الصوتي...' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء محاولة التنزيل' });
    }
  }, [lecture, toast]);

  const currentIndex = relatedLectures.findIndex(l => l.id === lecture.id);
  const prevLecture = currentIndex > 0 ? relatedLectures[currentIndex - 1] : null;
  const nextLecture = currentIndex >= 0 && currentIndex < relatedLectures.length - 1 ? relatedLectures[currentIndex + 1] : null;

  const handleVideoEnded = useCallback(() => {
    if (repeatMode === 'one') {
        // Just reload the same page or trigger a restart
        window.location.reload();
        return;
    }

    if (isShuffle) {
        const otherLectures = relatedLectures.filter(l => l.id !== lecture.id);
        if (otherLectures.length > 0) {
            const randomIdx = Math.floor(Math.random() * otherLectures.length);
            const target = otherLectures[randomIdx];
            router.push(`/lectures/${target.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`);
            return;
        }
    }

    if (nextLecture) {
        router.push(`/lectures/${nextLecture.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`);
    } else if (repeatMode === 'all' && relatedLectures.length > 0) {
        const first = relatedLectures[0];
        router.push(`/lectures/${first.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`);
    }
  }, [repeatMode, isShuffle, relatedLectures, lecture.id, nextLecture, router, playlistId, userId]);

  return (
    <>
    {/* 🎭 Cinematic Backdrop Glow */}
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div 
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] opacity-40 animate-pulse-subtle"
            style={{ animationDuration: '8s' }}
        />
        <div 
            className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[140px] opacity-30 animate-pulse-subtle"
            style={{ animationDuration: '12s', animationDelay: '2s' }}
        />
    </div>

    <div className={cn("container mx-auto px-4 sm:px-6 py-8 space-y-12 transition-all duration-700", isTheaterMode && "max-w-none px-0 py-0")}>
      
      {/* 🎬 Cinematic Player & Playlist Layout */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={revealVariant}
        className={cn(
            "grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 bg-card/20 p-2 md:p-4 rounded-[3rem] border border-white/5 shadow-2xl relative z-10 frosted-glass w-full backdrop-blur-3xl",
            isTheaterMode && "rounded-none border-none p-0 lg:gap-0 lg:h-screen"
        )}
      >
         {/* 🎥 Right Area: Main Video Player & Info */}
          <div className={cn(
             "order-1 flex flex-col gap-8 transition-all duration-700 ease-in-out",
             isSidebarOpen ? "lg:col-span-8" : "lg:col-span-12",
             isTheaterMode && "lg:col-span-12"
          )}>
            <div className={cn(
                "relative bg-[#050505] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.6)] group flex items-center justify-center min-h-[300px] lg:h-[calc(100vh-350px)] lg:max-h-[750px] transition-all duration-700 w-full",
                isTheaterMode && "rounded-none h-screen max-h-none"
            )}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
                
                {videoId ? (
                <Html5Player 
                    videoId={videoId} 
                    title={lecture.title} 
                    thumbnailUrl={getLectureImageUrl(lecture)} 
                    className="w-full h-full rounded-none" 
                    startTime={initialTime}
                    onTimeUpdate={setPlayerCurrentTime}
                    onEnded={handleVideoEnded}
                    transcript={lecture.transcript}
                />
                ) : (
                <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                    <Image src={getLectureImageUrl(lecture)} fill className="object-cover opacity-20 blur-md grayscale" alt="audio-bg" />
                    <div className="relative z-10 flex flex-col items-center text-center px-6">
                        <motion.div 
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="mb-10 p-10 rounded-full bg-primary/20 border-2 border-primary/30 backdrop-blur-3xl shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]"
                        >
                            <Headphones className="w-16 h-16 text-primary" />
                        </motion.div>
                        <h3 className="text-3xl font-black mb-8 text-white font-headline tracking-tighter">تجربة استماع نقية</h3>
                        <Magnetic>
                        <Button onClick={handlePlay} size="lg" className="h-20 px-14 text-2xl font-black rounded-3xl btn-magnetic shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)] bg-primary text-white transition-all duration-300">
                            <Play className="w-8 h-8 me-4 fill-current" /> ابدأ الآن
                        </Button>
                        </Magnetic>
                    </div>
                </div>
                )}
            </div>

            {/* 📝 Integrated Top Action Bar */}
            {!isTheaterMode && (
                <div className="flex flex-col gap-8 px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6" dir="rtl">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white font-headline leading-tight tracking-tighter">{lecture.title}</h1>
                            <div className="flex items-center gap-6">
                                <Link href={seriesLink} className="group/link flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 hover:bg-primary/20 transition-all">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-primary font-black text-sm">{lecture.seriesTitle}</span>
                                </Link>
                                <div className="flex items-center gap-4 text-muted-foreground/60 font-black text-xs uppercase tracking-widest">
                                    <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> 2.4K</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> مباشر</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button 
                                onClick={handleDownload} 
                                disabled={isFetchingFormats}
                                className="flex-1 md:flex-none h-16 px-10 rounded-3xl bg-primary text-white font-black text-lg shadow-2xl shadow-primary/20 hover:scale-105 transition-all group"
                            >
                                {isFetchingFormats ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 transition-transform group-hover:-translate-y-1" />}
                                <span className="ms-3">تنزيل</span>
                            </Button>
                            
                            <Button 
                                onClick={() => setIsTheaterMode(true)}
                                className="h-16 w-16 md:w-auto md:px-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black transition-all shadow-xl group"
                                title="وضع السينما"
                            >
                                <Layers className="w-6 h-6 md:me-3 transition-transform group-hover:rotate-12" />
                                <span className="hidden md:inline">سينما</span>
                            </Button>

                            {/* New Sidebar Toggle in Action Bar */}
                            <Button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={cn(
                                    "h-16 w-16 md:w-auto md:px-8 rounded-3xl border transition-all shadow-xl group",
                                    isSidebarOpen 
                                        ? "bg-primary/20 border-primary/30 text-primary" 
                                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                )}
                                title={isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
                            >
                                <ListVideo className={cn("w-6 h-6 md:me-3 transition-transform", !isSidebarOpen && "animate-pulse")} />
                                <span className="hidden md:inline">{isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}</span>
                            </Button>

                            <Button 
                                onClick={handleShare}
                                className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all shadow-xl"
                            >
                                <Share2 className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>
             )}
          </div>

          <AnimatePresence>
          {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 50, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: 50, width: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={cn(
                "lg:col-span-4 order-2 flex flex-col bg-[#0f0f0f] rounded-3xl border border-white/5 overflow-hidden shadow-2xl h-[450px] lg:h-[calc(100vh-250px)] lg:max-h-[700px] transition-all duration-500",
                isTheaterMode && "hidden lg:flex lg:col-span-3 lg:rounded-none lg:border-l lg:h-screen lg:max-h-none"
            )}
          >
            <div className="p-4 border-b border-white/5 bg-[#1a1a1a] z-10">
               <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h3 className="font-black text-lg font-headline text-white line-clamp-1">
                        {playlist ? playlist.name : 'رحلة الاستماع'}
                    </h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                        {lecture.programName || 'Abdallah El Ghamry'} - {relatedLectures.findIndex(l => l.id === lecture.id) + 1} من {relatedLectures.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-white/60 h-8 w-8">
                        <ChevronsUpDown className="w-4 h-4 rotate-90" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsSidebarOpen(false)}
                        className="rounded-full hover:bg-white/5 text-white/60 h-8 w-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                  </div>
               </div>
               
               <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={cn(
                        "rounded-full transition-all h-8 w-8",
                        isShuffle ? "bg-primary text-white shadow-lg" : "hover:bg-white/5 text-white/60"
                    )}
                    title={isShuffle ? "إيقاف الترتيب العشوائي" : "تشغيل الترتيب العشوائي"}
                  >
                      <Shuffle className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                        if (repeatMode === 'none') setRepeatMode('all');
                        else if (repeatMode === 'all') setRepeatMode('one');
                        else setRepeatMode('none');
                    }}
                    className={cn(
                        "rounded-full transition-all h-8 w-8",
                        repeatMode !== 'none' ? "bg-primary text-white shadow-lg" : "hover:bg-white/5 text-white/60"
                    )}
                    title={repeatMode === 'none' ? "تكرار الكل" : repeatMode === 'all' ? "تكرار هذه الحلقة" : "إيقاف التكرار"}
                  >
                      {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                  </Button>
               </div>
            </div>
            <ScrollArea className="flex-1">
               <div className="p-0">
                  {relatedLectures.map((item, idx) => {
                     const isCurrent = item.id === lecture.id;
                     const history = allHistory?.find(h => h.id === item.id);
                     const progress = history && history.duration ? (history.position / history.duration) * 100 : 0;

                     return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Link 
                            href={`/lectures/${item.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`} 
                            className={cn(
                                "flex gap-4 p-4 hover:bg-white/[0.05] transition-all group items-center relative active:scale-[0.98]",
                                isCurrent ? "bg-white/[0.08]" : ""
                            )}
                          >
                              {/* Index / Indicator */}
                              <div className="w-6 flex shrink-0 items-center justify-center">
                                  {isCurrent ? (
                                      <Play className="w-3 h-3 text-white fill-current" />
                                  ) : (
                                      <span className="text-[10px] font-black text-white/30 group-hover:text-white/60 transition-colors">{idx + 1}</span>
                                  )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                 <h4 className={cn(
                                     "font-black text-sm line-clamp-2 transition-colors leading-relaxed",
                                     isCurrent ? "text-white" : "text-white/80 group-hover:text-white"
                                 )}>{item.title}</h4>
                                 <div className="mt-1">
                                     <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{item.programName || 'Abdallah El Ghamry'}</p>
                                 </div>
                              </div>

                              {/* Thumbnail */}
                              <div className="relative w-28 h-16 rounded-lg overflow-hidden shrink-0 bg-zinc-900 shadow-lg">
                                 <Image 
                                    src={getLectureImageUrl(item)} 
                                    alt={item.title} 
                                    fill 
                                    className={cn(
                                        "object-cover transition-all",
                                        isCurrent ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                                    )}
                                 />
                                 
                                 {/* Progress Bar Overlay */}
                                 {progress > 0 && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-red-600/30 w-full z-10">
                                        <div className="h-full bg-red-600" style={{ width: `${progress}%` }} />
                                    </div>
                                 )}

                                 <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-black px-1.5 py-0.5 rounded transition-opacity z-20">
                                     {formatDuration(item.duration ?? 0)}
                                 </div>
                              </div>
                          </Link>
                        </motion.div>
                     );
                  })}
               </div>
            </ScrollArea>
          </motion.div>
          )}
          </AnimatePresence>
      </motion.div>

      {/* 🚀 Next / Prev Navigation */}
      {(prevLecture || nextLecture) && !isTheaterMode && (
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={revealVariant}
           className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl p-4 shadow-xl relative z-10"
        >
          {nextLecture ? (
            <Button asChild variant="default" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg gap-3 order-1 sm:order-2 shadow-lg hover:scale-[1.02] transition-transform">
               <Link href={`/lectures/${nextLecture.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`}>
                 <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] text-white/70 uppercase tracking-widest font-black">المحطة التالية</span>
                    <span className="truncate max-w-[200px] block">{nextLecture.title}</span>
                 </div>
                 <SkipForward className="w-5 h-5 shrink-0" />
               </Link>
            </Button>
          ) : <div className="hidden sm:block order-2"></div>}
          
          {prevLecture ? (
            <Button asChild variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 font-bold text-lg gap-3 order-2 sm:order-1 transition-all">
               <Link href={`/lectures/${prevLecture.slug}`}>
                 <SkipBack className="w-5 h-5 shrink-0 text-muted-foreground" />
                 <div className="flex flex-col items-end leading-tight">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">المحطة السابقة</span>
                    <span className="truncate max-w-[200px] block">{prevLecture.title}</span>
                 </div>
               </Link>
            </Button>
          ) : <div className="hidden sm:block order-1"></div>}
        </motion.div>
      )}

      {/* 🧾 Lecture Bento Layout (Information, Tools, Share) */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariant}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10"
      >
        
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        عن هذه المحاضرة
                    </div>
                </div>
                <LectureHeader lecture={lecture} seriesLink={seriesLink} />
            </div>
        </div>

        {/* 📖 Chapters — show between Info and Tools when available */}
        {lecture.chapters && lecture.chapters.length > 0 && (
          <div className="lg:col-span-2">
            <LectureChapters
              chapters={lecture.chapters}
              currentTime={playerCurrentTime}
              onSeek={(t) => playerSeekRef.current?.(t)}
            />
          </div>
        )}

        {/* Tools & Share Stack */}
        <div className="flex flex-col gap-8">
            
            {/* Tools Card */}
            <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group flex-1">
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500" />
                <h3 className="text-2xl font-black mb-8 font-headline text-white flex items-center gap-3">
                    <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
                    المختبر العلمي
                </h3>
                <div className="flex flex-col gap-4 relative z-10">
                    <Button onClick={handleDownload} disabled={isFetchingFormats} className="w-full justify-between h-16 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-all group/btn shadow-lg">
                        <div className="flex items-center">
                            {isFetchingFormats ? <Loader2 className="w-6 h-6 me-4 animate-spin text-blue-400" /> : <Download className="w-6 h-6 me-4 text-blue-400 transition-transform group-hover/btn:-translate-y-1" />}
                            <span className="font-black text-lg">تحميل المحاضرة</span>
                        </div>
                        <div className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">MP3/MP4</div>
                    </Button>
                    {lecture.pdfUrl && (
                        <Button asChild variant="secondary" className="w-full justify-between h-16 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-all group/btn shadow-lg">
                            <a href={lecture.pdfUrl} download className="flex items-center w-full justify-between">
                                <div className="flex items-center">
                                    <FileDown className="w-6 h-6 me-4 text-emerald-400 transition-transform group-hover/btn:scale-110" />
                                    <span className="font-black text-lg">التفريغ النصي</span>
                                </div>
                                <div className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">PDF</div>
                            </a>
                        </Button>
                    )}
                </div>
            </section>
            
            {/* Share Card */}
            <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500" />
                <h3 className="text-2xl font-black mb-8 font-headline text-white flex items-center gap-3">
                    <Share2 className="w-6 h-6 text-emerald-400" />
                    نشر الخير
                </h3>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <Button asChild variant="outline" className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all p-4">
                        <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} data-action="share/whatsapp/share" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
                            <MessageCircle className="w-8 h-8 text-[#25D366] fill-[#25D366]/20" />
                        </a>
                    </Button>
                    <Button asChild variant="outline" className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all p-4">
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
                            <Facebook className="w-8 h-8 text-[#1877F2] fill-[#1877F2]/20" />
                        </a>
                    </Button>
                    <Button variant="outline" onClick={handleCopyLink} className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/40 transition-all">
                        <Copy className="w-6 h-6" />
                    </Button>
                    <Button variant="outline" onClick={handleShare} className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-primary/20 transition-all">
                        <Share2 className="w-6 h-6" />
                    </Button>
                </div>
            </section>

        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariant}
      >
        <Tabs defaultValue="transcript" className="w-full mt-10">
            <div className="flex justify-center mb-10">
                <TabsList className="grid max-w-2xl grid-cols-3 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] h-20 p-2 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <TabsTrigger value="transcript" className="rounded-[1.5rem] text-lg font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
                    <FileText className="w-5 h-5 me-2" /> التفريغ التفاعلي
                </TabsTrigger>
                <TabsTrigger value="notes" disabled={!user} className="rounded-[1.5rem] text-lg font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
                    ملاحظاتي
                </TabsTrigger>
                <TabsTrigger value="comments" className="rounded-[1.5rem] text-lg font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
                    التعليقات
                </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="transcript" className="mt-0 outline-none">
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
                    <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 border-b border-white/5 pb-10">
                        <div className="flex items-center gap-5">
                            <div className="p-5 bg-primary/20 rounded-[2rem] shadow-inner">
                                <FileText className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black font-headline text-white tracking-tighter">التفريغ النصي التفاعلي</h2>
                                <p className="text-muted-foreground text-lg font-bold mt-1 opacity-70 italic">مُزامنة ذكية، اضغط على أي جملة للانتقال إليها مباشرة.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                        <InteractiveTranscript transcript={lecture.transcript || []} />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0 outline-none">
            {user ? (
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
                    <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 border-b border-white/5 pb-10">
                        <div className="flex items-center gap-5">
                            <div className="p-5 bg-primary/20 rounded-[2rem] shadow-inner">
                                <Notebook className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black font-headline text-white tracking-tighter">مختبر الملاحظات</h2>
                                <p className="text-muted-foreground text-lg font-bold mt-1 opacity-70 italic">سجل فوائدك الربانية هنا.. فهي ذخرك الحقيقي.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> مشفرة بالكامل
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <LectureNotes lecture={lecture} userId={user.uid} />
                    </div>
                </div>
            ) : (
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-24 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                <Notebook className="h-24 w-24 text-muted-foreground/20 mb-8" />
                <h3 className="text-3xl font-black font-headline mb-4 text-white">تحتاج لمفتاح لدخول هذا المختبر</h3>
                <p className="text-xl text-muted-foreground max-w-md mb-10 font-bold opacity-60 italic leading-relaxed">الرجاء تسجيل الدخول لتتمكن من كتابة وحفظ ومراجعة ملاحظاتك الخاصة على هذه المحاضرة في مساحتك السرية.</p>
                <Button asChild className="rounded-2xl px-12 h-16 text-xl font-black shadow-2xl shadow-primary/30" size="lg">
                    <Link href={`/auth/login?redirect_to=/lectures/${lecture.slug}`}>تسجيل الدخول الآن</Link>
                </Button>
                </div>
            )}
            </TabsContent>

            <TabsContent value="comments" className="mt-0 outline-none">
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
                <div className="relative z-10">
                    <CommentsSection lectureId={lecture.id} />
                </div>
            </div>
            </TabsContent>
        </Tabs>
      </motion.div>

    </div>
    <DownloaderModal
        isOpen={isDownloaderOpen}
        onOpenChange={setIsDownloaderOpen}
        formats={downloadFormats}
        title={lecture.title}
        videoId={videoId}
    />
    </>
  );
}
