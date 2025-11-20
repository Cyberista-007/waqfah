
"use client"

import Link from "next/link"
import Image from "next/image"
import { Play, Share2, MicVocal, Clapperboard, ListVideo } from "lucide-react"
import { SiTelegram, SiYoutube } from "@icons-pack/react-simple-icons"
import { useState } from "react"

import type { Lecture } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "./audio-player-provider"
import { useToast } from "@/hooks/use-toast"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card"
import { FavoriteButton } from "./favorite-button"
import { cn } from "@/lib/utils"
import { YoutubePlayerModal } from "./youtube-player-modal"
import { getPlaceholderImage } from "@/lib/images"

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
  const { toast } = useToast();
  
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


  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (videoId) {
      setIsModalOpen(true);
    } else {
      handlePlay();
    }
  };

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out group border-2 border-transparent focus-within:border-primary/50 hover:border-primary/50 focus-within:shadow-primary/20 hover:shadow-primary/20 focus-within:shadow-lg hover:shadow-lg flex flex-col rounded-xl",
          "animate-fade-in-up"
        )}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="relative aspect-video overflow-hidden" onClick={handleImageClick}>
          <Link href={`/lectures/${lecture.slug}`} className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={lecture.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </Link>
            
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                 <Play className="w-8 h-8 text-white fill-current ml-1" />
              </div>
          </div>
            
          <button onClick={handleShare} className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/70 transition-colors">
            <Share2 className="w-4 h-4 text-white" />
          </button>
            
          <div className="absolute bottom-2 right-2 text-white text-xs font-semibold flex items-center gap-1">
             <MicVocal className="w-3 h-3" />
             <span>{lecture.sheikhName}</span>
          </div>

        </div>

        <div className="p-4 bg-card flex-grow flex flex-col">
            <h3 className="font-headline text-md mb-1 leading-snug flex-grow">
                <Link href={`/lectures/${lecture.slug}`} className="hover:text-primary transition-colors line-clamp-2">{lecture.title}</Link>
            </h3>
            <div className="flex justify-start items-center gap-2 mt-2">
                <Button onClick={handlePlay} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Play className="w-4 h-4" />
                </Button>
                {videoId && (
                  <Button onClick={() => setIsModalOpen(true)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                      <SiYoutube className="w-4 h-4" />
                  </Button>
                )}
                 {lecture.telegramUrl && (
                    <a href={lecture.telegramUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-sky-500">
                          <SiTelegram className="w-4 h-4" />
                        </Button>
                    </a>
                 )}
                 <div className="flex-grow"></div>
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
    </>
  )
}
