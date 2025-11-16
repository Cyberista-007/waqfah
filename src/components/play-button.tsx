"use client"

import { Play } from "lucide-react"
import { useAudioPlayer } from "./audio-player-provider"
import { Button } from "./ui/button"

interface PlayButtonProps {
    track: {
        src: string;
        title: string;
    }
}

export function PlayButton({ track }: PlayButtonProps) {
    const { playTrack } = useAudioPlayer();

    return (
        <Button 
            onClick={() => playTrack(track)}
            className="w-full bg-primary/80 text-primary-foreground hover:bg-primary/90 transition-colors"
            size="lg"
        >
            <Play className="w-6 h-6 me-2" />
            <span>استماع</span>
        </Button>
    )
}
