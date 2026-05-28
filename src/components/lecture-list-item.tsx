
"use client"

import type { Lecture, ListenHistoryItem } from "@/lib/types";
import Link from "next/link";
import { Button } from "./ui/button";
import { Download, Play, Share2, Maximize2, Clock, Calendar } from "lucide-react";
import { useAudioPlayer } from "./audio-player-provider";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { getPlaceholderImage } from "@/lib/images";
import { cn, formatDuration, getVideoIdFromUrl } from "@/lib/utils";
import { useState, memo, useMemo } from "react";
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
        
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    return;
                }
                console.error('Error sharing lecture:', error);
            }
        }

        try {
            await navigator.clipboard.writeText(lectureUrl);
            toast({ title: 'تم نسخ رابط المحاضرة!' });
        } catch (err) {
            toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
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


    const formattedDate = useMemo(() => {
        if (!lecture.createdAt) return null;
        try {
            const dateObj = typeof (lecture.createdAt as any).toDate === 'function' ? (lecture.createdAt as any).toDate() : new Date(lecture.createdAt as string);
            return new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }).format(dateObj);
        } catch {
            return null;
        }
    }, [lecture.createdAt]);

    return (
        <>
            <div
                className="group relative bg-[#050505]/60 text-foreground rounded-[2rem] border border-white/5 p-4 pe-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/15 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] shadow-inner animate-fade-in-up overflow-hidden backdrop-blur-2xl"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                {/* ✨ Cinematic Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-l from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 transition-colors duration-700 pointer-events-none" />

                {/* Number */}
                <span className="relative z-10 text-3xl lg:text-5xl font-black font-headline text-white/10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-white/20 transition-all duration-500 text-center w-16 shrink-0 select-none tracking-tighter">
                    {index.toString().padStart(2, '0')}
                </span>

                {/* Thumbnail */}
                <div className="relative z-10 w-full md:w-56 aspect-video rounded-[1.5rem] overflow-hidden shrink-0 shadow-2xl border border-white/10 group-hover:border-primary/30 transition-colors duration-500">
                    <Image
                        src={imageUrl}
                        alt={lecture.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        data-ai-hint={placeholder?.imageHint || "lecture content"}
                    />
                    <Link
                        href={`/lectures/${lecture.slug}`}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer"
                    >
                        <div className="bg-primary p-4 rounded-full shadow-[0_0_30px_rgba(var(--primary-rgb),0.8)] transform scale-75 group-hover:scale-100 transition-transform duration-500 ease-out">
                            <Play className="w-8 h-8 text-white fill-white translate-x-[2px]" />
                        </div>
                    </Link>
                </div>

                {/* Content Container */}
                <div className="relative z-10 flex-grow w-full text-center md:text-right flex flex-col justify-center py-2">
                    <Link href={`/lectures/${lecture.slug}`} className="text-2xl md:text-3xl font-black font-headline text-white/90 group-hover:text-white transition-colors leading-tight mb-3">
                        {lecture.title}
                    </Link>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm font-medium">
                        {lecture.duration > 0 && (
                            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-white/80">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>{formatDuration(lecture.duration)}</span>
                            </div>
                        )}
                        {formattedDate && (
                            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-white/80">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>{formattedDate}</span>
                            </div>
                        )}
                        {lecture.seriesTitle && (
                            <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 text-primary">
                                <span>{lecture.seriesTitle}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="relative z-10 flex items-center justify-center gap-2 bg-black/40 p-2 rounded-[1.5rem] border border-white/10 shrink-0 w-full md:w-auto mt-6 md:mt-0 shadow-inner backdrop-blur-md">
                    {videoId && (
                        <Button asChild variant="ghost" size="icon" className="hover:bg-red-500/10 rounded-xl transition-all h-10 w-10 p-2">
                            <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" aria-label="مشاهدة على يوتيوب">
                                <svg viewBox="0 0 24 24" className="w-full h-full fill-[#FF0000] drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                                    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF" />
                                </svg>
                            </a>
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={handleShare} aria-label="مشاركة المحاضرة" className="hover:bg-white/10 rounded-xl transition-colors h-10 w-10">
                        <Share2 className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="hover:bg-white/10 rounded-xl transition-colors h-10 w-10">
                        <a href={lecture.audioSrc} download aria-label="تحميل الملف الصوتي للمحاضرة">
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
