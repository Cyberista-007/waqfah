"use client"

import type { Lecture } from "@/lib/types";
import Link from "next/link";
import { Button } from "./ui/button";
import { Download, Play, Share2, Maximize2, Youtube, Clock } from "lucide-react";
import { useAudioPlayer } from "./audio-player-provider";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { getPlaceholderImage } from "@/lib/images";
import { cn, formatDuration } from "@/lib/utils";
import { useState, memo } from "react";
import { YoutubePlayerModal } from "./youtube-player-modal";
import { ImageModal } from "./image-modal";
import { LectureCard } from "./lecture-card";


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


interface LectureListItemProps {
    lecture: Lecture;
    index: number;
}

const LectureListItemComponent = ({ lecture, index }: LectureListItemProps) => {
    const { playTrack } = useAudioPlayer();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

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
          programName: lecture.programName,
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


    const videoId = getYoutubeVideoId(lecture.youtubeUrl);
    const placeholder = getPlaceholderImage(lecture.imageId);
    const lectureUrl = typeof window !== 'undefined' ? `${window.location.origin}/lectures/${lecture.slug}` : '';
    
    const imageUrl = videoId 
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/200/150`;

    const handleImageClick = () => {
        if (videoId) {
            setIsModalOpen(true);
        } else {
            handlePlay();
        }
    }
    
    if (isExpanded) {
        return <LectureCard lecture={lecture} index={index} onCollapse={() => setIsExpanded(false)} />;
    }


    return (
        <>
        <div
            className="bg-card text-card-foreground rounded-xl border p-3 flex items-center gap-4 transition-all hover:border-primary/50 hover:bg-primary/5 animate-slide-in"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
        >
            <span className="text-lg font-bold text-muted-foreground w-8 text-center">{index.toString().padStart(2, '0')}</span>
            <div className="relative w-28 h-20 rounded-md overflow-hidden shrink-0">
                <Image 
                    src={imageUrl}
                    alt={lecture.title}
                    fill
                    className="object-cover"
                    data-ai-hint={placeholder?.imageHint || "lecture content"}
                />
                <div 
                    className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={handleImageClick}
                >
                    <Play className="w-8 h-8 text-white fill-current" />
                </div>
            </div>
            <div className="flex-grow">
                <Link href={`/lectures/${lecture.slug}`} className="text-md font-semibold text-foreground hover:text-primary hover:underline">
                    {lecture.title}
                </Link>
                 <div className="flex items-center gap-x-3 text-sm text-muted-foreground mt-1">
                    {lecture.seriesTitle && <span>{lecture.seriesTitle}</span>}
                    {lecture.duration > 0 && lecture.seriesTitle && <span className="text-xs">●</span>}
                    {lecture.duration > 0 && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDuration(lecture.duration)}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-1">
                {videoId && (
                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(true)}>
                        <Youtube className="w-5 h-5 text-red-500"/>
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button asChild variant="ghost" size="icon">
                    <a href={lecture.audioSrc} download>
                        <Download className="w-5 h-5 text-muted-foreground" />
                    </a>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)}>
                    <Maximize2 className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">توسيع</span>
                </Button>
            </div>
        </div>
        {videoId && (
            <YoutubePlayerModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                videoId={videoId}
                shareUrl={lectureUrl}
            />
        )}
        </>
    );
}

export const LectureListItem = memo(LectureListItemComponent);
