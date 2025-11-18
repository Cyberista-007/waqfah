"use client"

import type { ReactNode } from "react";
import { createContext, useContext, useState, useRef } from "react";
import type { Lecture } from "@/lib/types";

export type Track = Pick<Lecture, 'audioSrc' | 'title' | 'id' | 'seriesId' | 'seriesTitle' | 'seriesSlug' | 'imageId' | 'slug'> & { src: string };


type AudioPlayerContextType = {
  track: Track | null;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  playTrack: (track: Track, startTime?: number) => void;
  pauseTrack: () => void;
  closePlayer: () => void;
  togglePlayPause: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playTrack = (newTrack: Track, startTime: number = 0) => {
    if (track?.src !== newTrack.src) {
        setTrack(newTrack);
    }
    // Use a timeout to ensure the state has updated and the audio element is ready
    setTimeout(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = startTime;
            setIsPlaying(true);
            audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        }
    }, 50);
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
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
  };

  return (
    <AudioPlayerContext.Provider value={{ track, isPlaying, audioRef, playTrack, pauseTrack, closePlayer, togglePlayPause }}>
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
