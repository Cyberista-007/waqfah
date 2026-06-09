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
  channelId?: string;
  publishedAt?: string;
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
  audioRef: React.RefObject<HTMLAudioElement | null>;
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
  const currentStationRef = useRef<RadioStation | null>(null);
  const fallbackTriggeredRef = useRef<boolean>(false);

  // Lazy initialize single audio instance and register persistent listeners
  const getAudioInstance = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioRef.current) {
      const audio = new Audio();
      audio.volume = volume;
      
      audio.addEventListener('waiting', () => setIsBuffering(true));
      audio.addEventListener('playing', () => {
        setIsPlaying(true);
        setIsBuffering(false);
      });
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('canplay', () => setIsBuffering(false));
      
      audio.addEventListener('error', () => {
        const station = currentStationRef.current;
        if (!station) return;
        
        // When src is cleared or set to empty string, it triggers an error.
        // We bypass reloading in this case.
        if (!audio.src || audio.src === '' || audio.src === window.location.href) {
          setIsBuffering(false);
          setIsPlaying(false);
          return;
        }

        if (audio.crossOrigin === 'anonymous' && !fallbackTriggeredRef.current) {
          fallbackTriggeredRef.current = true;
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

      audioRef.current = audio;
    }
    return audioRef.current;
  }, [volume]);

  // Sync volume to audio element
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;

    // Send volume change command to YouTube iframe if present
    const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [v * 100],
        }),
        '*'
      );
    }
  }, []);

  const stopRadio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentStation(null);
    currentStationRef.current = null;
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
      const ytId = getYoutubeId(station.url);
      const audio = audioRef.current;

      // Same station AND already loaded/initialized → toggle
      const isAlreadyLoaded = ytId 
        ? (activeYoutubeId === ytId) 
        : (audio && (audio.src === station.url || audio.src === encodeURI(station.url)));

      if (currentStation?.id === station.id && isAlreadyLoaded) {
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

      if (ytId) {
        setActiveYoutubeId(ytId);
        setCurrentStation(station);
        currentStationRef.current = station;
        setIsPlaying(false);
        setIsBuffering(true);
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
      
      const audioInstance = getAudioInstance();
      if (audioInstance) {
        fallbackTriggeredRef.current = false;
        currentStationRef.current = station;
        setCurrentStation(station);

        audioInstance.crossOrigin = 'anonymous';
        audioInstance.src = station.url;
        audioInstance.volume = volume;
        setIsBuffering(true);

        audioInstance.play().catch((e) => {
          console.error('Radio play error:', e);
          setIsBuffering(false);
        });
      }

      // Save history
      try {
        const hist = JSON.parse(localStorage.getItem('quran_radio_history') || '[]') as string[];
        const next = [station.id, ...hist.filter((id) => id !== station.id)].slice(0, 10);
        localStorage.setItem('quran_radio_history', JSON.stringify(next));
      } catch {}
    },
    [currentStation, activeYoutubeId, togglePlay, volume, getAudioInstance]
  );

  // Restore last playing station on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('radio_last_station');
      if (saved) {
        // Don't auto-play on mount — just restore state visually
        const station: RadioStation = JSON.parse(saved);
        setCurrentStation(station);
        currentStationRef.current = station;
      }
    } catch {}
  }, []);

  // Listen to messages from the YouTube player iframe to sync play states
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;
      if (!event.origin.includes('youtube.com')) return;

      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange') {
          const state = data.info;
          if (state === 1) { // playing
            setIsPlaying(true);
            setIsBuffering(false);
          } else if (state === 2) { // paused
            setIsPlaying(false);
            setIsBuffering(false);
          } else if (state === 3) { // buffering
            setIsBuffering(true);
          } else if (state === 0) { // ended
            setIsPlaying(false);
            setIsBuffering(false);
          }
        }
      } catch (e) {
        // Not a JSON message or not from YouTube API
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
        audioRef,
      }}
    >
      {children}
    </RadioContext.Provider>
  );
}
