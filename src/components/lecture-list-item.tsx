
"use client"

import type { Lecture, ListenHistoryItem } from "@/lib/types";
import Link from "next/link";
import { Button } from "./ui/button";
import { Download, Play, Share2, Maximize2, Youtube, Clock } from "lucide-react";
import { useAudioPlayer } from "./audio-player-provider";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { getPlaceholderImage } from "@/lib/images";
import { cn, formatDuration, getVideoIdFromUrl } from "@/lib/utils";
import { useState, memo } from "react";
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
    const { playTrack, playIframe } = useAudioPlayer();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isExpanded, setIsExpanded] = useState(false);
    
    const historyDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid, 'listenHistory', lecture.id) : null),
        [user, firestore, lecture.id]
    );
    const { data: lectureHistory } = useDoc<ListenHistoryItem>(historyDocRef);

    const handlePlay = () => {
      let startTime = 0;
      if (lectureHistory && lectureHistory.position && lectureHistory.duration && (lectureHistory.duration - lectureHistory.position) > 10 && lectureHistory.position > 5) {
        startTime = lectureHistory.position;
        toast({
            title: "تكملة الاستماع",
            description: `تم استئناف المحاضرة من حيث توقفت.`,
        });
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
    
    const imageUrl = videoId 
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/200/150`;

    const handleImageClick = () => {
        if (videoId) {
            playIframe({ type: 'youtube', src: videoId, title: lecture.title, lectureId: lecture.id, seriesId: lecture.seriesId });
        } else {
            handlePlay();
        }
    }
    
    if (isExpanded) {
        return <LectureCard lecture={lecture} index={index} onCollapse={() => setIsExpanded(false)} />;
    }

    const handleYoutubeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (videoId) {
            playIframe({ type: 'youtube', src: videoId, title: lecture.title, lectureId: lecture.id, seriesId: lecture.seriesId });
        }
    }


    return (
        <>
        <div
            className="group relative bg-white/5 text-foreground rounded-[1.5rem] border border-white/10 p-4 pe-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-xl shadow-inner animate-fade-in-up overflow-hidden backdrop-blur-md"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Number */}
            <span className="text-2xl lg:text-3xl font-black text-primary/60 group-hover:text-primary transition-colors text-center w-10 shrink-0 select-none">
                {index.toString().padStart(2, '0')}
            </span>

            {/* Thumbnail */}
            <div className="relative w-full md:w-48 aspect-video rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/5">
                <Image 
                    src={imageUrl}
                    alt={lecture.title}
                    fill
                    className="object-cover image-theme-filter transition-transform duration-700 group-hover:scale-105"
                    data-ai-hint={placeholder?.imageHint || "lecture content"}
                />
                <Link 
                    href={`/lectures/${lecture.slug}`}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                    <div className="bg-primary/90 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 text-primary-foreground fill-current" />
                    </div>
                </Link>
            </div>

            {/* Content Container */}
            <div className="flex-grow w-full text-center md:text-start flex flex-col justify-center">
                <Link href={`/lectures/${lecture.slug}`} className="text-xl md:text-2xl font-bold font-headline text-foreground hover:text-primary transition-colors">
                    {lecture.title}
                </Link>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 text-sm text-muted-foreground mt-2 font-medium">
                    {lecture.duration > 0 && (
                        <div className="flex items-center gap-1.5 text-foreground/80">
                            <span>{formatDuration(lecture.duration)}</span>
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                    )}
                    {lecture.duration > 0 && lecture.seriesTitle && <span className="text-primary/40 px-1">●</span>}
                    {lecture.seriesTitle && <span>{lecture.seriesTitle}</span>}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-1.5 bg-black/20 p-1.5 rounded-2xl border border-white/5 shrink-0 w-full md:w-auto mt-4 md:mt-0 shadow-inner">
                {videoId && (
                    <Button asChild variant="ghost" size="icon" className="hover:bg-red-500/10 rounded-xl transition-all h-10 w-10 p-2">
                        <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" className="w-full h-full fill-[#FF0000] drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                                <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF" />
                            </svg>
                        </a>
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleShare} className="hover:bg-white/10 rounded-xl transition-colors h-10 w-10">
                    <Share2 className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="hover:bg-white/10 rounded-xl transition-colors h-10 w-10">
                    <a href={lecture.audioSrc} download>
                        <Download className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </a>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} className="hover:bg-white/10 rounded-xl transition-colors h-10 w-10">
                    <Maximize2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    <span className="sr-only">توسيع</span>
                </Button>
            </div>
        </div>
        </>
    );
}

export const LectureListItem = memo(LectureListItemComponent);
