
"use client"

import type { Lecture } from "@/lib/types";
import Link from "next/link";
import { Button } from "./ui/button";
import { Download, Play, Share2 } from "lucide-react";
import { useAudioPlayer } from "./audio-player-provider";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { getPlaceholderImage } from "@/lib/images";
import { cn } from "@/lib/utils";
import { SiYoutube } from "@icons-pack/react-simple-icons";

interface LectureListItemProps {
    lecture: Lecture;
    index: number;
}

export function LectureListItem({ lecture, index }: LectureListItemProps) {
    const { playTrack } = useAudioPlayer();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handlePlay = async () => {
      let startTime = 0;
      if (user && firestore) {
        const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', lecture.id);
        const historySnap = await getDoc(historyRef);
        if (historySnap.exists()) {
          const data = historySnap.data();
          if (data.position && data.duration && (data.duration - data.position) > 10 && data.position > 5) {
            startTime = data.position;
             toast({
                title: "تكملة الاستماع",
                description: `تم استئناف المحاضرة من حيث توقفت.`,
            });
          }
        }
      }

      playTrack({ 
          audioSrc: lecture.audioSrc, 
          title: lecture.title,
          id: lecture.id,
          seriesId: lecture.seriesId,
          seriesSlug: lecture.seriesSlug,
          seriesTitle: lecture.seriesTitle,
          imageId: lecture.imageId,
          slug: lecture.slug,
      }, startTime);
    };

    const handleShare = async () => {
        const lectureUrl = `${window.location.origin}/lectures/${lecture.slug}`;
        const shareData = {
            title: `محاضرة: ${lecture.title}`,
            text: `استمع إلى محاضرة "${lecture.title}" على موقع وقفة`,
            url: lectureUrl,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                 await navigator.clipboard.writeText(lectureUrl);
                 toast({ title: 'تم نسخ رابط المحاضرة!' });
            }
        } catch (error) {
            console.error('Error sharing lecture:', error);
            await navigator.clipboard.writeText(lectureUrl);
            toast({ title: 'تم نسخ رابط المحاضرة!' });
        }
    };


    const placeholder = getPlaceholderImage(lecture.imageId);
    const hasYoutube = lecture.youtubeUrl && lecture.youtubeUrl.length > 5;

    return (
        <div className="bg-card text-card-foreground rounded-xl border p-3 flex items-center gap-4 transition-all hover:border-primary/50 hover:bg-primary/5 animate-slide-in" style={{animationDelay: `${index * 50}ms`, animationFillMode: 'backwards'}}>
            <span className="text-lg font-bold text-muted-foreground w-8 text-center">{index.toString().padStart(2, '0')}</span>
            <div className="relative w-28 h-20 rounded-md overflow-hidden shrink-0">
                 <Image 
                    src={placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/200/150`}
                    alt={lecture.title}
                    fill
                    className="object-cover"
                    data-ai-hint={placeholder?.imageHint || "lecture content"}
                 />
                 <div 
                    className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={handlePlay}
                 >
                    <Play className="w-8 h-8 text-white fill-current" />
                 </div>
            </div>
            <div className="flex-grow">
                <Link href={`/lectures/${lecture.slug}`} className="text-md font-semibold text-foreground hover:text-primary hover:underline">
                    {lecture.title}
                </Link>
                <p className="text-sm text-muted-foreground">{lecture.seriesTitle}</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2">
                {hasYoutube && (
                    <Button variant="ghost" size="icon" asChild>
                        <a href={lecture.youtubeUrl} target="_blank" rel="noopener noreferrer">
                            <SiYoutube className="w-5 h-5 text-red-500"/>
                        </a>
                    </Button>
                )}
                 <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="w-5 h-5 text-muted-foreground" />
                 </Button>
            </div>
        </div>
    );
}
