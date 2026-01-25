
"use client"

import { useEffect, useState, useCallback, useRef } from "react";
import { X, Rewind, Timer, Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { useAudioPlayer } from "./audio-player-provider";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, Timestamp, runTransaction, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { getPlaceholderImage } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";


function formatTime(seconds: number) {
    const floorSeconds = Math.floor(seconds);
    const minutes = Math.floor(floorSeconds / 60);
    const remainingSeconds = floorSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}


export function FloatingAudioPlayer() {
  const { track, isPlaying, audioRef, closePlayer, playTrack, pauseTrack, togglePlayPause } = useAudioPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [sleepTimerDuration, setSleepTimerDuration] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Update progress bar
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        const updateProgress = () => {
            setProgress(audioElement.currentTime);
            setDuration(audioElement.duration || 0);
        };
        
        audioElement.addEventListener('timeupdate', updateProgress);
        audioElement.addEventListener('loadedmetadata', updateProgress);

        return () => {
            audioElement.removeEventListener('timeupdate', updateProgress);
            audioElement.removeEventListener('loadedmetadata', updateProgress);
        };
    }, [audioRef]);


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

                transaction.set(historyRef, {
                    lectureId: track.id,
                    seriesId: track.seriesId,
                    position: currentTime,
                    duration: duration,
                    lastListened: Timestamp.now(),
                }, { merge: true });

                if (timeListened > 0 && timeListened < 20) { 
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

  const handleEnded = useCallback(() => {
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    
    if (user && firestore && track && audioRef.current) {
        const userRef = doc(firestore, 'users', user.uid);
        const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', track.id);
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;

        runTransaction(firestore, async (transaction) => {
            const historyDoc = await transaction.get(historyRef);
            const userDoc = await transaction.get(userRef);
            
            if (!userDoc.exists()) {
                throw "User document does not exist!";
            }
            
            const lastPosition = historyDoc.exists() ? historyDoc.data().position : 0;
            const timeListened = currentTime - lastPosition;

            // 1. Update listen history to mark as complete
            transaction.set(historyRef, {
                lectureId: track.id,
                seriesId: track.seriesId,
                position: currentTime,
                duration: duration,
                lastListened: Timestamp.now(),
            }, { merge: true });

            // 2. Prepare user profile updates
            const userProfileUpdates: { [key: string]: any } = {
                lecturesCompleted: increment(1)
            };
            
            // 3. Add last bit of listening time
            if (timeListened > 0 && timeListened < 20) { // Safety check
                userProfileUpdates.minutesListened = increment(timeListened / 60);
            }
            
            // 4. Commit all user updates in one go
            transaction.update(userRef, userProfileUpdates);

        }).catch(error => {
            console.error("Transaction failed on lecture end:", error);
        });
    }

    closePlayer();
    clearSleepTimer();
  }, [user, firestore, track, audioRef, closePlayer]);


  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handlePlay = () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = setInterval(updateListenHistory, 10000); 
    };
    
    const handlePause = () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      updateListenHistory();
    };
    
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);

    if (track) {
      audioElement.src = track.audioSrc;
      audioElement.load();
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
  }, [audioRef, track, updateListenHistory, handleEnded]);
  
   useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;
        if (isPlaying) {
            audioElement.play().catch(e => console.error("Error playing audio:", e));
        } else {
            audioElement.pause();
        }
    }, [isPlaying, audioRef]);

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
  
  const handleSeek = (value: number[]) => {
      if (audioRef.current) {
          audioRef.current.currentTime = value[0];
          setProgress(value[0]);
      }
  };

  const toggleMute = () => {
      if (audioRef.current) {
          audioRef.current.muted = !audioRef.current.muted;
          setIsMuted(audioRef.current.muted);
      }
  };

  if (!isMounted || !track) {
    return null;
  }
  
  const placeholder = getPlaceholderImage(track.imageId);

  return (
    <div className={cn(
      "sticky bottom-4 inset-x-4 max-w-md mx-auto z-50 rounded-lg shadow-xl transition-transform duration-300",
      "bg-background/80 backdrop-blur-md border border-border",
      track ? "translate-y-0" : "translate-y-[200%]"
    )}>
      <audio ref={audioRef} src={track.audioSrc} preload="metadata" className="hidden" />

      <div className="p-4 flex flex-col gap-3">
        {/* Top Section: Info and Close */}
        <div className="flex items-center gap-4">
            <Image 
                src={placeholder?.imageUrl || `https://picsum.photos/seed/${track.slug}/100/100`}
                alt={track.title}
                width={56}
                height={56}
                className="w-14 h-14 rounded-md object-cover"
            />
            <div className="flex-grow min-w-0">
                <p className="text-sm font-bold truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                    <Link href={`/series/${track.seriesId}`} className="hover:underline">{track.seriesTitle}</Link>
                </p>
            </div>
            <Button onClick={closePlayer} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                <X className="w-5 h-5" />
            </Button>
        </div>

        {/* Middle Section: Progress Bar */}
        <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground w-10 text-center">{formatTime(progress)}</span>
            <Slider
                value={[progress]}
                max={duration || 1}
                step={1}
                onValueChange={handleSeek}
                className="flex-grow"
            />
            <span className="text-xs font-mono text-muted-foreground w-10 text-center">{formatTime(duration)}</span>
        </div>

        {/* Bottom Section: Controls */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-1">
                 <Select defaultValue="1" onValueChange={handleSpeedChange}>
                    <SelectTrigger id="global-speed-select" className="h-9 w-[70px] text-xs focus:outline-none bg-transparent border-0 text-foreground">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground">
                        <SelectItem value="0.75">0.75x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                </Select>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn("text-foreground hover:bg-foreground/10", sleepTimerDuration > 0 && "text-primary")}>
                            <Timer className="w-5 h-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 bg-background border-border text-foreground" align="center">
                        <div className="grid gap-4">
                            <h4 className="font-medium leading-none">مؤقت النوم</h4>
                            <div className="grid gap-2">
                                <Button onClick={() => setSleepTimer(15)} variant={sleepTimerDuration === 15 ? 'default' : 'outline'}>بعد 15 دقيقة</Button>
                                <Button onClick={() => setSleepTimer(30)} variant={sleepTimerDuration === 30 ? 'default' : 'outline'}>بعد 30 دقيقة</Button>
                                <Button onClick={() => setSleepTimer(60)} variant={sleepTimerDuration === 60 ? 'default' : 'outline'}>بعد 60 دقيقة</Button>
                                {sleepTimerDuration > 0 && <Button onClick={() => setSleepTimer(0)} variant="destructive">إلغاء المؤقت</Button>}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
           </div>
           
           <div className="flex items-center justify-center gap-1">
                <Button onClick={handleRewind} variant="ghost" size="icon" className="text-foreground hover:bg-foreground/10">
                    <Rewind className="w-6 h-6" />
                </Button>
                <Button onClick={togglePlayPause} variant="ghost" size="icon" className="h-12 w-12 text-foreground hover:bg-foreground/10">
                    {isPlaying ? <Pause className="w-8 h-8"/> : <Play className="w-8 h-8"/>}
                </Button>
                <Button variant="ghost" size="icon" disabled>
                   {/* Placeholder for forward button */}
                </Button>
           </div>

            <div className="flex items-center gap-1">
                <Button onClick={toggleMute} variant="ghost" size="icon" className="text-foreground hover:bg-foreground/10">
                    {isMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
                </Button>
                <Button asChild variant="ghost" size="icon" className="text-foreground hover:bg-foreground/10">
                    <Link href={`/lectures/${track.slug}`}><Maximize2 className="w-5 h-5"/></Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
