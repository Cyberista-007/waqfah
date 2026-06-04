'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

export type RadioStation = {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  icon: string;
  color: string;
  borderColor: string;
  textColor: string;
};

type RadioContextType = {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  setVolume: (v: number) => void;
  playStation: (station: RadioStation) => void;
  togglePlay: () => void;
  stopRadio: () => void;
  activeYoutubeId: string | null;
};

const RadioContext = createContext<RadioContextType | null>(null);

export function useRadio() {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used inside RadioProvider');
  return ctx;
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function RadioProvider({ children }: { children: ReactNode }) {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [activeYoutubeId, setActiveYoutubeId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync volume to audio element
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const stopRadio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentStation(null);
    setActiveYoutubeId(null);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentStation) return;
    const ytId = currentStation ? getYoutubeId(currentStation.url) : null;

    if (ytId) {
      const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        if (isPlaying) {
          iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          setIsPlaying(false);
        } else {
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          setIsPlaying(true);
        }
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  }, [currentStation, isPlaying]);

  const playStation = useCallback(
    (station: RadioStation) => {
      // Same station → toggle
      if (currentStation?.id === station.id) {
        togglePlay();
        return;
      }

      // Stop existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      // Stop existing YouTube
      if (activeYoutubeId) {
        const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
      }

      const ytId = getYoutubeId(station.url);
      if (ytId) {
        setActiveYoutubeId(ytId);
        setCurrentStation(station);
        setIsPlaying(true);
        setIsBuffering(false);
        // Save history
        try {
          const hist = JSON.parse(localStorage.getItem('quran_radio_history') || '[]') as string[];
          const next = [station.id, ...hist.filter((id) => id !== station.id)].slice(0, 10);
          localStorage.setItem('quran_radio_history', JSON.stringify(next));
        } catch {}
        return;
      }

      // Standard HTML5 audio
      setActiveYoutubeId(null);
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = station.url;
      audio.volume = volume;
      audioRef.current = audio;

      let fallbackTriggered = false;

      audio.addEventListener('waiting', () => setIsBuffering(true));
      audio.addEventListener('playing', () => {
        setIsPlaying(true);
        setIsBuffering(false);
      });
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('canplay', () => setIsBuffering(false));
      audio.addEventListener('error', () => {
        if (audio.crossOrigin === 'anonymous' && !fallbackTriggered) {
          fallbackTriggered = true;
          audio.removeAttribute('crossOrigin');
          audio.src = station.url;
          audio.load();
          setIsBuffering(true);
          audio.play().catch(() => {
            setIsBuffering(false);
            setIsPlaying(false);
          });
        } else {
          setIsBuffering(false);
          setIsPlaying(false);
        }
      });

      setCurrentStation(station);
      setIsBuffering(true);

      audio.play().catch((e) => {
        console.error('Radio play error:', e);
        setIsBuffering(false);
      });

      // Save history
      try {
        const hist = JSON.parse(localStorage.getItem('quran_radio_history') || '[]') as string[];
        const next = [station.id, ...hist.filter((id) => id !== station.id)].slice(0, 10);
        localStorage.setItem('quran_radio_history', JSON.stringify(next));
      } catch {}
    },
    [currentStation, activeYoutubeId, togglePlay, volume]
  );

  // Restore last playing station on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('radio_last_station');
      if (saved) {
        // Don't auto-play on mount — just restore state visually
        const station: RadioStation = JSON.parse(saved);
        setCurrentStation(station);
      }
    } catch {}
  }, []);

  // Persist current station
  useEffect(() => {
    if (currentStation) {
      localStorage.setItem('radio_last_station', JSON.stringify(currentStation));
    }
  }, [currentStation]);

  return (
    <RadioContext.Provider
      value={{
        currentStation,
        isPlaying,
        isBuffering,
        volume,
        setVolume,
        playStation,
        togglePlay,
        stopRadio,
        activeYoutubeId,
      }}
    >
      {children}
    </RadioContext.Provider>
  );
}
