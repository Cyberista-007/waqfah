"use client"

import Image from "next/image"
import Link from "next/link"
import { Download, Heart, Play, Plus, Share2 } from "lucide-react"

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

interface LectureCardProps {
  lecture: Lecture
}

export function LectureCard({ lecture }: LectureCardProps) {
  const placeholder = getPlaceholderImage(lecture.imageId)

  return (
    <Card className="overflow-hidden transition-transform transform hover:-translate-y-1 group">
      <Link href={`/lectures/${lecture.slug}`} className="block relative">
        <Image
          src={placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/400/300`}
          alt={lecture.title}
          width={400}
          height={300}
          className="w-full h-40 object-cover"
          data-ai-hint={placeholder?.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <span>{lecture.duration}</span>
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
         <div className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full">
            <Share2 className="w-4 h-4"/>
        </div>
      </Link>
      <div className="bg-card-foreground text-card p-4">
        <h3 className="font-headline text-lg truncate">
          <Link href={`/lectures/${lecture.slug}`} className="hover:underline">{lecture.title}</Link>
        </h3>
      </div>
    </Card>
  )
}
