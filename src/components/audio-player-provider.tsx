"use client"

import type { ReactNode } from "react";
import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import type { Lecture } from "@/lib/types";

export type Track = Pick<Lecture, 'audioSrc' | 'title' | 'id' | 'seriesId' | 'seriesTitle' | 'seriesSlug' | 'imageId' | 'slug' | 'programName'>;


type AudioPlayerContextType = {
  track: Track | null;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  clipEndTime: number | null;
  playTrack: (track: Track, startTime?: number, endTime?: number | null) => void;
  pauseTrack: () => void;
  closePlayer: () => void;
  togglePlayPause: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipEndTime, setClipEndTime] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const playTrack = (newTrack: Track, startTime: number = 0, endTime: number | null = null) => {
    // If it's a new track, update the state and the audio element's src
    if (track?.id !== newTrack.id) {
        setTrack(newTrack);
        if (audioRef.current) {
            audioRef.current.src = newTrack.audioSrc;
            audioRef.current.load();
        }
    }
    
    setClipEndTime(endTime);
    
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
    setClipEndTime(null);
  };

  // Effect to handle auto-pause at the end of a clip
  useEffect(() => {
      const audioElement = audioRef.current;
      if (!audioElement) return;

      const handleTimeUpdate = () => {
          if (clipEndTime && audioElement.currentTime >= clipEndTime) {
              pauseTrack();
              setClipEndTime(null); // Clear the clip end time
          }
      };

      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
          audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
  }, [audioRef, clipEndTime, pauseTrack]);


  return (
    <AudioPlayerContext.Provider value={{ track, isPlaying, audioRef, playTrack, pauseTrack, closePlayer, togglePlayPause, clipEndTime }}>
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
