
"use client"

import { useEffect, useState, useCallback, useRef } from "react";
import { X, Rewind, Timer } from "lucide-react";
import { useAudioPlayer } from "./audio-player-provider";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, Timestamp, runTransaction, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";

export function FloatingAudioPlayer() {
  const { track, isPlaying, audioRef, closePlayer, playTrack, pauseTrack } = useAudioPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [sleepTimerDuration, setSleepTimerDuration] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateListenHistory = useCallback(async () => {
    if (!user || !firestore || !track || !audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;

    if (currentTime > 0 && duration > 0) {
        const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', track.id);
        const userRef = doc(firestore, 'users', user.uid);

        try {
            await runTransaction(firestore, async (transaction) => {
                const historyDoc = await transaction.get(historyRef);
                const lastPosition = historyDoc.exists() ? historyDoc.data().position : 0;
                const timeListened = currentTime - lastPosition;

                // Update lecture-specific history
                transaction.set(historyRef, {
                    lectureId: track.id,
                    position: currentTime,
                    duration: duration,
                    lastListened: Timestamp.now(),
                }, { merge: true });

                // Update total minutes listened if time listened is positive and realistic
                if (timeListened > 0 && timeListened < 20) { // < 20s to avoid large jumps
                    transaction.update(userRef, {
                        minutesListened: increment(timeListened / 60)
                    });
                }
            });
        } catch (error) {
            console.error("Failed to update listen history/stats:", error);
        }
    }
  }, [user, firestore, track, audioRef]);
  
  const clearSleepTimer = () => {
    if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
        setSleepTimerDuration(0);
    }
  }

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
      
       if (user && firestore && track) {
            const userRef = doc(firestore, 'users', user.uid);
            setDoc(userRef, { lecturesCompleted: increment(1) }, { merge: true });
        }

      closePlayer();
      clearSleepTimer();
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
      clearSleepTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  
  const setSleepTimer = (minutes: number) => {
    clearSleepTimer();
    if (minutes > 0) {
        setSleepTimerDuration(minutes);
        sleepTimerRef.current = setTimeout(() => {
            pauseTrack();
            toast({ title: "مؤقت النوم", description: `تم إيقاف التشغيل بعد ${minutes} دقيقة.` });
            clearSleepTimer();
        }, minutes * 60 * 1000);
        toast({ title: "مؤقت النوم", description: `سيتم إيقاف التشغيل بعد ${minutes} دقيقة.` });
    }
  }


  if (!isMounted || !track) {
    return null;
  }

  return (
    <div className={cn(
      "sticky bottom-4 inset-x-4 max-w-md mx-auto z-50 p-[1px] rounded-lg shadow-xl transition-transform duration-300 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500",
      track ? "translate-y-0" : "translate-y-[200%]"
    )}>
      <div className="bg-background/80 backdrop-blur-md text-foreground rounded-lg p-4">
        <audio ref={audioRef} src={track.src} preload="metadata" className="hidden" />
        <div className="flex items-center justify-between">
            <div className="flex-grow min-w-0">
            <p className="text-sm font-medium truncate">{track.title}</p>
            <p className="text-xs text-muted-foreground truncate">{track.seriesTitle}</p>
            </div>
            <Button onClick={closePlayer} variant="ghost" size="icon" className="ms-3 text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-5 h-5" />
            <span className="sr-only">إغلاق المشغل</span>
            </Button>
        </div>
        <div className="w-full mt-2">
            <audio controls className="w-full h-10" src={track.src} ref={audioRef}></audio>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
            <Button onClick={handleRewind} variant="ghost" size="icon" className="text-foreground hover:bg-foreground/10">
            <Rewind className="w-5 h-5" />
            <span className="sr-only">إرجاع 10 ثواني</span>
            </Button>
            <div className="flex items-center gap-2">
            <label htmlFor="global-speed-select" className="text-sm text-muted-foreground">السرعة:</label>
            <Select defaultValue="1" onValueChange={handleSpeedChange}>
                <SelectTrigger id="global-speed-select" className="p-1 text-sm border rounded-md focus:outline-none bg-foreground/10 border-border text-foreground w-[80px]">
                <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                </SelectContent>
            </Select>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("text-foreground hover:bg-foreground/10", sleepTimerDuration > 0 && "text-primary")}>
                        <Timer className="w-5 h-5" />
                        <span className="sr-only">مؤقت النوم</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 bg-background border-border text-foreground" align="center">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">مؤقت النوم</h4>
                            <p className="text-sm text-muted-foreground">
                                إيقاف التشغيل تلقائياً.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Button onClick={() => setSleepTimer(15)} variant={sleepTimerDuration === 15 ? 'default' : 'outline'}>بعد 15 دقيقة</Button>
                            <Button onClick={() => setSleepTimer(30)} variant={sleepTimerDuration === 30 ? 'default' : 'outline'}>بعد 30 دقيقة</Button>
                            <Button onClick={() => setSleepTimer(60)} variant={sleepTimerDuration === 60 ? 'default' : 'outline'}>بعد 60 دقيقة</Button>
                            {sleepTimerDuration > 0 && (
                                <Button onClick={() => setSleepTimer(0)} variant="destructive">إلغاء المؤقت</Button>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
      </div>
    </div>
  );
}
