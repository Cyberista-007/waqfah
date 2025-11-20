
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
          "overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 group border-2 border-transparent hover:border-primary/50 hover:shadow-primary/20 flex flex-col rounded-xl",
          "animate-fade-in-up"
        )}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <Link href={`/lectures/${lecture.slug}`} className="block">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={imageUrl}
              alt={lecture.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleImageClick}
            >
              <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer">
                 <Play className="w-8 h-8 text-white fill-current ml-1" />
              </div>
            </div>
            <div className="absolute top-2 right-2">
                <FavoriteButton lectureId={lecture.id} />
            </div>
          </div>
        </Link>
        <CardHeader className="flex-grow p-4">
          <CardTitle className="font-headline text-lg mb-1 leading-snug">
            <Link href={`/lectures/${lecture.slug}`} className="hover:text-primary transition-colors">{lecture.title}</Link>
          </CardTitle>
          <CardDescription className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <MicVocal className="w-3.5 h-3.5" />
              <span>{lecture.sheikhName}</span>
            </div>
            <div className="flex items-center gap-2">
              <ListVideo className="w-3.5 h-3.5" />
              <Link href={`/series/${lecture.seriesId}`} className="hover:underline">{lecture.seriesTitle}</Link>
            </div>
          </CardDescription>
        </CardHeader>
        <CardFooter className="p-4 pt-0">
            <Button onClick={handlePlay} className="w-full">
                <Play className="w-4 h-4 me-2" />
                استماع الآن
            </Button>
        </CardFooter>
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
