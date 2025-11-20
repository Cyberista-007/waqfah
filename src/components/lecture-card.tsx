
"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Share2, MicVocal } from "lucide-react"
import { SiTelegram, SiYoutube } from "@icons-pack/react-simple-icons"
import { useState } from "react"

import type { Lecture } from "@/lib/types"
import { getPlaceholderImage } from "@/lib/images"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "./audio-player-provider"
import { useToast } from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card } from "./ui/card"
import { FavoriteButton } from "./favorite-button"
import { cn } from "@/lib/utils"
import { YoutubePlayerModal } from "./youtube-player-modal"

interface LectureCardProps {
  lecture: Lecture;
  index?: number;
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
  const placeholder = getPlaceholderImage(lecture.imageId)
  const { playTrack } = useAudioPlayer();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const videoId = getYoutubeVideoId(lecture.youtubeUrl);

    const handlePlay = () => {
        // Priority to video if it exists
        if (videoId) {
            setIsModalOpen(true);
        } else {
            // Fallback to audio
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
        }
    };

    const copyLinkToClipboard = () => {
        const url = window.location.origin + `/lectures/${lecture.slug}`;
        navigator.clipboard.writeText(url);
        toast({
            title: "تم نسخ الرابط",
            description: "يمكنك الآن مشاركة الرابط.",
        });
    };

    const handleShare = () => {
        const url = window.location.origin + `/lectures/${lecture.slug}`;
        if (navigator.share) {
            navigator.share({
                title: lecture.title,
                text: `استمع إلى محاضرة "${lecture.title}"`,
                url: url,
            }).catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error("Share failed:", error);
                    copyLinkToClipboard();
                }
            });
        } else {
            copyLinkToClipboard();
        }
    };


  return (
    <>
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 group border-2 border-transparent hover:border-primary/50 hover:shadow-primary/20 flex flex-col rounded-xl",
        "animate-fade-in-up"
        )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative">
        <div onClick={handlePlay} className="block cursor-pointer">
          <Image
            src={placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/400/300`}
            alt={lecture.title}
            width={400}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={placeholder?.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-white/20 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 scale-90 group-hover:scale-100 active:scale-95 flex items-center justify-center">
            <Play className="w-8 h-8 fill-current ms-1" />
          </div>
        </div>
        
        <div className="absolute top-2 right-2 flex items-center gap-2">
            <TooltipProvider>
                <FavoriteButton lectureId={lecture.id} />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleShare} variant="ghost" size="icon" className="text-white bg-black/30 backdrop-blur-sm hover:bg-black/50 hover:text-white rounded-full h-10 w-10">
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>مشاركة</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>

        <div className="absolute bottom-4 right-4 text-white text-right">
             <h3 className="font-headline text-2xl font-bold drop-shadow-lg">
                <Link href={`/lectures/${lecture.slug}`} className="hover:text-primary transition-colors">{lecture.title}</Link>
            </h3>
            <p className="text-sm mt-1 flex items-center justify-end gap-2 drop-shadow-md">
                <MicVocal className="w-4 h-4" />
                <span>{lecture.sheikhName}</span>
            </p>
        </div>
      </div>
      <div className="p-4 flex-grow flex items-center justify-between bg-card">
         <h3 className="font-headline text-md font-bold flex-grow text-right truncate">
          <Link href={`/lectures/${lecture.slug}`} className="hover:text-primary transition-colors">{lecture.title}</Link>
        </h3>
        <div className="flex items-center gap-2 shrink-0 ms-2">
             {lecture.telegramUrl && (
                <a href={lecture.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <SiTelegram size={20} />
                </a>
            )}
            {videoId && (
                 <button onClick={() => setIsModalOpen(true)} className="text-muted-foreground hover:text-primary transition-colors">
                    <SiYoutube size={20} />
                </button>
            )}
        </div>
      </div>
    </Card>
    {videoId && (
        <YoutubePlayerModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoId={videoId}
        />
    )}
    </>
  )
}
