"use client"

import type { TranscriptItem } from "@/lib/types";
import { useAudioPlayer } from "./audio-player-provider";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface InteractiveTranscriptProps {
    transcript: TranscriptItem[];
}

export function InteractiveTranscript({ transcript }: InteractiveTranscriptProps) {
    const { audioRef, playTrack, track, videoPlayerRef } = useAudioPlayer();
    const [currentTime, setCurrentTime] = useState(0);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Track active playback time directly from HTML5/Audio elements
    useEffect(() => {
        let interval = setInterval(() => {
            let time = 0;
            // 1. Try audio player
            if (audioRef.current && !audioRef.current.paused) {
                time = audioRef.current.currentTime;
            } 
            // 2. Try video player (HTML5)
            else if (videoPlayerRef.current?.plyr?.playing) {
                time = videoPlayerRef.current.plyr.currentTime;
            }
            if (time > 0) setCurrentTime(time);
        }, 500);
        return () => clearInterval(interval);
    }, [audioRef, videoPlayerRef]);

    const handleLineClick = (timestamp: number) => {
        if (audioRef.current && track) {
            audioRef.current.currentTime = timestamp;
            if (audioRef.current.paused) playTrack(track); 
        } else if (videoPlayerRef.current?.plyr) {
            videoPlayerRef.current.plyr.currentTime = timestamp;
            videoPlayerRef.current.plyr.play();
        }
    };
    
    // Sort items safety
    const sorted = [...transcript].sort((a,b) => a.timestamp - b.timestamp);

    // Find active index
    const activeIdx = sorted.reduce((acc, current, idx) => {
        return currentTime >= current.timestamp ? idx : acc;
    }, -1);

    // Auto-scroll to active line
    useEffect(() => {
        if (activeIdx >= 0 && containerRef.current) {
            const activeEl = document.getElementById(`transcript-line-${activeIdx}`);
            if (activeEl) {
                // Only scroll if it's not well in view
                const rect = activeEl.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                if (rect.top < containerRect.top || rect.bottom > window.innerHeight * 0.8) {
                    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }, [activeIdx]);

    if (!sorted || sorted.length === 0) {
        return <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-3xl"><p className="text-muted-foreground font-black">لا يوجد تفريغ نصي لهذه المحاضرة.</p></div>
    }

    return (
        <div ref={containerRef} className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 leading-relaxed font-body">
            {sorted.map((item, index) => {
                const isActive = index === activeIdx;
                return (
                    <span
                        key={index}
                        id={`transcript-line-${index}`}
                        onClick={() => handleLineClick(item.timestamp)}
                        className={cn(
                          "transcript-line cursor-pointer rounded-lg transition-all duration-500 ease-out px-1",
                          isActive 
                            ? "bg-primary/20 text-primary font-bold scale-[1.02] inline-block shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" 
                            : "hover:bg-white/5 hover:text-foreground"
                        )}
                    >
                        {item.text}{' '}
                    </span>
                );
            })}
        </div>
    );
}
