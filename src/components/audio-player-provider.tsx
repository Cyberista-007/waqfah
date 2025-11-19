
"use client"

import type { ReactNode } from "react";
import { createContext, useContext, useState, useRef } from "react";
import type { Lecture } from "@/lib/types";

export type Track = Pick<Lecture, 'audioSrc' | 'title' | 'id' | 'seriesId' | 'seriesTitle' | 'seriesSlug' | 'imageId' | 'slug'>;


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
    // If it's a new track, update the state and the audio element's src
    if (track?.id !== newTrack.id) {
        setTrack(newTrack);
        if (audioRef.current) {
            audioRef.current.src = newTrack.audioSrc;
            audioRef.current.load();
        }
    }
    
    // Use a timeout to ensure the audio element is ready for playback, especially for new tracks
    setTimeout(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = startTime;
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(e => console.error("Error playing audio:", e));
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
      // playTrack will handle setting isPlaying to true on successful playback
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
