"use client"

import Link from "next/link"
import { Headphones, Play, Share2, Eye, Calendar, MessageSquare, Download, ListPlus, MoreVertical, Clock, Flag, PlaySquare, Loader2, Brain } from "lucide-react"
import { MediaThumbnail } from "./media-thumbnail"
import { useState, useMemo, memo } from "react"
import { format, subDays } from "date-fns";
import { ar } from 'date-fns/locale';

import type { Lecture, ListenHistoryItem, Playlist, Quiz, Program } from "@/lib/types"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { useAudioPlayer } from "./audio-player-provider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { FavoriteButton } from "./favorite-button"
import { cn, formatDuration, formatViews, getVideoIdFromUrl, getInitials } from "@/lib/utils"
import { getPlaceholderImage } from "@/lib/images"
import { useUser, useDoc } from "@/firebase"
import { AddToPlaylistDialog } from "./profile/add-to-playlist-dialog"
import { useRouter } from "next/navigation"
import { TooltipProvider } from "./ui/tooltip"
import { QuizDialog } from "./quiz-dialog"
import { DownloaderModal } from "./downloader-modal"

interface LectureCardProps {
  lecture: Lecture
  index?: number
  onCollapse?: () => void;
  pinnedMessage?: string;
  listenHistory?: ListenHistoryItem[];
  playlists?: Playlist[];
  programImageUrl?: string;
}

