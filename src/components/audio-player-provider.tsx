"use client"

import type { ReactNode } from "react";
import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import type { Lecture } from "@/lib/types";
import type { YouTubePlayer } from "react-youtube";

export type Track = Pick<Lecture, 'audioSrc' | 'title' | 'id' | 'seriesId' | 'seriesTitle' | 'seriesSlug' | 'imageId' | 'slug' | 'programName'>;
export type VideoTrack = { videoId: string; title: string };

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

  // Video state
  videoTrack: VideoTrack | null;
  isPlayerVisible: boolean;
  videoPlayerRef: React.RefObject<YouTubePlayer | null>;
  playVideo: (track: VideoTrack) => void;
  hideVideoPlayer: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  // Audio State
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipEndTime, setClipEndTime] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Video State
  const [videoTrack, setVideoTrack] = useState<VideoTrack | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const videoPlayerRef = useRef<YouTubePlayer | null>(null);

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
  
  const playVideo = (track: VideoTrack) => {
    pauseTrack();
    setVideoTrack(track);
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

  const hideVideoPlayer = () => {
    // Stop the video to ensure it's fully terminated
    if (videoPlayerRef.current && typeof videoPlayerRef.current.stopVideo === 'function') {
      videoPlayerRef.current.stopVideo();
    }
    // Set state to cause the player component to unmount, which will trigger cleanup.
    setIsPlayerVisible(false);
    setVideoTrack(null);
  };

  // Effect to handle auto-pause at the end of a clip
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
      videoTrack,
      isPlayerVisible,
      videoPlayerRef,
      playVideo,
      hideVideoPlayer,
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
