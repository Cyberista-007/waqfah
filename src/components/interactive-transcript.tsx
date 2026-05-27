"use client"

import type { TranscriptItem } from "@/lib/types";
import { useAudioPlayer } from "./audio-player-provider";
import { useEffect, useState, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react";

interface InteractiveTranscriptProps {
    transcript: TranscriptItem[];
}

export function InteractiveTranscript({ transcript }: InteractiveTranscriptProps) {
    const { audioRef, playTrack, track, videoPlayerRef } = useAudioPlayer();
    const [currentTime, setCurrentTime] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

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
    const sorted = useMemo(() => {
        return [...transcript].sort((a,b) => a.timestamp - b.timestamp);
    }, [transcript]);

    // Find active index
    const activeIdx = sorted.reduce((acc, current, idx) => {
        return currentTime >= current.timestamp ? idx : acc;
    }, -1);

    // Auto-scroll to active line
    useEffect(() => {
        if (activeIdx >= 0 && containerRef.current && !searchQuery.trim()) {
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
    }, [activeIdx, searchQuery]);

    // Search logic
    const matches = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase().trim();
        const list: Array<{ lineIndex: number; timestamp: number }> = [];
        sorted.forEach((item, lineIdx) => {
            if (item.text.toLowerCase().includes(query)) {
                list.push({ lineIndex: lineIdx, timestamp: item.timestamp });
            }
        });
        return list;
    }, [searchQuery, sorted]);

    const handleNextMatch = () => {
        if (matches.length === 0) return;
        const nextIdx = (currentMatchIndex + 1) % matches.length;
        setCurrentMatchIndex(nextIdx);
        scrollToMatch(nextIdx);
    };

    const handlePrevMatch = () => {
        if (matches.length === 0) return;
        const prevIdx = (currentMatchIndex - 1 + matches.length) % matches.length;
        setCurrentMatchIndex(prevIdx);
        scrollToMatch(prevIdx);
    };

    const scrollToMatch = (idx: number) => {
        const match = matches[idx];
        if (match && containerRef.current) {
            const lineEl = document.getElementById(`transcript-line-${match.lineIndex}`);
            if (lineEl) {
                lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const renderHighlightedText = (text: string, query: string) => {
        if (!query.trim()) return text;
        const cleanQuery = query.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const regex = new RegExp(`(${cleanQuery})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, idx) => {
            const isMatch = part.toLowerCase() === query.toLowerCase().trim();
            return isMatch ? (
                <mark key={idx} className="bg-amber-500/30 text-amber-200 rounded px-0.5 border border-amber-500/20">
                    {part}
                </mark>
            ) : part;
        });
    };

    if (!sorted || sorted.length === 0) {
        return <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-3xl"><p className="text-muted-foreground font-black">لا يوجد تفريغ نصي لهذه المحاضرة.</p></div>
    }

    return (
        <div className="space-y-6" dir="rtl">
            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-md">
                <Search className="w-5 h-5 text-white/40 ms-2" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentMatchIndex(0);
                    }}
                    placeholder="ابحث في تفريغ المحاضرة..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/35 focus:ring-0"
                />
                {searchQuery && (
                    <div className="flex items-center gap-2 border-r border-white/10 pr-3 mr-3">
                        <span className="text-xs text-white/50">
                            {matches.length > 0 ? `${currentMatchIndex + 1} من ${matches.length}` : "لا توجد نتائج"}
                        </span>
                        <button
                            onClick={handlePrevMatch}
                            disabled={matches.length === 0}
                            className="p-1 hover:bg-white/5 rounded text-white/60 hover:text-white disabled:opacity-30"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNextMatch}
                            disabled={matches.length === 0}
                            className="p-1 hover:bg-white/5 rounded text-white/60 hover:text-white disabled:opacity-30"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setCurrentMatchIndex(0);
                            }}
                            className="p-1 hover:bg-white/5 rounded text-white/60 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Transcript Text */}
            <div ref={containerRef} className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 leading-relaxed font-body max-h-[450px] overflow-y-auto pl-2 custom-scrollbar">
                {sorted.map((item, index) => {
                    const isActive = index === activeIdx;
                    const isMatchedLine = matches[currentMatchIndex]?.lineIndex === index;
                    return (
                        <span
                            key={index}
                            id={`transcript-line-${index}`}
                            onClick={() => handleLineClick(item.timestamp)}
                            className={cn(
                              "transcript-line cursor-pointer rounded-lg transition-all duration-300 ease-out px-1 inline",
                              isActive 
                                ? "bg-primary/20 text-primary font-bold scale-[1.02] shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] border-b border-primary/30" 
                                : isMatchedLine && searchQuery.trim()
                                ? "bg-amber-500/20 text-amber-200 border-b border-amber-500/50"
                                : "hover:bg-white/5 hover:text-foreground"
                            )}
                        >
                            {renderHighlightedText(item.text, searchQuery)}{' '}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
