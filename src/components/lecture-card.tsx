
"use client"

import Link from "next/link"
import Image from "next/image"
import { Headphones, Play, Share2, MicVocal, ListPlus, Download, Clock } from "lucide-react"
import { SiTelegram, SiYoutube } from "@icons-pack/react-simple-icons"
import { useState, useMemo, useRef } from "react"

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

interface LectureCardProps {
  lecture: Lecture
  index?: number
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

export function LectureCard({ lecture, index = 0 }: LectureCardProps) {
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
            
          <button onClick={handleShare} className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/70 transition-colors">
            <Share2 className="w-4 h-4 text-white" />
          </button>
            
          {lecture.duration > 300 && (
            <div className="absolute top-2 left-2 text-white text-xs font-semibold flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(lecture.duration)}</span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 text-white text-xs font-semibold flex items-center gap-1">
             <MicVocal className="w-3 h-3" />
             <span>{lecture.sheikhName}</span>
          </div>

          {progress > 0 && progress < 95 && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5">
                  <Progress value={progress} className="h-full rounded-none" />
              </div>
          )}

        </div>

        <div className="p-4 bg-card flex-grow flex flex-col">
            <h3 className="font-headline text-md mb-1 leading-snug flex-grow">
                <Link href={`/lectures/${lecture.slug}`} className="hover:text-primary transition-colors line-clamp-2">{lecture.title}</Link>
            </h3>
            <div className="flex justify-start items-center gap-2 mt-2">
                <Button onClick={handlePlay} variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary">
                    <Headphones className="w-5 h-5" />
                </Button>
                {videoId && (
                  <Button onClick={() => setIsModalOpen(true)} variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-red-500">
                      <SiYoutube className="w-5 h-5" />
                  </Button>
                )}
                 {lecture.telegramUrl && (
                    <a href={lecture.telegramUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-sky-500">
                          <SiTelegram className="w-5 h-5" />
                        </Button>
                    </a>
                 )}
                 <Button asChild variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary">
                    <a href={lecture.audioSrc} download>
                        <Download className="w-5 h-5" />
                    </a>
                 </Button>
                 <div className="flex-grow"></div>
                 <Button onClick={handleAddToPlaylist} variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary">
                    <ListPlus className="w-5 h-5" />
                 </Button>
                 <FavoriteButton lectureId={lecture.id} />
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
