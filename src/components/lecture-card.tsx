"use client"

import Image from "next/image"
import Link from "next/link"
import { Download, Heart, Play, Plus } from "lucide-react"

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

interface LectureCardProps {
  lecture: Lecture
}

export function LectureCard({ lecture }: LectureCardProps) {
  const placeholder = getPlaceholderImage(lecture.imageId)
  const { playTrack } = useAudioPlayer()
  const { toast } = useToast()

  const handlePlay = () => {
    playTrack({ src: lecture.audioSrc, title: lecture.title });
  }
  
  const handleFavorite = () => {
    toast({
      title: "تمت الإضافة إلى المفضلة",
      description: `تمت إضافة "${lecture.title}" إلى قائمة مفضلاتك.`,
    })
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-center gap-4">
      <Image
        src={placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/150/100`}
        alt={lecture.title}
        width={150}
        height={100}
        className="w-full sm:w-32 h-24 rounded-md object-cover"
        data-ai-hint={placeholder?.imageHint}
      />
      <div className="flex-grow">
        <Link
          href={`/lectures/${lecture.slug}`}
          className="text-lg font-semibold text-primary-foreground/80 hover:underline"
        >
          {lecture.title}
        </Link>
        <p className="text-muted-foreground text-sm">
          من <Link href={`/series/${lecture.seriesSlug}`} className="text-primary-foreground/60 hover:underline">{lecture.seriesTitle}</Link> - {lecture.duration} دقيقة
        </p>
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handlePlay} variant="ghost" size="icon" aria-label="استماع">
                <Play className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>استماع</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon" aria-label="تحميل">
                <a href={lecture.audioSrc} download>
                  <Download className="w-6 h-6" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>تحميل</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleFavorite} variant="ghost" size="icon" aria-label="إضافة للمفضلة">
                <Heart className="w-6 h-6 text-gray-400 hover:text-red-500 hover:fill-current" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>إضافة للمفضلة</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
