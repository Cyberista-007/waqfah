
"use client"

import Link from "next/link"
import { Play, Share2, MicVocal, Clapperboard, ListVideo } from "lucide-react"
import { SiTelegram, SiYoutube } from "@icons-pack/react-simple-icons"
import { useState } from "react"

import type { Lecture } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "./audio-player-provider"
import { useToast } from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"
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
  const { playTrack } = useAudioPlayer();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const videoId = getYoutubeVideoId(lecture.youtubeUrl);

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

    return (
    <>
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 group border-2 border-transparent hover:border-primary/50 hover:shadow-primary/20 flex flex-col rounded-xl",
        "animate-fade-in-up"
        )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
        <CardHeader className="flex-grow">
            <CardTitle className="font-headline text-lg mb-2">
                 <Link href={`/lectures/${lecture.slug}`} className="hover:text-primary transition-colors">{lecture.title}</Link>
            </CardTitle>
            <CardDescription className="space-y-2">
                <div className="flex items-center gap-2">
                    <MicVocal className="w-4 h-4" />
                    <span>{lecture.sheikhName}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <ListVideo className="w-4 h-4" />
                    <Link href={`/series/${lecture.seriesId}`} className="hover:underline">{lecture.seriesTitle}</Link>
                </div>
            </CardDescription>
        </CardHeader>
        <CardFooter className="p-4 flex items-center justify-between bg-card">
            <Button onClick={handlePlay} variant="outline" size="sm">
                <Play className="w-4 h-4 me-2" />
                استماع
            </Button>
            <div className="flex items-center gap-1 shrink-0 ms-2">
                <FavoriteButton lectureId={lecture.id} />
                {lecture.telegramUrl && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors h-8 w-8">
                                    <a href={lecture.telegramUrl} target="_blank" rel="noopener noreferrer">
                                        <SiTelegram size={18} />
                                    </a>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>تيليجرام</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {videoId && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={() => setIsModalOpen(true)} variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors h-8 w-8">
                                    <SiYoutube size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>مشاهدة (يوتيوب)</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </CardFooter>
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
