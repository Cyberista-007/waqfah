"use client"

import type { TranscriptItem } from "@/lib/types";
import { useAudioPlayer } from "./audio-player-provider";

interface InteractiveTranscriptProps {
    transcript: TranscriptItem[];
}

export function InteractiveTranscript({ transcript }: InteractiveTranscriptProps) {
    const { audioRef, playTrack, track } = useAudioPlayer();

    const handleLineClick = (timestamp: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = timestamp;
            if (audioRef.current.paused && track) {
                playTrack(track); // Start playing if paused
            }
        }
    };
    
    if (!transcript || transcript.length === 0) {
        return <p className="text-muted-foreground">لا يوجد تفريغ نصي لهذه المحاضرة.</p>
    }

    return (
        <div className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4">
            {transcript.map((item, index) => (
                <span
                    key={index}
                    onClick={() => handleLineClick(item.timestamp)}
                    className="transcript-line cursor-pointer hover:bg-accent p-1 rounded transition-colors"
                >
                    {item.text}{' '}
                </span>
            ))}
        </div>
    );
}
