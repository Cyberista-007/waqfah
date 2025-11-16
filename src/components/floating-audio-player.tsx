"use client"

import { useEffect, useState } from "react";
import { X, Rewind, Play, Pause } from "lucide-react";
import { useAudioPlayer } from "./audio-player-provider";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "@/lib/utils";

export function FloatingAudioPlayer() {
  const { track, isPlaying, audioRef, closePlayer, togglePlayPause, playTrack } = useAudioPlayer();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, track, audioRef]);
  
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handlePlay = () => {
        if (!isPlaying) playTrack(track!);
    };
    const handlePause = () => {
        if (isPlaying) togglePlayPause();
    };

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);

    return () => {
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
    };
}, [audioRef, isPlaying, playTrack, togglePlayPause, track]);


  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const handleSpeedChange = (value: string) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(value);
    }
  };
  
  if (!isMounted || !track) {
    return null;
  }

  return (
    <div className={cn(
      "sticky bottom-4 inset-x-4 max-w-md mx-auto z-50 bg-gray-900/75 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg shadow-xl p-4 transition-transform duration-300",
      track ? "translate-y-0" : "translate-y-[200%]"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-grow min-w-0">
          <p className="text-sm font-medium truncate">{track.title}</p>
          <audio 
            ref={audioRef} 
            src={track.src}
            className="w-full mt-2" 
            controls 
            preload="metadata"
            onPlay={() => playTrack(track)}
            onPause={togglePlayPause}
          />
        </div>
        <Button onClick={closePlayer} variant="ghost" size="icon" className="ms-3 text-gray-400 hover:text-white shrink-0">
          <X className="w-5 h-5" />
          <span className="sr-only">إغلاق المشغل</span>
        </Button>
      </div>
      <div className="flex items-center justify-center gap-4 mt-3">
        <Button onClick={handleRewind} variant="ghost" size="icon" className="bg-gray-700 p-2 rounded-full hover:bg-gray-600">
          <Rewind className="w-5 h-5" />
          <span className="sr-only">إرجاع 10 ثواني</span>
        </Button>
        <div className="flex items-center gap-2">
          <label htmlFor="global-speed-select" className="text-sm text-gray-300">السرعة:</label>
          <Select defaultValue="1" onValueChange={handleSpeedChange}>
            <SelectTrigger id="global-speed-select" className="p-1 text-sm border rounded-md focus:outline-none bg-gray-700 border-gray-600 text-white w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600 text-white">
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="1.5">1.5x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
