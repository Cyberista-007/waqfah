
"use client"

import Link from "next/link"
import Image from "next/image"
import { Headphones, Play, Share2, Youtube, ListPlus, Download, Clock, Minimize2, Podcast, Eye, PictureInPicture, MessageSquare, Calendar } from "lucide-react"
import { useState, useMemo, useRef, memo, Fragment } from "react"
import { formatDistanceToNow } from "date-fns";
import { ar } from 'date-fns/locale';

import type { Lecture, ListenHistoryItem, Playlist } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "./audio-player-provider"
import { useToast } from "@/hooks/use-toast"
import {
  Card,
  CardFooter,
} from "./ui/card"
import { FavoriteButton } from "./favorite-button"
import { cn, formatDuration, formatViews } from "@/lib/utils"
import { getPlaceholderImage } from "@/lib/images"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { Progress } from "./ui/progress"
import { AddToPlaylistDialog } from "./profile/add-to-playlist-dialog"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface LectureCardProps {
  lecture: Lecture
  index?: number
  onCollapse?: () => void;
  pinnedMessage?: string;
}

function getYoutubeVideoId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const videoUrl = new URL(url);
    if (videoUrl.hostname === 'youtu.be') {
      return videoUrl.pathname.slice(1);
    }
    if (videoUrl.hostname.includes('youtube.com')) {
      const videoId = videoUrl.searchParams.get('v');
      if (videoId) {
        return videoId;
      }
    }
  } catch (error) {
    console.error("Invalid YouTube URL", error);
    return null;
  }
  return null;
}

