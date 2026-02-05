
"use client"

import { useEffect, useState, useCallback, useRef } from "react";
import { X, Rewind, Timer, Play, Pause, Volume2, VolumeX, FastForward } from "lucide-react";
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
  const [volume, setVolume] = useState(1);
  
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [sleepTimerDuration, setSleepTimerDuration] = useState(0); // in minutes
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0); // in seconds

  useEffect(() => {
    setIsMounted(true);
    const savedVolume = localStorage.getItem('audioPlayerVolume');
    if (savedVolume) {
        const parsedVolume = parseFloat(savedVolume);
        setVolume(parsedVolume);
        if (audioRef.current) {
            audioRef.current.volume = parsedVolume;
        }
    }
  }, [audioRef]);
  
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

                if (timeListened > 0 && timeListened < 300) { 
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
            if (timeListened > 0 && timeListened < 300) { // Safety check
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
    
  // Media Session API Integration
  useEffect(() => {
    if (!track) {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      }
      return;
    }
    
    const artworkUrl = getPlaceholderImage(track.imageId)?.imageUrl || `https://picsum.photos/seed/${track.slug}/512/512`;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.programName || track.seriesTitle || "محاضرات متنوعة",
        album: 'منصة الدروس العلمية',
        artwork: [
          { src: artworkUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '384x384', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          playTrack(track, audioRef.current.currentTime);
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pauseTrack();
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - (details.seekOffset || 10));
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + (details.seekOffset || 10));
        }
      });
    }
  }, [track, playTrack, pauseTrack, audioRef, duration]);


  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const handleFastForward = () => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  const handleSpeedChange = (value: string) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(value);
    }
  };
  
  const setSleepTimer = (minutes: number) => {
    clearSleepTimer(); // Clear any existing timer
    if (minutes > 0) {
        setSleepTimerDuration(minutes);
        setSleepTimerRemaining(minutes * 60);

        sleepTimerRef.current = setInterval(() => {
            setSleepTimerRemaining(prev => {
                if (prev <= 1) {
                    pauseTrack();
                    toast({ title: "مؤقت النوم", description: `تم إيقاف التشغيل.` });
                    clearSleepTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        toast({ title: "مؤقت النوم", description: `سيتم إيقاف التشغيل بعد ${minutes} دقيقة.` });
    }
  }

  const clearSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
        setSleepTimerDuration(0);
        setSleepTimerRemaining(0);
        toast({ title: "مؤقت النوم", description: "تم إلغاء مؤقت النوم." });
    }
  }, [toast]);
  
  const handleSeek = (value: number[]) => {
      if (audioRef.current) {
          audioRef.current.currentTime = value[0];
          setProgress(value[0]);
      }
  };

  const handleVolumeChange = (value: number) => {
    const newVolume = value / 100;
    setVolume(newVolume);
    if (audioRef.current) {
        audioRef.current.volume = newVolume;
        if (newVolume > 0 && audioRef.current.muted) {
            audioRef.current.muted = false;
            setIsMuted(false);
        }
    }
    localStorage.setItem('audioPlayerVolume', newVolume.toString());
  };

  const toggleMute = () => {
      if (audioRef.current) {
          const currentlyMuted = !audioRef.current.muted;
          audioRef.current.muted = currentlyMuted;
          setIsMuted(currentlyMuted);
      }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (!track) return;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
            return;
        }
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                handleRewind();
                break;
            case 'ArrowRight':
                event.preventDefault();
                handleFastForward();
                break;
            case 'KeyM':
                event.preventDefault();
                toggleMute();
                break;
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [togglePlayPause, track]);


  if (!isMounted || !track) {
    return null;
  }
  
  const placeholder = getPlaceholderImage(track.imageId);

  return (
    <div className={cn(
      "sticky bottom-8 inset-x-4 max-w-xs mx-auto z-50 rounded-2xl shadow-xl transition-transform duration-300",
      "bg-background/80 backdrop-blur-md border border-border",
      track ? "translate-y-0" : "translate-y-[200%]"
    )}>
      <audio ref={audioRef} src={track.audioSrc} preload="metadata" className="hidden" />

      <div className="flex flex-col p-4 gap-3">
        <div className="flex items-center gap-4">
            <Image 
                src={placeholder?.imageUrl || `https://picsum.photos/seed/${track.slug}/100/100`}
                alt={track.title}
                width={64}
                height={64}
                className="w-16 h-16 rounded-md object-cover"
            />
            <div className="flex-grow min-w-0">
                <p className="text-sm font-bold truncate">
                    <Link href={`/lectures/${track.slug}`} className="hover:underline">{track.title}</Link>
                </p>
                <p className="text-xs text-muted-foreground truncate">
                    <Link href={`/series/${track.seriesSlug}`} className="hover:underline">{track.seriesTitle}</Link>
                </p>
            </div>
            <Button onClick={closePlayer} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0 h-8 w-8">
                <X className="w-4 h-4" />
            </Button>
        </div>

        <div className="flex items-center justify-center gap-2">
            <Button onClick={handleRewind} variant="ghost" size="icon" className="h-10 w-10 text-foreground hover:bg-foreground/10">
                <Rewind className="w-5 h-5" />
            </Button>
            <Button onClick={togglePlayPause} variant="ghost" size="icon" className="h-14 w-14 text-foreground hover:bg-foreground/10">
                {isPlaying ? <Pause className="w-8 h-8"/> : <Play className="w-8 h-8"/>}
            </Button>
            <Button onClick={handleFastForward} variant="ghost" size="icon" className="h-10 w-10 text-foreground hover:bg-foreground/10">
                <FastForward className="w-5 h-5" />
            </Button>
        </div>

        <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground w-10 text-center">{formatTime(progress)}</span>
            <Slider
                value={[progress]}
                max={duration || 1}
                step={1}
                onValueChange={handleSeek}
                className="flex-grow"
            />
            <span className="text-xs font-mono text-muted-foreground w-10 text-center">
              {sleepTimerRemaining > 0 ? `-${formatTime(sleepTimerRemaining)}` : formatTime(duration)}
            </span>
        </div>
        <div className="px-2 pt-2 flex items-center justify-between">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
                        <Timer className="w-4 h-4" />
                        {sleepTimerDuration > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                    <div className="space-y-1">
                        <Button onClick={() => setSleepTimer(15)} variant="ghost" className="w-full justify-start">بعد 15 دقيقة</Button>
                        <Button onClick={() => setSleepTimer(30)} variant="ghost" className="w-full justify-start">بعد 30 دقيقة</Button>
                        <Button onClick={() => setSleepTimer(60)} variant="ghost" className="w-full justify-start">بعد 60 دقيقة</Button>
                        {sleepTimerDuration > 0 && <Button onClick={clearSleepTimer} variant="destructive" className="w-full justify-start mt-2">إلغاء المؤقت</Button>}
                    </div>
                </PopoverContent>
            </Popover>

            <Select onValueChange={handleSpeedChange} defaultValue="1">
                <SelectTrigger className="w-[75px] h-8 text-xs rounded-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                </SelectContent>
            </Select>
            
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-2">
                    <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={(value) => handleVolumeChange(value[0])}
                    />
                </PopoverContent>
            </Popover>
        </div>
      </div>
    </div>
  );
}
