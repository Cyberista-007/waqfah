"use client"

import type { ReactNode } from "react";
import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import type { Lecture } from "@/lib/types";
import type { YouTubePlayer } from "react-youtube";

export type Track = Pick<Lecture, 'audioSrc' | 'title' | 'id' | 'seriesId' | 'seriesTitle' | 'seriesSlug' | 'imageId' | 'slug' | 'programName'>;
export type IframeTrack = { 
    type: 'youtube' | 'soundcloud';
    src: string; // youtube videoId or soundcloud URL
    title: string;
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
  videoPlayerRef: React.RefObject<YouTubePlayer | null>; // Kept for YouTube specific interactions
  playIframe: (track: IframeTrack) => void;
  hidePlayer: () => void;
  setVideoClipEndTime: (endTime: number | null) => void;
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
  const videoPlayerRef = useRef<YouTubePlayer | null>(null);
  const [videoClipEndTime, setVideoClipEndTime] = useState<number | null>(null);

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

  const playTrack = (newTrack: Track, startTime: number = 0, endTime: number | null = null) => {
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
  };
  
  const playIframe = (track: IframeTrack) => {
    pauseTrack();
    setClipEndTime(null);
    setIframeTrack(track);
    setIsPlayerVisible(true);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else if (track) {
      playTrack(track, audioRef.current?.currentTime || 0);
    }
  }

  const closePlayer = () => {
    pauseTrack();
    setTrack(null);
    setClipEndTime(null);
  };

  const hidePlayer = () => {
    if (videoPlayerRef.current && typeof videoPlayerRef.current.destroy === 'function') {
        videoPlayerRef.current.destroy();
        videoPlayerRef.current = null;
    }
    setIsPlayerVisible(false);
    setIframeTrack(null);
    setVideoClipEndTime(null);
  };

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

    const checkTime = async () => {
        try {
            const currentTime = await player.getCurrentTime();
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
