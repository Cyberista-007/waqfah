'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Rewind,
  Timer,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FastForward,
  Maximize2,
  ChevronDown,
  Headphones,
} from 'lucide-react';

import { useAudioPlayer } from './audio-player-provider';
import { useMood } from './mood-provider';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { AudioVisualizer } from './audio-visualizer';
import { useToast } from '@/hooks/use-toast';
import { getPlaceholderImage } from '@/lib/images';
import { cn, getVideoIdFromUrl } from '@/lib/utils';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const floorSeconds = Math.floor(seconds);
  const hours = Math.floor(floorSeconds / 3600);
  const minutes = Math.floor((floorSeconds % 3600) / 60);
  const remainingSeconds = floorSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function FloatingAudioPlayer() {
  const {
    track,
    isPlaying,
    isYoutubeAudio,
    audioCurrentTime,
    audioDuration,
    audioRef,
    closePlayer,
    playTrack,
    pauseTrack,
    togglePlayPause,
    seekAudio,
    setAudioRate,
    setAudioVolume,
    setAudioMuted,
  } = useAudioPlayer();

  const { toast } = useToast();
  const { moodColor } = useMood();

  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [thumbFailed, setThumbFailed] = useState(false);

  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [sleepTimerDuration, setSleepTimerDuration] = useState(0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0);
  const [sleepTimerEndOfTrack, setSleepTimerEndOfTrack] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem('audioPlayerSpeed') || '1') || 1;
    }
    return 1;
  });

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setIsMounted(true);
    const savedVolume = localStorage.getItem('audioPlayerVolume');
    if (savedVolume) {
      const parsedVolume = parseFloat(savedVolume);
      if (Number.isFinite(parsedVolume)) {
        setVolume(parsedVolume);
        setAudioVolume(parsedVolume);
      }
    }
    const savedSpeed = localStorage.getItem('audioPlayerSpeed');
    if (savedSpeed) {
      const parsedSpeed = parseFloat(savedSpeed);
      if (Number.isFinite(parsedSpeed)) {
        setPlaybackSpeed(parsedSpeed);
        setAudioRate(parsedSpeed);
      }
    }
  }, [setAudioVolume, setAudioRate]);

  useEffect(() => {
    setThumbFailed(false);
  }, [track?.id]);

  // Sync progress & duration from unified AudioPlayerProvider
  useEffect(() => {
    setProgress(audioCurrentTime || 0);
    setDuration(audioDuration || 0);
  }, [audioCurrentTime, audioDuration]);

  const clearSleepTimer = () => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerDuration(0);
    setSleepTimerRemaining(0);
    setSleepTimerEndOfTrack(false);
    setAudioVolume(volume);
  };

  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, []);

  // Safe Media Session integration
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    if (!track) {
      try {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      } catch {}
      return;
    }

    const ytId = getVideoIdFromUrl(track.youtubeUrl || track.audioSrc);
    const placeholder = getPlaceholderImage(track.imageId);
    const artworkUrl = ytId
      ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
      : placeholder?.imageUrl;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.programName || track.seriesTitle || 'منصة وقفة',
        album: 'محاضرات ودروس وقفة',
        artwork: artworkUrl
          ? [{ src: artworkUrl, sizes: '480x360', type: 'image/jpeg' }]
          : [],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        playTrack(track, audioCurrentTime || 0);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pauseTrack();
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        seekAudio(Math.max(0, (audioCurrentTime || 0) - (details.seekOffset || 15)));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const nextPos = (audioCurrentTime || 0) + (details.seekOffset || 15);
        seekAudio(audioDuration ? Math.min(audioDuration, nextPos) : nextPos);
      });
    } catch {}
  }, [track, playTrack, pauseTrack, seekAudio, audioCurrentTime, audioDuration]);

  const handleRewind = () => {
    seekAudio(Math.max(0, progress - 15));
  };

  const handleFastForward = () => {
    const target = progress + 15;
    seekAudio(duration > 0 ? Math.min(duration, target) : target);
  };

  const handleSpeedChange = (value: string) => {
    const speed = parseFloat(value);
    setAudioRate(speed);
    setPlaybackSpeed(speed);
    localStorage.setItem('audioPlayerSpeed', value);
  };

  const setSleepTimer = (minutes: number) => {
    clearSleepTimer();
    setSleepTimerEndOfTrack(false);
    if (minutes > 0) {
      setSleepTimerDuration(minutes);
      setSleepTimerRemaining(minutes * 60);

      sleepTimerRef.current = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev <= 10 && prev > 1) {
            setAudioVolume(Math.max(0, (prev / 10) * volume));
          }
          if (prev <= 1) {
            pauseTrack();
            setAudioVolume(volume);
            toast({ title: 'مؤقت النوم', description: 'تم إيقاف التشغيل تلقائياً.' });
            clearSleepTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({ title: 'مؤقت النوم', description: `سيتم إيقاف التشغيل بعد ${minutes} دقيقة.` });
    }
  };

  const enableEndOfTrackTimer = () => {
    clearSleepTimer();
    setSleepTimerEndOfTrack(true);
    toast({
      title: 'مؤقت النوم',
      description: 'سيتم إيقاف التشغيل تلقائياً عند نهاية المقطع الحالي.',
    });
  };

  const handleSeek = (value: number[]) => {
    seekAudio(value[0]);
    setProgress(value[0]);
  };

  const handleVolumeChange = (value: number) => {
    const newVolume = Math.max(0, Math.min(1, value / 100));
    setVolume(newVolume);
    setAudioVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setAudioMuted(false);
      setIsMuted(false);
    }
    localStorage.setItem('audioPlayerVolume', newVolume.toString());
  };

  const toggleMute = () => {
    const currentlyMuted = !isMuted;
    setAudioMuted(currentlyMuted);
    setIsMuted(currentlyMuted);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!track) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleRewind();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleFastForward();
          break;
        case 'KeyM':
          event.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [track, togglePlayPause, progress, duration, isMuted]);

  if (!isMounted || !track) {
    return null;
  }

  const ytId = getVideoIdFromUrl(track.youtubeUrl || track.audioSrc);
  const placeholder = getPlaceholderImage(track.imageId);
  const artworkUrl = !thumbFailed
    ? ytId
      ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
      : placeholder?.imageUrl || ''
    : '';

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-2xl p-4 sm:p-6 md:p-8 overflow-y-auto"
          >
            <div className="container mx-auto max-w-5xl min-h-full flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center shrink-0">
                <div className="text-xl sm:text-2xl font-black font-headline text-primary">
                  وقفة
                </div>
                <Button
                  onClick={() => setIsExpanded(false)}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  aria-label="تصغير المشغل"
                >
                  <ChevronDown className="w-5 h-5" />
                </Button>
              </div>

              <div
                className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 flex-1 justify-center py-2"
                dir="rtl"
              >
                <div className="relative w-44 h-44 sm:w-56 sm:h-56 lg:w-[min(21rem,42vh)] lg:h-[min(21rem,42vh)] rounded-3xl overflow-hidden shadow-2xl border border-border bg-muted shrink-0">
                  {artworkUrl ? (
                    <img
                      src={artworkUrl}
                      alt={track.title}
                      onError={() => setThumbFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                      <Headphones className="w-14 h-14" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-right space-y-4 w-full min-w-0">
                  <div className="w-full">
                    <h1 className="text-xl sm:text-3xl lg:text-4xl font-black font-headline text-foreground leading-snug mb-1.5 line-clamp-3">
                      {track.title}
                    </h1>
                    {track.programName && (
                      <p className="text-sm sm:text-lg text-primary font-bold truncate">
                        {track.programName}
                      </p>
                    )}
                  </div>

                  <div className="w-full space-y-4">
                    <div className="space-y-1.5" dir="ltr">
                      <Slider
                        value={[progress]}
                        max={duration || 1}
                        step={1}
                        onValueChange={handleSeek}
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center lg:justify-start gap-5">
                      <Button
                        onClick={handleRewind}
                        variant="ghost"
                        size="icon"
                        className="w-11 h-11 rounded-full"
                        aria-label="تأخير 15 ثانية"
                      >
                        <Rewind className="w-5 h-5" />
                      </Button>

                      <Button
                        onClick={togglePlayPause}
                        size="icon"
                        className="w-14 h-14 rounded-full shadow-lg"
                        aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 fill-current" />
                        )}
                      </Button>

                      <Button
                        onClick={handleFastForward}
                        variant="ghost"
                        size="icon"
                        className="w-11 h-11 rounded-full"
                        aria-label="تقديم 15 ثانية"
                      >
                        <FastForward className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                      <Select
                        onValueChange={handleSpeedChange}
                        value={playbackSpeed.toString()}
                      >
                        <SelectTrigger className="w-24 h-9 font-bold rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[110] rounded-xl">
                          {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                            <SelectItem key={s} value={s.toString()}>
                              {s}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-3 bg-muted/60 px-3 py-1.5 rounded-xl border border-border w-44">
                        <button
                          type="button"
                          onClick={toggleMute}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <Slider
                          value={[isMuted ? 0 : volume * 100]}
                          max={100}
                          step={1}
                          onValueChange={(value) => handleVolumeChange(value[0])}
                          className="flex-grow"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center shrink-0 pt-1">
                <AudioVisualizer
                  audioElement={audioRef.current}
                  isPlaying={isPlaying}
                  barColor={moodColor || 'hsl(var(--primary))'}
                  currentTime={progress}
                  playbackRate={playbackSpeed}
                  volume={isMuted ? 0 : volume}
                  transcript={track.transcript}
                  variant="expanded"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Mini Audio Player Card */}
      <aside
        aria-label="مشغل الصوت للمحاضرة"
        dir="rtl"
        className={cn(
          'fixed right-4 md:right-8 z-50 w-[min(23rem,calc(100vw-2rem))] rounded-2xl border border-border/85 bg-card/95 text-card-foreground backdrop-blur-xl shadow-2xl transition-all duration-300',
          'bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] md:bottom-6',
          isExpanded && 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        <div className="flex flex-col p-3.5 gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
              {artworkUrl ? (
                <img
                  src={artworkUrl}
                  alt={track.title}
                  onError={() => setThumbFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                  <Headphones className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-black font-headline truncate leading-snug">
                <Link
                  href={`/lectures/${track.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {track.title}
                </Link>
              </p>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-[11px] text-muted-foreground truncate">
                  {track.programName || (isYoutubeAudio ? 'استماع صوتي' : 'محاضرة صوتية')}
                </p>
                <div className="shrink-0">
                  <AudioVisualizer
                    audioElement={audioRef.current}
                    isPlaying={isPlaying}
                    barColor="hsl(var(--primary))"
                    currentTime={progress}
                    playbackRate={playbackSpeed}
                    volume={isMuted ? 0 : volume}
                    transcript={track.transcript}
                    variant="compact"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                onClick={() => setIsExpanded(true)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary"
                title="توسيع المشغل"
                aria-label="توسيع المشغل"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={closePlayer}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="إغلاق المشغل"
                aria-label="إغلاق المشغل"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1" dir="ltr">
            <Slider
              value={[progress]}
              max={duration || 1}
              step={1}
              onValueChange={handleSeek}
              className="flex-grow h-1.5"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size={sleepTimerRemaining > 0 || sleepTimerEndOfTrack ? 'sm' : 'icon'}
                    className={cn(
                      'h-8 text-muted-foreground rounded-xl',
                      (sleepTimerDuration > 0 || sleepTimerEndOfTrack) &&
                        'text-primary bg-primary/10 px-2 font-mono text-[11px] font-bold'
                    )}
                    title="مؤقت النوم"
                  >
                    <Timer
                      className={cn(
                        'w-4 h-4',
                        (sleepTimerDuration > 0 || sleepTimerEndOfTrack) &&
                          'me-1 text-primary animate-pulse'
                      )}
                    />
                    {sleepTimerEndOfTrack
                      ? 'النهاية'
                      : sleepTimerRemaining > 0
                      ? formatCountdown(sleepTimerRemaining)
                      : null}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-52 p-2 rounded-2xl border-border bg-popover shadow-xl"
                  dir="rtl"
                >
                  <div className="space-y-1">
                    <p className="px-2 py-1 text-[11px] font-bold text-muted-foreground">
                      مؤقت النوم
                    </p>
                    {[15, 30, 45, 60].map((mins) => (
                      <Button
                        key={mins}
                        onClick={() => setSleepTimer(mins)}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start rounded-xl text-xs font-bold"
                      >
                        بعد {mins} دقيقة
                      </Button>
                    ))}
                    <Button
                      onClick={enableEndOfTrackTimer}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start rounded-xl text-xs font-bold"
                    >
                      عند نهاية المقطع
                    </Button>
                    {(sleepTimerDuration > 0 || sleepTimerEndOfTrack) && (
                      <Button
                        onClick={clearSleepTimer}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-destructive rounded-xl text-xs font-bold"
                      >
                        إلغاء المؤقت
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Select onValueChange={handleSpeedChange} value={playbackSpeed.toString()}>
                <SelectTrigger className="w-[58px] h-8 text-[11px] font-bold rounded-xl bg-muted/60 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {[1, 1.25, 1.5, 2].map((s) => (
                    <SelectItem key={s} value={s.toString()} className="text-xs font-bold">
                      {s}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                onClick={handleRewind}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                title="تأخير 15 ثانية"
                aria-label="تأخير 15 ثانية"
              >
                <Rewind className="w-4 h-4" />
              </Button>

              <Button
                onClick={togglePlayPause}
                size="icon"
                className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </Button>

              <Button
                onClick={handleFastForward}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                title="تقديم 15 ثانية"
                aria-label="تقديم 15 ثانية"
              >
                <FastForward className="w-4 h-4" />
              </Button>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 rounded-xl',
                    isMuted || volume === 0
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                  title={isMuted ? 'الصوت مكتوم' : `مستوى الصوت: ${Math.round(volume * 100)}%`}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-14 p-3 flex flex-col items-center gap-2 rounded-2xl border-border bg-popover shadow-xl"
                align="end"
              >
                <span className="text-[10px] font-mono font-bold text-muted-foreground">
                  {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                </span>
                <div className="h-24 flex items-center justify-center">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    orientation="vertical"
                    onValueChange={(value) => handleVolumeChange(value[0])}
                    className="h-full"
                  />
                </div>
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-destructive" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </aside>
    </>
  );
}
