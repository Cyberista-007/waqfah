
"use client"

import { useEffect, useState, useCallback, useRef } from "react";
import { X, Rewind, Timer, Play, Pause, Volume2, VolumeX, FastForward, ExternalLink, Maximize2, Minimize2, ChevronDown } from "lucide-react";
import { useAudioPlayer } from "./audio-player-provider";
import { motion, AnimatePresence } from "framer-motion";
import { useMood } from "./mood-provider";
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
import { AudioVisualizer } from "./audio-visualizer";


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
  const { moodColor } = useMood();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
    // Restore saved playback speed
    const savedSpeed = localStorage.getItem('audioPlayerSpeed');
    if (savedSpeed && audioRef.current) {
        audioRef.current.playbackRate = parseFloat(savedSpeed);
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
      // Restore saved speed for the new track
      const savedSpeed = localStorage.getItem('audioPlayerSpeed');
      if (savedSpeed) audioElement.playbackRate = parseFloat(savedSpeed);
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

  const [playbackSpeed, setPlaybackSpeed] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem('audioPlayerSpeed') || '1');
    }
    return 1;
  });

  const handleSpeedChange = (value: string) => {
    const speed = parseFloat(value);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setPlaybackSpeed(speed);
    localStorage.setItem('audioPlayerSpeed', value);
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
    <>
    <AnimatePresence>
        {isExpanded && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 100 }}
                className="fixed inset-0 z-[100] flex flex-col bg-background/80 backdrop-blur-[100px] p-8 md:p-16 overflow-hidden"
            >
                {/* Immersive Background */}
                <div className="absolute inset-0 z-[-1] opacity-30">
                     <motion.div 
                        animate={{ backgroundColor: moodColor }}
                        className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] rounded-full blur-[150px] animate-blob" 
                    />
                    <motion.div 
                        animate={{ backgroundColor: moodColor }}
                        className="absolute bottom-[-20%] right-[-10%] w-[90vw] h-[90vw] rounded-full blur-[180px] animate-blob animation-delay-2000" 
                    />
                </div>

                <div className="container mx-auto max-w-5xl h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                         <div className="text-3xl font-black font-headline text-primary italic">وقـــفــــة</div>
                         <Button onClick={() => setIsExpanded(false)} variant="ghost" size="icon" className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all">
                            <ChevronDown className="w-8 h-8 text-white" />
                         </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 flex-1 justify-center py-10" dir="rtl">
                         <motion.div 
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10"
                        >
                             <Image 
                                src={placeholder?.imageUrl || `https://picsum.photos/seed/${track.slug}/800/800`}
                                alt={track.title}
                                fill
                                className="object-cover scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                         </motion.div>

                         <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-right space-y-8 w-full">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight mb-4">{track.title}</h1>
                                <p className="text-xl lg:text-2xl text-primary font-bold">{track.seriesTitle}</p>
                            </motion.div>

                            <div className="w-full space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-lg font-mono text-white/40">
                                        <span>{formatTime(progress)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                    <Slider
                                        value={[progress]}
                                        max={duration || 1}
                                        step={1}
                                        onValueChange={handleSeek}
                                        className="h-4"
                                    />
                                </div>

                                <div className="flex items-center justify-center lg:justify-start gap-8">
                                    <Button onClick={handleRewind} variant="ghost" size="icon" className="w-16 h-16 text-white/40 hover:text-white hover:bg-white/5 rounded-full">
                                        <Rewind className="w-8 h-8" />
                                    </Button>
                                    
                                    <div className="relative group">
                                        <motion.div 
                                            animate={{ backgroundColor: moodColor }}
                                            className="absolute inset-0 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity" 
                                        />
                                        <Button onClick={togglePlayPause} size="icon" className="w-24 h-24 rounded-full shadow-2xl relative z-10 hover:scale-105 active:scale-95 transition-all">
                                            {isPlaying ? <Pause className="w-10 h-10 fill-white"/> : <Play className="w-10 h-10 fill-white ml-2"/>}
                                        </Button>
                                    </div>

                                    <Button onClick={handleFastForward} variant="ghost" size="icon" className="w-16 h-16 text-white/40 hover:text-white hover:bg-white/5 rounded-full">
                                        <FastForward className="w-8 h-8" />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                                     <Select onValueChange={handleSpeedChange} value={playbackSpeed.toString()}>
                                        <SelectTrigger className="w-32 h-14 text-lg font-bold rounded-2xl bg-white/5 border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {[0.5, 1, 1.25, 1.5, 2, 3].map(s => (
                                                <SelectItem key={s} value={s.toString()}>{s}x</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 w-48">
                                         <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                                            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                         </button>
                                         <Slider
                                            value={[isMuted ? 0 : volume * 100]}
                                            max={100}
                                            step={1}
                                            onValueChange={(value) => handleVolumeChange(value[0])}
                                            className="flex-grow"
                                        />
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                    
                    <div className="h-20 flex items-center justify-center">
                         <div className="w-full max-w-2xl px-10">
                            <AudioVisualizer audioElement={audioRef.current} isPlaying={isPlaying} barColor={moodColor} />
                         </div>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>

    <div className={cn(
      "sticky bottom-8 inset-x-4 max-w-sm mx-auto z-50 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] transition-all duration-700",
      "bg-background/80 backdrop-blur-2xl border border-white/10",
      track ? "translate-y-0 opacity-1" : "translate-y-[200%] opacity-0",
      isExpanded && "scale-90 opacity-0 pointer-events-none"
    )}>
      <audio ref={audioRef} src={track.audioSrc} preload="metadata" className="hidden" />

      <div className="flex flex-col p-5 gap-4">
        <div className="flex items-center gap-4">
            <div className="relative group/thumb h-16 w-16 shrink-0 shadow-2xl">
                 <motion.div 
                    layoutId="artwork"
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                >
                    <Image 
                        src={placeholder?.imageUrl || `https://picsum.photos/seed/${track.slug}/100/100`}
                        alt={track.title}
                        fill
                        className="object-cover image-theme-filter"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button onClick={() => setIsExpanded(true)} className="p-2 bg-white/20 rounded-lg">
                        <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
            <div className="flex-grow min-w-0">
                <p className="text-sm font-black truncate leading-tight">
                    <Link href={`/lectures/${track.slug}`} className="hover:text-primary transition-colors">{track.title}</Link>
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                    {track.programName}
                </p>
                <div className="mt-2 h-[12px] flex items-center opacity-60">
                    <AudioVisualizer audioElement={audioRef.current} isPlaying={isPlaying} barColor="hsl(var(--primary))" />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <Button onClick={closePlayer} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0 h-10 w-10 rounded-full hover:bg-destructive/10">
                    <X className="w-5 h-5" />
                </Button>
                <button onClick={() => setIsExpanded(true)} className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="space-y-1">
              <Slider
                  value={[progress]}
                  max={duration || 1}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-grow h-2"
              />
              <div className="flex justify-between text-[9px] font-black text-muted-foreground/50 tracking-tighter">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
        </div>

        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn("h-10 w-10 text-muted-foreground rounded-2xl", sleepTimerDuration > 0 && "text-primary bg-primary/10")}>
                            <Timer className="w-5 h-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-2 rounded-2xl border-border/50 backdrop-blur-xl">
                        <div className="space-y-1">
                            <p className="px-2 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">مؤقت النوم</p>
                            {[15, 30, 45, 60].map(mins => (
                                <Button key={mins} onClick={() => setSleepTimer(mins)} variant="ghost" className="w-full justify-start rounded-xl text-xs font-bold">
                                    <div className={cn("w-2 h-2 rounded-full me-3", sleepTimerDuration === mins ? "bg-primary shadow-glow-primary" : "bg-white/10")} />
                                    بعد {mins} دقيقة
                                </Button>
                            ))}
                            {sleepTimerDuration > 0 && (
                                <Button onClick={clearSleepTimer} variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 rounded-xl mt-2">
                                    <X className="w-4 h-4 me-2" /> إيقاف المؤقت
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <Select onValueChange={handleSpeedChange} value={playbackSpeed.toString()}>
                    <SelectTrigger className="w-[64px] h-10 text-[10px] font-black rounded-2xl bg-white/5 border-none shadow-none">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                        {[1, 1.25, 1.5, 2].map(s => (
                            <SelectItem key={s} value={s.toString()} className="text-[10px] font-black">{s}x</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-center gap-1">
                <Button onClick={handleRewind} variant="ghost" size="icon" className="h-10 w-10 text-foreground hover:bg-primary/10 rounded-full">
                    <Rewind className="w-5 h-5" />
                </Button>
                
                <Button onClick={togglePlayPause} size="icon" className="h-12 w-12 rounded-full shadow-lg shadow-primary/20 transition-transform active:scale-90">
                    {isPlaying ? <Pause className="w-6 h-6 fill-white"/> : <Play className="w-6 h-6 fill-white ml-1"/>}
                </Button>
                
                <Button onClick={handleFastForward} variant="ghost" size="icon" className="h-10 w-10 text-foreground hover:bg-primary/10 rounded-full">
                    <FastForward className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex items-center gap-1">
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground rounded-2xl">
                            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-12 h-40 p-4 rounded-full border-border/50 backdrop-blur-xl">
                        <Slider
                            value={[isMuted ? 0 : volume * 100]}
                            max={100}
                            step={1}
                            orientation="vertical"
                            onValueChange={(value) => handleVolumeChange(value[0])}
                            className="h-full"
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
      </div>
    </div>
    </>
  );
}
