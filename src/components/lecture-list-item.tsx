"use client"

import type { Lecture } from "@/lib/types";
import Link from "next/link";
import { Button } from "./ui/button";
import { Download, Heart, Play } from "lucide-react";
import { useAudioPlayer } from "./audio-player-provider";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LectureListItemProps {
    lecture: Lecture;
    index: number;
}

export default function LectureListItem({ lecture, index }: LectureListItemProps) {
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

    return (
        <div className="bg-card text-card-foreground rounded-lg border p-4 flex items-center gap-4 transition-all hover:border-primary/50 hover:bg-primary/5">
            <span className="text-xl font-bold text-muted-foreground w-8 text-center">{index.toString().padStart(2, '0')}</span>
            <div className="flex-grow">
                <Link href={`/lectures/${lecture.slug}`} className="text-lg font-semibold text-foreground hover:text-primary hover:underline">
                    {lecture.title}
                </Link>
                <p className="text-sm text-muted-foreground">{lecture.duration} دقيقة</p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={handlePlay} variant="ghost" size="icon" aria-label="استماع">
                                <Play className="w-6 h-6 text-primary" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>استماع</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon" aria-label="تحميل">
                                <a href={lecture.audioSrc} download>
                                    <Download className="w-5 h-5 text-muted-foreground" />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>تحميل</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={handleFavorite} variant="ghost" size="icon" aria-label="إضافة للمفضلة">
                                <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 hover:fill-current" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>إضافة للمفضلة</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
