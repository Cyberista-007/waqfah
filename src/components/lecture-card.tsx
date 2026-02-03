
"use client"

import Link from "next/link"
import Image from "next/image"
import { Headphones, Play, Share2, Youtube, ListPlus, Download, Clock, Minimize2, Podcast, Eye } from "lucide-react"
import { useState, useMemo, useRef, memo } from "react"

import type { Lecture, ListenHistoryItem, Playlist } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "./audio-player-provider"
import { useToast } from "@/hooks/use-toast"
import {
  Card,
} from "./ui/card"
import { FavoriteButton } from "./favorite-button"
import { cn, formatDuration } from "@/lib/utils"
import { YoutubePlayerModal } from "./youtube-player-modal"
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

const LectureCardComponent = ({ lecture, index = 0, onCollapse }: LectureCardProps) => {
  const { playTrack } = useAudioPlayer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory } = useCollection<ListenHistoryItem>(listenHistoryPath);
  
  const playlistsPath = user ? `users/${user.uid}/playlists` : null;
  const { data: playlists } = useCollection<Playlist>(playlistsPath);

  const videoId = getYoutubeVideoId(lecture.youtubeUrl);
  const placeholder = getPlaceholderImage(lecture.imageId);

  const imageUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/400/225`;

  const handlePlay = () => {
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
    });
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

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (videoId) {
        setIsModalOpen(true);
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


  const lectureHistory = useMemo(() => 
    listenHistory?.find(item => item.lectureId === lecture.id),
    [listenHistory, lecture.id]
  );
  
  const progress = useMemo(() => {
    if (!lectureHistory || !lectureHistory.duration) return 0;
    return (lectureHistory.position / lectureHistory.duration) * 100;
  }, [lectureHistory]);
  
  const displayDurationInSeconds = lecture.duration || 0;

  const hasChannel = lecture.channelName && lecture.channelSlug;

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out group border-2 border-transparent focus-within:border-primary/50 hover:border-primary/50 focus-within:shadow-primary/20 hover:shadow-primary/20 focus-within:shadow-lg hover:shadow-lg flex flex-col rounded-xl",
          "animate-fade-in-up"
        )}
        style={{ animationDelay: `${index * 100}ms` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-video overflow-hidden" >
            <Link href={`/lectures/${lecture.slug}`} className="absolute inset-0" aria-hidden="true" tabIndex={-1} />
             {isHovering && videoId ? (
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    className="w-full h-full absolute top-0 left-0"
                ></iframe>
            ) : (
                <Image
                    src={imageUrl}
                    alt={lecture.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={placeholder?.imageHint || 'lecture content'}
                />
            )}

              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                onClick={handleImageClick}
              />
          
            <div 
                className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity cursor-pointer",
                    isHovering ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                )}
                 onClick={handleImageClick}
            >
              <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                 <Play className="w-8 h-8 text-white fill-current ml-1" />
              </div>
            </div>
            
            <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                    onClick={handleShare}
                    className="h-8 w-8 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Share"
                >
                    <Share2 className="w-4 h-4 text-white" />
                </button>
            </div>
            
            <div className="absolute top-2 left-2 flex gap-2">
              {displayDurationInSeconds > 0 && (
                <div className="text-white text-xs font-semibold flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(displayDurationInSeconds)}</span>
                </div>
              )}
              {lecture.youtubeViewCount && lecture.youtubeViewCount > 0 && videoId && (
                <div className="text-white text-xs font-semibold flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                    <Eye className="w-4 h-4" />
                    <span>{new Intl.NumberFormat('ar-EG').format(lecture.youtubeViewCount)}</span>
                </div>
              )}
            </div>

          {hasChannel ? (
            <div className="absolute bottom-2 right-2 text-white text-xs font-semibold">
                <Link href={`/channels/${lecture.channelSlug}`} className="flex items-center gap-1 hover:underline">
                    <Youtube className="w-3 h-3" />
                    <span>{lecture.channelName}</span>
                </Link>
            </div>
          ) : lecture.programName && lecture.programSlug && (
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
                <TooltipProvider delayDuration={500}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="font-headline text-lg mb-1 leading-tight">
                          <Link href={`/lectures/${lecture.slug}`} className="hover:text-primary transition-colors line-clamp-2">{lecture.title}</Link>
                      </h3>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{lecture.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            </div>
            <div className="flex justify-between items-center mt-auto pt-2">
                <div className="flex items-center gap-1">
                    <Button onClick={handlePlay} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                        <Headphones className="w-5 h-5" />
                    </Button>
                    {videoId && (
                        <Button onClick={() => setIsModalOpen(true)} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-500">
                            <Youtube className="w-5 h-5" />
                        </Button>
                    )}
                    {lecture.telegramUrl && (
                        <a href={lecture.telegramUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-sky-500">
                                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.17.91-.494 1.202-.82 1.23-.696.06-1.225-.46-1.9- .902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.794-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.04-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.24-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.39 4.027-1.633 4.476-1.636z"/></svg>
                            </Button>
                        </a>
                    )}
                    <Button onClick={handleDownloadClick} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                        <Download className="w-5 h-5" />
                    </Button>
                </div>
                
                <div className="flex items-center gap-1">
                    <Button onClick={handleAddToPlaylist} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                        <ListPlus className="w-5 h-5" />
                    </Button>
                    <FavoriteButton lectureId={lecture.id} className="h-9 w-9" />
                    {onCollapse && (
                        <Button onClick={onCollapse} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                            <Minimize2 className="h-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>

      </Card>
      {videoId && (
        <YoutubePlayerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoId={videoId}
          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/lectures/${lecture.slug}`}
        />
      )}
       {user && (
        <AddToPlaylistDialog
            isOpen={isPlaylistDialogOpen}
            onOpenChange={setIsPlaylistDialogOpen}
            lectureId={lecture.id}
            userPlaylists={playlists || []}
        />
      )}
    </>
  )
}
export const LectureCard = memo(LectureCardComponent)
