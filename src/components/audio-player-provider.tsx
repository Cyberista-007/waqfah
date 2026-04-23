
"use client"

import type { ReactNode } from "react";
import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import type { Lecture } from "@/lib/types";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, setDoc, Timestamp, runTransaction, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export type Track = Pick<Lecture, 'audioSrc' | 'title' | 'id' | 'seriesId' | 'seriesTitle' | 'seriesSlug' | 'imageId' | 'slug' | 'programName'>;
export type IframeTrack = {
  type: 'youtube' | 'soundcloud';
  src: string; // youtube videoId or soundcloud URL
  title: string;
  lectureId?: string;
  seriesId?: string;
};

type AudioPlayerContextType = {
  // Audio state
  track: Track | null;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  clipEndTime: number | null;
  playTrack: (track: Track, startTime?: number, endTime?: number | null) => void;
  pauseTrack: () => void;
  closePlayer: () => void;
  togglePlayPause: () => void;

  // Iframe player state
  iframeTrack: IframeTrack | null;
  isPlayerVisible: boolean;
  videoPlayerRef: React.MutableRefObject<any>;
  playIframe: (track: IframeTrack) => void;
  hidePlayer: () => void;
  setVideoClipEndTime: (endTime: number | null) => void;
  onPlayerStateChange: (event: any) => void;
  markVideoAsComplete: () => Promise<void>;

  // New site time tracker
  siteTimeInSeconds: number;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  // Audio State
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipEndTime, setClipEndTime] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Iframe Player State
  const [iframeTrack, setIframeTrack] = useState<IframeTrack | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const videoPlayerRef = useRef<any>(null);
  const [videoClipEndTime, setVideoClipEndTime] = useState<number | null>(null);
  const videoUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Site Time State
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [siteTimeInSeconds, setSiteTimeInSeconds] = useState(0);
  const [hasInitializedTime, setHasInitializedTime] = useState(false);
  const lastSaveTime = useRef(Date.now());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const pauseVideo = useCallback(() => {
    if (videoPlayerRef.current && typeof videoPlayerRef.current.pauseVideo === 'function') {
      videoPlayerRef.current.pauseVideo();
    }
  }, []);

  const playTrack = useCallback((newTrack: Track, startTime: number = 0, endTime: number | null = null) => {
    if (isPlayerVisible) {
      pauseVideo();
    }
    setVideoClipEndTime(null);

    if (track?.id !== newTrack.id) {
      setTrack(newTrack);
      if (audioRef.current) {
        audioRef.current.src = newTrack.audioSrc;
        audioRef.current.load();
      }
    }

    setClipEndTime(endTime);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = startTime;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(e => console.error("Error playing audio:", e));
      }
    }, 50);
  }, [isPlayerVisible, pauseVideo, track?.id]);

  const playIframe = useCallback((track: IframeTrack) => {
    pauseTrack();
    setClipEndTime(null);
    setIframeTrack({ ...track }); // Ensure reference change
    setIsPlayerVisible(true);
  }, [pauseTrack]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else if (track) {
      playTrack(track, audioRef.current?.currentTime || 0);
    }
  }, [isPlaying, pauseTrack, track, playTrack]);

  const closePlayer = useCallback(() => {
    pauseTrack();
    setTrack(null);
    setClipEndTime(null);
  }, [pauseTrack]);

  const hidePlayer = useCallback(() => {
    if (videoPlayerRef.current && typeof videoPlayerRef.current.destroy === 'function') {
      videoPlayerRef.current.destroy();
      videoPlayerRef.current = null;
    }
    setIsPlayerVisible(false);
    setIframeTrack(null);
    setVideoClipEndTime(null);
  }, []);

  // Effect to handle auto-pause for AUDIO clips
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleTimeUpdate = () => {
      if (clipEndTime && audioElement.currentTime >= clipEndTime) {
        pauseTrack();
        setClipEndTime(null);
      }
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioRef, clipEndTime, pauseTrack]);

  // Effect to handle auto-pause for VIDEO clips
  useEffect(() => {
    if (!isPlayerVisible || !videoPlayerRef.current || !videoClipEndTime || iframeTrack?.type !== 'youtube') return;

    const player = videoPlayerRef.current;
    let interval: NodeJS.Timeout;

    const checkTime = () => {
      try {
        const currentTime = player.getCurrentTime();
        if (currentTime >= videoClipEndTime) {
          player.pauseVideo();
          setVideoClipEndTime(null);
          if (interval) clearInterval(interval);
        }
      } catch (e) {
        console.error("Error checking video time", e);
        setVideoClipEndTime(null);
        if (interval) clearInterval(interval);
      }
    };

    interval = setInterval(checkTime, 250);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayerVisible, videoClipEndTime, iframeTrack]);

  const updateListenHistory = useCallback(async () => {
    if (!user || !firestore || !track || !audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;

    if (currentTime > 0 && duration > 0) {
      const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', track.id);
      const updateData: any = {
        lectureId: track.id,
        position: currentTime,
        duration: duration,
        lastListened: Timestamp.now(),
      };
      
      if (track.seriesId) updateData.seriesId = track.seriesId;

      setDoc(historyRef, updateData, { merge: true }).catch(error => {
        console.error("Failed to update listen history:", error);
      });
    }
  }, [user, firestore, track]);

  const handleEnded = useCallback(() => {
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);

    if (user && firestore && track && audioRef.current) {
      const userRef = doc(firestore, 'users', user.uid);
      const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', track.id);

      runTransaction(firestore, async (transaction) => {
        transaction.set(historyRef, {
          position: audioRef.current!.duration,
          duration: audioRef.current!.duration,
          lastListened: Timestamp.now(),
        }, { merge: true });

        transaction.update(userRef, { lecturesCompleted: increment(1) });
      }).catch(error => {
        console.error("Transaction failed on lecture end:", error);
      });
    }

    closePlayer();
  }, [user, firestore, track, closePlayer]);

  const updateVideoListenHistory = useCallback(async () => {
    if (!user || !firestore || !iframeTrack || iframeTrack.type !== 'youtube' || !videoPlayerRef.current) return;

    const player = videoPlayerRef.current;
    if (typeof player.getCurrentTime !== 'function' || typeof player.getDuration !== 'function') return;

    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    if (currentTime > 0 && duration > 0 && iframeTrack.lectureId) {
      const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', iframeTrack.lectureId);
      const updateData: any = {
        lectureId: iframeTrack.lectureId,
        position: currentTime,
        duration: duration,
        lastListened: Timestamp.now(),
      };

      if (iframeTrack.seriesId) updateData.seriesId = iframeTrack.seriesId;

      setDoc(historyRef, updateData, { merge: true }).catch(error => {
        console.error("Failed to update video listen history:", error);
      });
    }
  }, [user, firestore, iframeTrack]);

  const markVideoAsComplete = useCallback(async () => {
    if (!user || !firestore || !iframeTrack?.lectureId) {
      toast({
        title: "غير قادر على إتمام الإجراء",
        description: "يرجى تسجيل الدخول والمحاولة مرة أخرى.",
        variant: "destructive",
      });
      return;
    }

    const userRef = doc(firestore, 'users', user.uid);
    const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', iframeTrack.lectureId);

    try {
      await runTransaction(firestore, async (transaction) => {
        const player = videoPlayerRef.current;
        const duration = player && typeof player.getDuration === 'function' ? player.getDuration() : 0;
        const historyDoc = await transaction.get(historyRef);

        const updateData: any = {
          lectureId: iframeTrack.lectureId,
          position: duration,
          duration: duration,
          lastListened: Timestamp.now(),
        };

        if (iframeTrack.seriesId) updateData.seriesId = iframeTrack.seriesId;

        transaction.set(historyRef, updateData, { merge: true });

        // Only increment if it wasn't already complete
        if (!historyDoc.exists() || (historyDoc.data().duration > 0 && (historyDoc.data().position / historyDoc.data().duration) < 0.95)) {
          transaction.update(userRef, { lecturesCompleted: increment(1) });
        }
      });
      toast({
        title: "اكتملت المحاضرة",
        description: `تم تحديد "${iframeTrack.title}" كمكتملة.`,
      });
      hidePlayer();
    } catch (error) {
      console.error("Failed to mark as complete:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحديد المحاضرة كمكتملة.",
        variant: "destructive",
      });
    }
  }, [user, firestore, iframeTrack, toast, hidePlayer]);

  const onPlayerStateChange = useCallback((event: any) => {
    if (event.data === 1) { // playing
      pauseTrack();
      if (videoUpdateIntervalRef.current) clearInterval(videoUpdateIntervalRef.current);
      videoUpdateIntervalRef.current = setInterval(updateVideoListenHistory, 10000);
    } else if (event.data === 2) { // paused
      if (videoUpdateIntervalRef.current) clearInterval(videoUpdateIntervalRef.current);
      updateVideoListenHistory();
    } else if (event.data === 0) { // ended
      if (videoUpdateIntervalRef.current) clearInterval(videoUpdateIntervalRef.current);
      if (user && firestore && iframeTrack?.lectureId) {
        const userRef = doc(firestore, 'users', user.uid);
        const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', iframeTrack.lectureId);
        runTransaction(firestore, async (transaction) => {
          const player = videoPlayerRef.current;
          if (!player || typeof player.getDuration !== 'function') return;
          const duration = player.getDuration();
          transaction.set(historyRef, {
            position: duration,
            duration: duration,
            lastListened: Timestamp.now(),
          }, { merge: true });
          transaction.update(userRef, { lecturesCompleted: increment(1) });
        }).catch(error => {
          console.error("Transaction failed on video end:", error);
        });
      }
      hidePlayer();
    }
  }, [pauseTrack, updateVideoListenHistory, user, firestore, iframeTrack, hidePlayer]);

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
    };
  }, [track, updateListenHistory, handleEnded]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.play().catch(e => console.error("Error playing audio:", e));
    } else {
      audioElement.pause();
    }
  }, [isPlaying]);


  // --- New Site Time Logic ---
  // Initialize time from firestore
  useEffect(() => {
    // Run only when user exists, firestore is available, and time hasn't been initialized yet.
    if (user && firestore && !hasInitializedTime) {
      const fetchInitialTime = async () => {
        const userRef = doc(firestore, 'users', user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const initialSeconds = Math.floor((data.minutesListened || 0) * 60);
            setSiteTimeInSeconds(initialSeconds);
          }
        } catch (e) {
          console.error("Failed to fetch initial site time", e);
        } finally {
          // Mark as initialized to prevent re-fetching and to trigger the timer effect.
          setHasInitializedTime(true);
        }
      };
      fetchInitialTime();
    } else if (!user) {
      // Reset when user logs out
      setHasInitializedTime(false);
      setSiteTimeInSeconds(0);
    }
  }, [user, firestore, hasInitializedTime]);

  // Timer to increment the counter
  useEffect(() => {
    // Start timer only after user is loaded and initial time is fetched
    if (!user || !hasInitializedTime) return;

    const interval = setInterval(() => {
      setSiteTimeInSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [user, hasInitializedTime]); // Dependency on initialization state is key

  // Periodically save to firestore
  useEffect(() => {
    if (!user || !firestore) return;

    const saveTimeToDb = () => {
      // Only save if initialization is complete and there's time to save
      if (hasInitializedTime && siteTimeInSeconds > 0) {
        const userRef = doc(firestore, 'users', user.uid);
        // No need to await, just fire and forget.
        setDoc(userRef, { minutesListened: siteTimeInSeconds / 60 }, { merge: true });
        lastSaveTime.current = Date.now();
      }
    }

    const saveInterval = setInterval(saveTimeToDb, 30000); // Save every 30 seconds

    const handleBeforeUnload = () => {
      // Save only if it has been a while since last save
      if (Date.now() - lastSaveTime.current > 5000) {
        saveTimeToDb();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveTimeToDb(); // Final save on component unmount or user change
    };
  }, [user, firestore, siteTimeInSeconds, hasInitializedTime]);


  return (
    <AudioPlayerContext.Provider value={{
      track,
      isPlaying,
      audioRef,
      clipEndTime,
      playTrack,
      pauseTrack,
      closePlayer,
      togglePlayPause,
      iframeTrack,
      isPlayerVisible,
      videoPlayerRef,
      playIframe,
      hidePlayer,
      setVideoClipEndTime,
      onPlayerStateChange,
      markVideoAsComplete,
      siteTimeInSeconds,
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};

