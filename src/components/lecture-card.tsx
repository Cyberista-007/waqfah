"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Share2, Heart } from "lucide-react"

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
  const { playTrack } = useAudioPlayer();
  const { toast } = useToast();

    const handlePlay = () => {
        playTrack({ src: lecture.audioSrc, title: lecture.title });
    };

    const handleFavorite = () => {
        toast({
            title: "تمت الإضافة إلى المفضلة",
            description: `تمت إضافة "${lecture.title}" إلى قائمة مفضلاتك.`,
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: lecture.title,
                text: `استمع إلى محاضرة "${lecture.title}"`,
                url: window.location.origin + `/lectures/${lecture.slug}`,
            }).catch(console.error);
        } else {
            toast({
                title: "تم نسخ الرابط",
                description: "يمكنك الآن مشاركة الرابط.",
            });
            navigator.clipboard.writeText(window.location.origin + `/lectures/${lecture.slug}`);
        }
    };


  return (
    <Card className="overflow-hidden transition-transform transform hover:-translate-y-1 group flex flex-col">
      <div className="relative">
        <Link href={`/lectures/${lecture.slug}`} className="block">
          <Image
            src={placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/400/300`}
            alt={lecture.title}
            width={400}
            height={300}
            className="w-full h-48 object-cover"
            data-ai-hint={placeholder?.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </Link>
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleFavorite} variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 hover:text-red-500 rounded-full h-10 w-10">
                            <Heart className="w-5 h-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>إضافة للمفضلة</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleShare} variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 hover:text-white rounded-full h-10 w-10">
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>مشاركة</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <Button onClick={handlePlay} variant="ghost" size="icon" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-white/20 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/30">
            <Play className="w-8 h-8 fill-current" />
        </Button>
      </div>
      <div className="bg-card-foreground text-card p-4 flex-grow">
        <h3 className="font-headline text-xl font-bold truncate">
          <Link href={`/lectures/${lecture.slug}`} className="hover:underline">{lecture.title}</Link>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{lecture.seriesTitle}</p>
      </div>
    </Card>
  )
}
