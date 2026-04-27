"use client"

import Link from "next/link"
import Image from "next/image"
import { Headphones, Play, Share2, Eye, MessageSquare, Calendar, Download, ListPlus } from "lucide-react"
import { useState, useMemo, useRef, memo } from "react"
import { format, subDays } from "date-fns";
import { ar } from 'date-fns/locale';

import type { Lecture, ListenHistoryItem, Playlist } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "./audio-player-provider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { FavoriteButton } from "./favorite-button"
import { cn, formatDuration, formatViews, getVideoIdFromUrl, getInitials } from "@/lib/utils"
import { getPlaceholderImage } from "@/lib/images"
import { useUser, useDoc } from "@/firebase"
import { Program } from "@/lib/types"
import { AddToPlaylistDialog } from "./profile/add-to-playlist-dialog"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Brain } from "lucide-react"
import { QuizDialog } from "./quiz-dialog"
import type { Quiz } from "@/lib/types"
import { motion } from "framer-motion"
import { ThreeDTilt } from "./ui/three-d-tilt"

interface LectureCardProps {
  lecture: Lecture
  index?: number
  onCollapse?: () => void;
  pinnedMessage?: string;
  listenHistory?: ListenHistoryItem[];
  playlists?: Playlist[];
}

const LectureCardComponent = ({ 
    lecture, 
    index = 0, 
    pinnedMessage,
    listenHistory,
    playlists 
}: LectureCardProps) => {
  const { playTrack } = useAudioPlayer();
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const { data: programDoc } = useDoc<Program>(lecture.programId ? `programs/${lecture.programId}` : null);

  const videoId = getVideoIdFromUrl(lecture.youtubeUrl);
  const placeholder = getPlaceholderImage(lecture.imageId);

  const imageUrl = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/400/225`;

  const lectureHistory = useMemo(() => 
    listenHistory?.find(item => item.lectureId === lecture.id),
    [listenHistory, lecture.id]
  );
  
  const handlePlay = () => {
    let startTime = 0;
    if (lectureHistory && lectureHistory.position && lectureHistory.duration && (lectureHistory.duration - lectureHistory.position) > 10 && lectureHistory.position > 5) {
        startTime = lectureHistory.position;
        toast({
            title: "تكملة الاستماع",
            description: `تم استئناف المحاضرة من حيث توقفت.`,
        });
    }
    playTrack({
      audioSrc: lecture.audioSrc,
      title: lecture.title,
      id: lecture.id,
      seriesId: lecture.seriesId,
      seriesSlug: lecture.seriesSlug,
      seriesTitle: lecture.seriesTitle,
      imageId: lecture.imageId,
      slug: lecture.slug,
      programName: lecture.programName,
    }, startTime);
  };
  
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const lectureUrl = `${window.location.origin}/lectures/${lecture.slug}`;
    try {
      await navigator.clipboard.writeText(lectureUrl);
      toast({ title: 'تم نسخ رابط المحاضرة!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = lecture.audioSrc;
    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      const newUrl = "ss" + url.substring(url.indexOf('youtube.com'));
      window.open(newUrl, '_blank');
    } else if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = lecture.title || 'lecture';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
        toast({ variant: 'destructive', title: 'رابط التحميل غير متوفر' });
    }
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
        toast({ variant: "destructive", title: "يرجى تسجيل الدخول أولاً."});
        router.push(`/auth/login?redirect_to=/lectures/${lecture.slug}`);
        return;
    }
    setIsPlaylistDialogOpen(true);
  }

  const handleMouseEnter = () => {
      if (videoId) {
          hoverTimeout.current = setTimeout(() => {
              setIsHovering(true);
          }, 500);
      }
  };

  const handleMouseLeave = () => {
      if (hoverTimeout.current) {
          clearTimeout(hoverTimeout.current);
      }
      setIsHovering(false);
  };

  const sampleQuiz: Quiz = {
    id: `quiz-${lecture.id}`,
    lectureId: lecture.id,
    title: `اختبار: ${lecture.title}`,
    rewardPoints: 50,
    createdAt: lecture.createdAt,
    questions: [
      {
        question: "ما هو الهدف الرئيسي من هذه المحاضرة؟",
        options: ["نشر الوعي العلمي", "الترفيه فقط", "تقديم معلومات عامة", "لا شيء مما سبق"],
        correctAnswer: 0,
        explanation: "تهدف محاضرات منصة وقفة دائماً إلى ترسيخ الوعي العلمي الشرعي الرصين."
      },
      {
        question: "كيف يمكن لطالب العلم الاستفادة القصوى من المحتوى؟",
        options: ["الاستماع السريع", "التدوين والتدبر", "تجاهل المصادر", "الاكتفاء بالعنوان"],
        correctAnswer: 1,
        explanation: "التدوين والتدبر هما مفتاح الحفظ والفهم في طلب العلم."
      },
      {
        question: "هل المحتوى متاح للتحميل؟",
        options: ["نعم، الصوتي فقط", "نعم، المرئي فقط", "نعم، كلاهما", "لا، متاح للاستماع فقط"],
        correctAnswer: 2,
        explanation: "تتيح المنصة تحميل المحتوى الصوتي والمرئي لسهولة الوصول إليه في أي وقت."
      }
    ]
  };
  
  const progress = useMemo(() => {
    if (!lectureHistory || !lectureHistory.duration) return 0;
    return (lectureHistory.position / lectureHistory.duration) * 100;
  }, [lectureHistory]);
  
  const toDate = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  };

  const publicationDate = toDate(lecture.publishedAt) || toDate(lecture.createdAt);
  const dateText = publicationDate 
    ? format(publicationDate, 'EEEE، d MMMM yyyy', { locale: ar })
    : null;

  const isNew = publicationDate && publicationDate > subDays(new Date(), 7);

  return (
    <TooltipProvider delayDuration={100}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="h-full"
      >
        <ThreeDTilt tiltMax={8} className="h-full">
            <div 
                className={cn(
                "group relative flex flex-col h-full rounded-[2rem] transition-all duration-500 transform-gpu",
                "bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl",
                "hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:bg-white/[0.08]"
                )}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* Media Container */}
                <div className="relative aspect-video overflow-hidden bg-black/40 flex-shrink-0 border-b border-white/10">
                    <Link href={`/lectures/${lecture.slug}`} className="absolute inset-0 z-10" aria-hidden="true" tabIndex={-1} />
                    <Image
                        src={imageUrl}
                        alt={lecture.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={index < 4}
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-100"
                    />

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />
                    
                    {/* Play Button Overlay */}
                    <Link 
                        href={`/lectures/${lecture.slug}`}
                        className={cn(
                            "absolute inset-0 flex items-center justify-center transition-all duration-500 z-20 cursor-pointer",
                            isHovering ? "opacity-0" : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                        )}
                    >
                        <div className="h-14 w-14 bg-primary/20 backdrop-blur-xl border border-primary/40 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </div>
                    </Link>

                    {/* Top Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
                        {isNew && (
                            <div className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg animate-pulse flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                جديد
                            </div>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={handleShare}
                                    className="h-9 w-9 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-2xl hover:bg-primary transition-all duration-300 border border-white/10 group/share"
                                >
                                    <Share2 className="w-4 h-4 text-white group-hover/share:scale-110" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="left">مشاركة</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Duration Badge */}
                    {lecture.duration > 0 && (
                        <div className="absolute bottom-4 left-4 z-30">
                            <div className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-white text-[10px] font-mono">
                                {formatDuration(lecture.duration)}
                            </div>
                        </div>
                    )}

                    {/* Progress Bar */}
                    {progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
                            <div 
                                className="h-full bg-primary transition-all duration-500" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                    )}
                </div>

                {/* Content Container */}
                <div className="p-5 flex-grow flex flex-col gap-4 relative z-20 bg-[#09090b]/40">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                            {dateText && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    <span>{dateText}</span>
                                </div>
                            )}
                            {(lecture.youtubeViewCount ?? 0) > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-3 h-3" />
                                        <span>{formatViews(lecture.youtubeViewCount ?? 0)} مشاهدة</span>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <h3 className="font-headline text-xl leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                            <Link href={`/lectures/${lecture.slug}`}>
                                {lecture.title}
                            </Link>
                        </h3>
                    </div>

                    {pinnedMessage && (
                        <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10">
                            <p className="text-xs text-primary/80 italic leading-relaxed flex gap-2">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                            <span className="line-clamp-2">{pinnedMessage}</span>
                            </p>
                        </div>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-2">
                            {lecture.programSlug && (
                                <Link 
                                    href={`/programs/${lecture.programSlug}`}
                                    className="transition-transform hover:scale-110 active:scale-95"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Avatar className="h-10 w-10 border-2 border-primary/20 bg-background shadow-lg">
                                        <AvatarImage src={programDoc?.imageUrl} alt={lecture.programName} className="object-cover" />
                                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                            {getInitials(lecture.programName || "P")}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                            )}
                            <div className="flex items-center gap-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button 
                                            onClick={handlePlay} 
                                            className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                        >
                                            <Headphones className="w-5 h-5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>استماع</TooltipContent>
                                </Tooltip>
                                
                                {videoId && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a 
                                              href={`https://www.youtube.com/watch?v=${videoId}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="h-10 w-10 flex items-center justify-center p-2 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#FF0000]" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFF" />
                                                </svg>
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>يوتيوب</TooltipContent>
                                    </Tooltip>
                                )}

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button 
                                            onClick={handleDownloadClick} 
                                            className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-all"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>تحميل</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button 
                                        onClick={handleAddToPlaylist} 
                                        className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                    >
                                        <ListPlus className="w-5 h-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>إضافة لقائمة</TooltipContent>
                            </Tooltip>
                            <FavoriteButton lectureId={lecture.id} className="h-10 w-10 rounded-xl" />
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button 
                                        onClick={() => setIsQuizOpen(true)} 
                                        className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                    >
                                        <Brain className="w-5 h-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>اختبر معرفتك</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </ThreeDTilt>
      </motion.div>
      
      {user && (
        <AddToPlaylistDialog
            isOpen={isPlaylistDialogOpen}
            onOpenChange={setIsPlaylistDialogOpen}
            lectureId={lecture.id}
            userPlaylists={playlists || []}
        />
      )}

      <QuizDialog 
        isOpen={isQuizOpen}
        onOpenChange={setIsQuizOpen}
        quiz={sampleQuiz}
      />
    </TooltipProvider>
  )
}

export const LectureCard = memo(LectureCardComponent)
