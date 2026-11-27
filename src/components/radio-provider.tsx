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
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  currentTime: number;
  duration: number;
  seekTo: (seconds: number) => void;
};

const RadioContext = createContext<RadioContextType | null>(null);

export function useRadio() {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used inside RadioProvider');
  return ctx;
}

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  const match = clean.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  return match ? match[1] : null;
}

export function RadioProvider({ children }: { children: ReactNode }) {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [activeYoutubeId, setActiveYoutubeId] = useState<string | null>(null);
  const [ytStartSeconds, setYtStartSeconds] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentStationRef = useRef<RadioStation | null>(null);
  const fallbackTriggeredRef = useRef<boolean>(false);
  const pendingStartTimeRef = useRef<number>(0);

  // Load persistent playback rate on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRate = localStorage.getItem('radio_playback_rate');
      if (savedRate) {
        try {
          const rate = parseFloat(savedRate);
          setPlaybackRateState(rate);
          if (audioRef.current) {
            audioRef.current.playbackRate = rate;
          }
        } catch (e) {}
      }
    }
  }, []);

  // Lazy initialize single audio instance and register persistent listeners
  const getAudioInstance = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioRef.current) {
      const audio = new Audio();
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      
      audio.addEventListener('waiting', () => setIsBuffering(true));
      audio.addEventListener('playing', () => {
        setIsPlaying(true);
        setIsBuffering(false);
      });
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('canplay', () => setIsBuffering(false));
      
      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration) {
          setDuration(audio.duration);
        }
        if (pendingStartTimeRef.current > 0) {
          audio.currentTime = pendingStartTimeRef.current;
          pendingStartTimeRef.current = 0;
        }
      });

      audio.addEventListener('durationchange', () => {
        if (audio.duration) {
          setDuration(audio.duration);
        }
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
        if (audio.currentTime > 0 && currentStationRef.current) {
          localStorage.setItem(`radio_progress_${currentStationRef.current.id}`, Math.floor(audio.currentTime).toString());
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setIsBuffering(false);
        if (currentStationRef.current) {
          localStorage.removeItem(`radio_progress_${currentStationRef.current.id}`);
        }
      });

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
  }, [volume, playbackRate]);

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

  const playbackRateRef = useRef(1.0);
  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radio_playback_rate', rate.toString());
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setPlaybackRate',
          args: [rate],
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
    setYtStartSeconds(0);
    setCurrentTime(0);
    setDuration(0);
    try {
      sessionStorage.removeItem('radio_active_session');
      localStorage.removeItem('radio_last_station');
    } catch {}
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentStation) return;
    const ytId = getYoutubeId(currentStation.url);

    if (ytId) {
      if (activeYoutubeId !== ytId) {
        // Reload after page refresh cleanly
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('waqfah:media-started', { detail: { source: 'radio' } }));
        }
        const savedProgress = localStorage.getItem(`radio_progress_${currentStation.id}`);
        const startSec = savedProgress ? parseInt(savedProgress, 10) : 0;
        setYtStartSeconds(startSec);
        setCurrentTime(startSec);
        setActiveYoutubeId(ytId);
        setIsBuffering(true);
        return;
      }

      const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        if (isPlaying) {
          iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          setIsPlaying(false);
        } else {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('waqfah:media-started', { detail: { source: 'radio' } }));
          }
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          setIsPlaying(true);
        }
      }
      return;
    }

    let audio = audioRef.current;
    if (!audio || !audio.src || audio.src === window.location.href) {
      audio = getAudioInstance();
      if (!audio) return;
      const savedProgress = localStorage.getItem(`radio_progress_${currentStation.id}`);
      const startSec = savedProgress ? parseInt(savedProgress, 10) : 0;
      pendingStartTimeRef.current = startSec;
      audio.crossOrigin = 'anonymous';
      audio.src = currentStation.url;
      audio.volume = volume;
      audio.playbackRate = playbackRate;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('waqfah:media-started', { detail: { source: 'radio' } }));
      }
      setIsBuffering(true);
      audio.play().catch((err) => {
        console.error('Radio resume error:', err);
        setIsBuffering(false);
      });
    }
  }, [currentStation, activeYoutubeId, isPlaying, getAudioInstance, volume, playbackRate]);

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

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('waqfah:media-started', { detail: { source: 'radio' } }));
      }
      try {
        sessionStorage.setItem('radio_active_session', '1');
      } catch {}

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
        const savedProgress = localStorage.getItem(`radio_progress_${station.id}`);
        const startSecond = savedProgress ? parseInt(savedProgress, 10) : 0;
        setYtStartSeconds(startSecond);
        setActiveYoutubeId(ytId);
        setCurrentStation(station);
        currentStationRef.current = station;
        setIsPlaying(false);
        setIsBuffering(true);
        setCurrentTime(startSecond);
        setDuration(0);
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
      setYtStartSeconds(0);
      
      const audioInstance = getAudioInstance();
      if (audioInstance) {
        fallbackTriggeredRef.current = false;
        currentStationRef.current = station;
        setCurrentStation(station);

        const savedProgress = localStorage.getItem(`radio_progress_${station.id}`);
        const startSecond = savedProgress ? parseInt(savedProgress, 10) : 0;
        pendingStartTimeRef.current = startSecond;
        setCurrentTime(startSecond);
        setDuration(0);

        audioInstance.crossOrigin = 'anonymous';
        audioInstance.src = station.url;
        audioInstance.volume = volume;
        audioInstance.playbackRate = playbackRate;
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
    [currentStation, activeYoutubeId, togglePlay, volume, getAudioInstance, playbackRate]
  );

  // Restore station on mount ONLY if active during this browser tab session
  useEffect(() => {
    try {
      const isSessionActive = sessionStorage.getItem('radio_active_session') === '1';
      if (!isSessionActive) return;
      const saved = localStorage.getItem('radio_last_station');
      if (saved) {
        const station: RadioStation = JSON.parse(saved);
        setCurrentStation(station);
        currentStationRef.current = station;
        const savedProgress = localStorage.getItem(`radio_progress_${station.id}`);
        if (savedProgress) {
          setCurrentTime(parseInt(savedProgress, 10));
        }
      }
    } catch {}
  }, []);

  // Auto-pause Radio/Podcast if user starts playing a Lecture track or Video
  useEffect(() => {
    const onOtherMediaStarted = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: string }>).detail;
      if (detail?.source && detail.source !== 'radio') {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
        setIsPlaying(false);
        setIsBuffering(false);
      }
    };
    window.addEventListener('waqfah:media-started', onOtherMediaStarted);
    return () => window.removeEventListener('waqfah:media-started', onOtherMediaStarted);
  }, []);

  // Listen to messages from the YouTube player iframe to sync play states
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
      }
      if (typeof data !== 'object' || !data) return;

      try {
        if (data.event === 'onStateChange' || (data.event === 'infoDelivery' && data.info && typeof data.info.playerState === 'number')) {
          const state = data.info?.playerState ?? data.info;
          if (state === 1) { // playing
            setIsPlaying(true);
            setIsBuffering(false);
            
            // Sync current speed and volume to YouTube
            const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
            if (iframe?.contentWindow) {
              iframe.contentWindow.postMessage(
                JSON.stringify({
                  event: 'command',
                  func: 'setPlaybackRate',
                  args: [playbackRateRef.current],
                }),
                '*'
              );
            }
          } else if (state === 2) { // paused
            setIsPlaying(false);
            setIsBuffering(false);
          } else if (state === 3) { // buffering
            setIsBuffering(true);
          } else if (state === 0) { // ended
            setIsPlaying(false);
            setIsBuffering(false);
            if (currentStationRef.current) {
              localStorage.removeItem(`radio_progress_${currentStationRef.current.id}`);
            }
          }
        }
        
        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            const time = data.info.currentTime;
            setCurrentTime(time);
            if (time > 0) {
              setIsPlaying(true);
              setIsBuffering(false);
            }
            if (time > 0 && currentStationRef.current) {
              localStorage.setItem(`radio_progress_${currentStationRef.current.id}`, Math.floor(time).toString());
            }
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
        }
      } catch (e) {
        // Not a valid event
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

  const seekTo = useCallback((seconds: number) => {
    if (audioRef.current && !activeYoutubeId) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    } else if (activeYoutubeId) {
      const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [seconds, true],
          }),
          '*'
        );
        setCurrentTime(seconds);
      }
    }
  }, [activeYoutubeId]);

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
        playbackRate,
        setPlaybackRate,
        currentTime,
        duration,
        seekTo,
      }}
    >
      {/* Global Background YouTube Audio Player */}
      {activeYoutubeId && (
        <iframe
          id="global-youtube-radio"
          key={activeYoutubeId}
          src={`https://www.youtube.com/embed/${activeYoutubeId}?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&start=${Math.floor(ytStartSeconds || 0)}&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
          className="pointer-events-none fixed -top-[9999px] -left-[9999px] w-10 h-10 opacity-0 overflow-hidden"
          allow="autoplay; encrypted-media"
          title="global-youtube-audio"
          onLoad={() => {
            const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
            if (iframe?.contentWindow) {
              iframe.contentWindow.postMessage('{"event":"listening","id":1,"channel":"widget"}', '*');
              iframe.contentWindow.postMessage(
                JSON.stringify({
                  event: 'command',
                  func: 'setVolume',
                  args: [volume * 100],
                }),
                '*'
              );
              iframe.contentWindow.postMessage(
                JSON.stringify({
                  event: 'command',
                  func: 'setPlaybackRate',
                  args: [playbackRateRef.current],
                }),
                '*'
              );
              iframe.contentWindow.postMessage(
                JSON.stringify({
                  event: 'command',
                  func: 'playVideo',
                  args: [],
                }),
                '*'
              );
              // Fail-safe transition from buffering to playing
              setTimeout(() => {
                setIsBuffering(false);
                setIsPlaying(true);
              }, 700);
            }
          }}
        />
      )}
      {children}
    </RadioContext.Provider>
  );
}