const LectureCardComponent = ({ lecture, index = 0, onCollapse, pinnedMessage }: LectureCardProps) => {
  const { playTrack, playIframe } = useAudioPlayer();
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory } = useCollection<ListenHistoryItem>(listenHistoryPath);
  
  const playlistsPath = user ? `users/${user.uid}/playlists` : null;
  const { data: playlists } = useCollection<Playlist>(playlistsPath);

  const videoId = getYoutubeVideoId(lecture.youtubeUrl);
  const placeholder = getPlaceholderImage(lecture.imageId);

  const imageUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
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
      // Fallback for non-YouTube links
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

  const handleOpenVideo = () => {
    if (videoId) {
        playIframe({ type: 'youtube', src: videoId, title: lecture.title });
    } else {
        handlePlay();
    }
  };

  const handleMouseEnter = () => {
      if (videoId) {
          hoverTimeout.current = setTimeout(() => {
              setIsHovering(true);
          }, 500); // Delay before video starts playing
      }
  };

  const handleMouseLeave = () => {
      if (hoverTimeout.current) {
          clearTimeout(hoverTimeout.current);
      }
      setIsHovering(false);
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
    ? formatDistanceToNow(publicationDate, { addSuffix: true, locale: ar })
    : null;

  const metaItems = [];
    if (dateText) {
        metaItems.push(
            <div key="date" className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{dateText}</span>
            </div>
        );
    }
    if (lecture.youtubeViewCount && lecture.youtubeViewCount > 0) {
        metaItems.push(
            <div key="views" className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{formatViews(lecture.youtubeViewCount)}</span>
            </div>
        );
    }
    if (lecture.duration > 0) {
        metaItems.push(
            <div key="duration" className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(lecture.duration)}</span>
            </div>
        );
    }

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out group border-2 border-transparent focus-within:border-primary/50 hover:border-primary/50 focus-within:shadow-primary/20 hover:shadow-primary/20 focus-within:shadow-lg hover:shadow-lg flex flex-col rounded-xl transform-gpu hover:-translate-y-2 hover:scale-105 hover:rotate-[-2deg]",
          "animate-fade-in-up"
        )}
        style={{ animationDelay: `${index * 100}ms` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-video overflow-hidden" >
            <Link href={`/lectures/${lecture.slug}`} className="absolute inset-0" aria-hidden="true" tabIndex={-1} />
             {isHovering && videoId ? (
                <div className="pip-wrapper absolute inset-0">
                  <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}`}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      className="w-full h-full"
                  ></iframe>
                </div>
            ) : (
                <Image
                    src={imageUrl}
                    alt={lecture.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 image-theme-filter"
                    data-ai-hint={placeholder?.imageHint || 'lecture content'}
                />
            )}

              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                onClick={handleOpenVideo}
              />
          
            <div 
                className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity cursor-pointer",
                    isHovering ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                )}
                 onClick={handleOpenVideo}
            >
              <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                 <Play className="w-8 h-8 text-white fill-current ml-1" />
              </div>
            </div>
            
            <div className="absolute top-2 right-2 flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={handleShare}
                            className="h-8 w-8 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                            aria-label="Share"
                        >
                            <Share2 className="w-4 h-4 text-white" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>مشاركة المحاضرة</p>
                    </TooltipContent>
                </Tooltip>
            </div>

          {lecture.programName && lecture.programSlug && (
             <div className="absolute bottom-2 right-2 text-white text-xs font-semibold">
                <Link href={`/programs/${lecture.programSlug}`} className="flex items-center gap-1 hover:underline">
                    <Podcast className="w-3 h-3" />
                    <span>{lecture.programName}</span>
                </Link>
            </div>
          )}


          {progress > 0 && progress < 95 && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5">
                  <Progress value={progress} className="h-full rounded-none" />
              </div>
          )}

        </div>

        <div className="p-3 bg-card flex-grow flex flex-col">
          <div className="flex-grow pb-2">
            <div className="mb-2 inline-flex items-center gap-x-2 bg-black/60 text-white/90 text-xs font-semibold rounded-full px-2.5 py-1">
                {metaItems.map((item, index) => (
                    <Fragment key={index}>
                        {item}
                        {index < metaItems.length - 1 && <span className="opacity-70">·</span>}
                    </Fragment>
                ))}
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-headline text-lg leading-tight text-right w-full">
                    <Link href={`/lectures/${lecture.slug}`} className="hover:text-primary transition-colors line-clamp-2">{lecture.title}</Link>
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{lecture.title}</p>
                </TooltipContent>
            </Tooltip>
          </div>
          {pinnedMessage && (
              <div className="pt-2 pb-1">
                  <p className="text-xs text-muted-foreground italic border-r-2 border-primary/50 pr-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 shrink-0"/> 
                    <span className="line-clamp-2">{pinnedMessage}</span>
                  </p>
              </div>
          )}
          <div className="flex justify-between items-center mt-auto pt-2 border-t">
            <div className="flex items-center gap-1">
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button onClick={handlePlay} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                          <Headphones className="w-5 h-5" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>استماع صوتي</p>
                  </TooltipContent>
              </Tooltip>
              {videoId && (
                <>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button onClick={handleOpenVideo} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-500">
                              <Youtube className="w-5 h-5" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>مشاهدة على يوتيوب</p>
                      </TooltipContent>
                  </Tooltip>
                </>
              )}
               <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleDownloadClick} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                            <Download className="w-5 h-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>تحميل</p>
                    </TooltipContent>
                </Tooltip>
            </div>
                
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={handleAddToPlaylist} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                                <ListPlus className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>إضافة إلى قائمة</p>
                        </TooltipContent>
                    </Tooltip>
                    <FavoriteButton lectureId={lecture.id} className="h-9 w-9" />
                    {onCollapse && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={onCollapse} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                                    <Minimize2 className="h-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>تصغير</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
      </Card>
       {user && (
        <AddToPlaylistDialog
            isOpen={isPlaylistDialogOpen}
            onOpenChange={setIsPlaylistDialogOpen}
            lectureId={lecture.id}
            userPlaylists={playlists || []}
        />
      )}
    </TooltipProvider>
  )
}
export const LectureCard = memo(LectureCardComponent)
