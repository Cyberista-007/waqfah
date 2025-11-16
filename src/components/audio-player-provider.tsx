"use client"

import type { ReactNode } from "react";
import { createContext, useContext, useState, useRef } from "react";

type Track = {
  src: string;
  title: string;
};

type AudioPlayerContextType = {
  track: Track | null;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  closePlayer: () => void;
  togglePlayPause: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playTrack = (newTrack: Track) => {
    if (track?.src !== newTrack.src) {
        setTrack(newTrack);
    }
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };
  
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
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
