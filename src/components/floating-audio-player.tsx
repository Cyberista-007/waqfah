
"use client"

import { useEffect, useState, useCallback, useRef } from "react";
import { X, Rewind } from "lucide-react";
import { useAudioPlayer } from "./audio-player-provider";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function FloatingAudioPlayer() {
  const { track, isPlaying, audioRef, closePlayer, playTrack, pauseTrack } = useAudioPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateListenHistory = useCallback(() => {
    if (!user || !firestore || !track || !audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;

    if (currentTime > 0 && duration > 0) {
      const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', track.id);
      setDoc(historyRef, {
        lectureId: track.id,
        position: currentTime,
        duration: duration,
        lastListened: Timestamp.now(),
      }, { merge: true }).catch(error => {
        // This is a background task, so we don't need to show a UI error
        console.error("Failed to update listen history:", error);
      });
    }
  }, [user, firestore, track, audioRef]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handlePlay = () => {
      if (!isPlaying) playTrack(track!, audioElement.currentTime);
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = setInterval(updateListenHistory, 10000); // Update every 10 seconds
    };
    
    const handlePause = () => {
      if (isPlaying) pauseTrack();
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      updateListenHistory(); // Final update on pause
    };
    
    const handleEnded = () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      updateListenHistory();
      closePlayer();
    };

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);

    if (track) {
      audioElement.src = track.src;
      audioElement.load();
      if (isPlaying) {
        audioElement.play().catch(e => console.error("Error playing audio:", e));
      }
    }

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [audioRef, isPlaying, playTrack, pauseTrack, track, updateListenHistory, closePlayer]);

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
       <audio ref={audioRef} src={track.src} preload="metadata" className="hidden" />
      <div className="flex items-center justify-between">
        <div className="flex-grow min-w-0">
          <p className="text-sm font-medium truncate">{track.title}</p>
          <p className="text-xs text-gray-400 truncate">{track.seriesTitle}</p>
        </div>
        <Button onClick={closePlayer} variant="ghost" size="icon" className="ms-3 text-gray-400 hover:text-white shrink-0">
          <X className="w-5 h-5" />
          <span className="sr-only">إغلاق المشغل</span>
        </Button>
      </div>
      <div className="w-full mt-2">
        {/* We use a native audio element for controls now for reliability */}
        <audio controls className="w-full h-10" src={track.src} ref={audioRef}></audio>
      </div>
      <div className="flex items-center justify-center gap-4 mt-3">
        <Button onClick={handleRewind} variant="ghost" size="icon" className="text-white hover:bg-gray-700">
          <Rewind className="w-5 h-5" />
          <span className="sr-only">إرجاع 10 ثواني</span>
        </Button>
        <div className="flex items-center gap-2">
          <label htmlFor="global-speed-select" className="text-sm text-gray-300">السرعة:</label>
          <Select defaultValue="1" onValueChange={handleSpeedChange}>
            <SelectTrigger id="global-speed-select" className="p-1 text-sm border rounded-md focus:outline-none bg-gray-700 border-gray-600 text-white w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