const LectureCardComponent = ({ 
    lecture, 
    index = 0, 
    pinnedMessage,
    listenHistory,
    playlists,
    programImageUrl,
}: LectureCardProps) => {
  const { playTrack, playIframe } = useAudioPlayer();
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false);
  const [downloadFormats, setDownloadFormats] = useState<any[]>([]);
  const [isFetchingFormats, setIsFetchingFormats] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const { data: programDoc } = useDoc<Program>(
    lecture.programId && programImageUrl === undefined ? `programs/${lecture.programId}` : null
  );
  const resolvedProgramImage = programImageUrl ?? programDoc?.imageUrl;

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
    const resolvedSrc = lecture.audioSrc || lecture.youtubeUrl || '';
    if (!resolvedSrc) {
      toast({
        variant: 'destructive',
        title: 'الرابط الصوتي غير متوفر',
        description: 'لا يوجد مصدر صوتي لهذه المحاضرة حالياً.',
      });
      return;
    }

    let startTime = 0;
    if (lectureHistory && lectureHistory.position && lectureHistory.duration && (lectureHistory.duration - lectureHistory.position) > 10 && lectureHistory.position > 5) {
        startTime = lectureHistory.position;
        toast({
            title: "تكملة الاستماع",
            description: `تم استئناف المحاضرة من حيث توقفت.`,
        });
    }
    playTrack({
      audioSrc: resolvedSrc,
      youtubeUrl: lecture.youtubeUrl,
      title: lecture.title,
      id: lecture.id,
      seriesId: lecture.seriesId,
      seriesSlug: lecture.seriesSlug,
      seriesTitle: lecture.seriesTitle,
      imageId: lecture.imageId,
      slug: lecture.slug,
      programName: lecture.programName,
      transcript: lecture.transcript,
    }, startTime);
  };

  const handleWatch = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (videoId) {
      playIframe({
        type: 'youtube',
        src: videoId,
        title: lecture.title,
        lectureId: lecture.id,
        seriesId: lecture.seriesId,
        programName: lecture.programName,
        slug: lecture.slug,
      });
    }
  };
  
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const lectureUrl = `${window.location.origin}/lectures/${lecture.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: lecture.title,
          text: lecture.description || lecture.title,
          url: lectureUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error("Web Share API failed, falling back to clipboard:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(lectureUrl);
      toast({ title: 'تم نسخ رابط المحاضرة!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
    }
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFetchingFormats) return;

    const ytUrl = lecture.youtubeUrl;
    if (ytUrl && (ytUrl.includes('youtube.com') || ytUrl.includes('youtu.be'))) {
      setIsFetchingFormats(true);
      try {
        const response = await fetch(`${window.location.origin}/api/youtube-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: ytUrl, getFormats: true }),
        });
        const data = await response.json();
        if (!response.ok || (data.status && data.status >= 400)) {
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

    const url = lecture.audioSrc;
    if (url) {
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lecture.title || 'lecture'}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({ title: 'بدأ التحميل!', description: 'جاري تحميل الملف الصوتي...' });
      } catch (err) {
        toast({ variant: 'destructive', title: 'حدث خطأ أثناء محاولة التنزيل' });
      }
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
    if (typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000);
    }
    if (typeof timestamp._seconds === 'number') {
      return new Date(timestamp._seconds * 1000);
    }
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  };

  const publicationDate = toDate(lecture.publishedAt) || toDate(lecture.createdAt);
  const dateText = publicationDate
    ? format(publicationDate, 'd MMMM yyyy', { locale: ar })
    : null;
  const isNew = publicationDate && publicationDate > subDays(new Date(), 7);

  return (
    <TooltipProvider delayDuration={100}>
      <article className="relative w-full group flex flex-col">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
          <Link
            href={`/lectures/${lecture.slug}`}
            className="absolute inset-0 z-10"
            aria-label={lecture.title}
          />
          <MediaThumbnail
            src={imageUrl}
            videoId={videoId}
            alt={lecture.title}
            fallbackTitle={lecture.title}
            priority={index < 4}
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />

          {/* Hover Play / Audio Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePlay();
                }}
                className="h-9 px-3.5 rounded-full bg-zinc-900/90 hover:bg-primary border border-white/25 hover:border-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                title="استماع (صوت)"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>صوت</span>
              </button>

              {videoId && (
                <button
                  onClick={handleWatch}
                  className="h-9 px-3.5 rounded-full bg-zinc-900/90 hover:bg-red-600 border border-white/25 hover:border-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  title="مشاهدة (فيديو)"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>فيديو</span>
                </button>
              )}
            </div>
          </div>

          {/* Top-right Audio-only indicator */}
          {!videoId && (
            <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md pointer-events-none bg-primary text-primary-foreground">
              <span>🎧 صوت</span>
            </div>
          )}

          {/* Optional New badge top-left */}
          {isNew && (
            <div className="absolute top-2.5 left-2.5 z-30 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-black rounded-md pointer-events-none">
              جديد
            </div>
          )}

          {/* Duration badge */}
          {lecture.duration > 0 && (
            <div
              className="absolute bottom-2.5 left-2.5 z-30 text-[11px] font-bold px-2.5 py-0.5 rounded-lg tabular-nums pointer-events-none shadow-sm"
              style={{
                backgroundColor: 'rgba(9, 9, 11, 0.84)',
                color: '#ffffff',
                borderRadius: '8px',
              }}
            >
              {formatDuration(lecture.duration)}
            </div>
          )}

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 pointer-events-none">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Clean Info Below Thumbnail */}
        <div className="mt-3 px-0.5 flex items-start justify-between gap-2.5">
          {/* Channel / Program Logo */}
          {lecture.programSlug && (
            <Link
              href={`/programs/${lecture.programSlug}`}
              className="shrink-0 mt-0.5"
              onClick={(e) => e.stopPropagation()}
              title={lecture.programName}
            >
              <Avatar className="h-9 w-9 border border-border bg-background">
                <AvatarImage src={resolvedProgramImage} alt={lecture.programName} referrerPolicy="no-referrer" className="object-cover" />
                <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                  {getInitials(lecture.programName || "P")}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}

          <div className="min-w-0 flex-1 space-y-1 text-right">
            {(dateText || (lecture.youtubeViewCount ?? 0) > 0) && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-medium">
                {dateText && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="truncate">{dateText}</span>
                  </div>
                )}
                {dateText && (lecture.youtubeViewCount ?? 0) > 0 && (
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                )}
                {(lecture.youtubeViewCount ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 shrink-0" />
                    <span>{formatViews(lecture.youtubeViewCount ?? 0)}</span>
                  </div>
                )}
              </div>
            )}

            <h3 className="font-bold text-sm md:text-[15px] leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              <Link href={`/lectures/${lecture.slug}`}>
                {lecture.title}
              </Link>
            </h3>

            {lecture.programName && (
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                {lecture.programSlug ? (
                  <Link
                    href={`/programs/${lecture.programSlug}`}
                    className="truncate hover:text-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {lecture.programName}
                  </Link>
                ) : (
                  <span className="truncate">{lecture.programName}</span>
                )}
              </p>
            )}

            {pinnedMessage && (
              <p className="text-[11px] text-primary/80 italic line-clamp-1 flex items-center gap-1.5 pt-0.5">
                <MessageSquare className="w-3 h-3 shrink-0" />
                <span className="truncate">{pinnedMessage}</span>
              </p>
            )}
          </div>

          {/* Subtle Quick Actions */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity -mt-0.5">
            <FavoriteButton lectureId={lecture.id} className="h-8 w-8 rounded-lg" />
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="المزيد من خيارات المحاضرة"
                  className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                <DropdownMenuItem onClick={handlePlay} className="gap-3 cursor-pointer py-2 text-emerald-500">
                  <Headphones className="w-4 h-4" />
                  <span className="font-bold">استماع للمحاضرة (صوت)</span>
                </DropdownMenuItem>

                {videoId && (
                  <DropdownMenuItem onClick={handleWatch} className="gap-3 cursor-pointer py-2 text-primary">
                    <Play className="w-4 h-4 fill-current" />
                    <span className="font-bold">مشاهدة المحاضرة (فيديو)</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(e); }} className="gap-3 cursor-pointer py-2">
                  <Clock className="w-4 h-4" />
                  <span>الحفظ في قائمة "المشاهدة لاحقاً"</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(e); }} className="gap-3 cursor-pointer py-2">
                  <ListPlus className="w-4 h-4" />
                  <span>حفظ في قائمة تشغيل</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleDownloadClick}
                  disabled={isFetchingFormats}
                  className="gap-3 cursor-pointer py-2"
                >
                  {isFetchingFormats ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isFetchingFormats ? 'جاري جلب صيغ التنزيل...' : 'تنزيل'}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleShare} className="gap-3 cursor-pointer py-2">
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {videoId && (
                  <DropdownMenuItem asChild className="py-2">
                    <a
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-3 cursor-pointer flex w-full items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PlaySquare className="w-4 h-4" />
                      <span>مشاهدة على يوتيوب</span>
                    </a>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsQuizOpen(true); }} className="gap-3 cursor-pointer py-2">
                  <Brain className="w-4 h-4" />
                  <span>اختبر معرفتك</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "شكراً لبلاغك. سيتم مراجعة المحتوى." }); }} className="gap-3 cursor-pointer py-2 opacity-70 hover:opacity-100">
                  <Flag className="w-4 h-4" />
                  <span>إبلاغ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </article>
      
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

      <DownloaderModal
        isOpen={isDownloaderOpen}
        onOpenChange={setIsDownloaderOpen}
        formats={downloadFormats}
        title={lecture.title}
        videoId={videoId}
      />
    </TooltipProvider>
  )
}

export const LectureCard = memo(LectureCardComponent)
