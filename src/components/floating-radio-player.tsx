'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  X,
  Radio,
  Podcast,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Loader2,
  RotateCcw,
  RotateCw,
  ExternalLink,
} from 'lucide-react';

import { useRadio } from './radio-provider';
import { cn } from '@/lib/utils';

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const SPEED_OPTIONS = [1.0, 1.25, 1.5, 2.0] as const;

export function FloatingRadioPlayer() {
  const {
    currentStation,
    isPlaying,
    isBuffering,
    volume,
    setVolume,
    togglePlay,
    stopRadio,
    playbackRate,
    setPlaybackRate,
    currentTime,
    duration,
    seekTo,
  } = useRadio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolume = useRef(volume > 0 ? volume : 0.8);

  useEffect(() => {
    if (volume > 0) {
      prevVolume.current = volume;
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  }, [volume]);

  if (!currentStation) return null;

  const isPodcast = currentStation.id.startsWith('podcast_');
  const hasDuration = Number.isFinite(duration) && duration > 0;
  const progressPct = hasDuration
    ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
    : 0;

  const subtitleText =
    currentStation.subtitle ||
    (isPodcast ? 'بودكاست وقفة' : 'بث إذاعي مباشر');

  const statusText = isBuffering
    ? 'جاري التحميل...'
    : isPlaying
    ? isPodcast
      ? 'يتم التشغيل'
      : 'مباشر الآن'
    : 'متوقف مؤقتاً';

  const handleMuteToggle = () => {
    if (isMuted || volume === 0) {
      setVolume(prevVolume.current || 0.8);
      setIsMuted(false);
    } else {
      prevVolume.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const hasImageIcon =
    Boolean(currentStation.icon) &&
    (currentStation.icon.startsWith('http://') ||
      currentStation.icon.startsWith('https://') ||
      currentStation.icon.startsWith('/'));

  return (
    <AnimatePresence>
      <motion.aside
        key="floating-radio-player"
        aria-label="مشغل الصوت العائم"
        dir="rtl"
        initial={{ y: 40, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className={cn(
          // Positioned on the bottom-right, safely clear of ChatWidget (left) and mobile bottom pill dock
          'fixed right-4 md:right-8 z-40',
          'bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] md:bottom-6',
          'w-[min(22.5rem,calc(100vw-2rem))]'
        )}
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/85 bg-card/95 text-card-foreground backdrop-blur-xl shadow-2xl">
          {/* Compact Top Bar */}
          <div className="flex items-center gap-3 p-2.5 sm:p-3">
            {/* Cover / Artwork Tile */}
            <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
              {isBuffering ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : hasImageIcon ? (
                <img
                  src={currentStation.icon}
                  alt={currentStation.name}
                  className="h-full w-full object-cover"
                />
              ) : isPodcast ? (
                <Podcast className="h-5 w-5 text-primary" />
              ) : (
                <Radio className="h-5 w-5 text-primary" />
              )}
            </div>

            {/* Real Synced Title & Subtitle */}
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-black font-headline text-foreground truncate leading-snug">
                {currentStation.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full shrink-0',
                    isBuffering
                      ? 'bg-amber-500 animate-pulse'
                      : isPlaying
                      ? 'bg-primary animate-pulse'
                      : 'bg-muted-foreground/40'
                  )}
                />
                <span className="truncate font-medium">
                  {subtitleText} · {statusText}
                </span>
              </div>
            </div>

            {/* Crisp Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={togglePlay}
                className="h-9 w-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isBuffering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
                title={isExpanded ? 'تصغير المشغل' : 'توسيع خيارات التشغيل'}
                aria-label={isExpanded ? 'تصغير المشغل' : 'توسيع خيارات التشغيل'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                onClick={stopRadio}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق المشغل"
                aria-label="إغلاق المشغل"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Slim Progress Bar in Collapsed State */}
          {!isExpanded && hasDuration && (
            <div className="h-1 w-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-[width] duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}

          {/* Expanded Controls Panel */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-border/70 bg-muted/25"
              >
                <div className="p-3 space-y-3">
                  {/* Seek Scrubber when duration is known */}
                  {hasDuration && (
                    <div className="space-y-1.5" dir="ltr">
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        step={1}
                        value={Math.min(currentTime, duration)}
                        onChange={(e) => seekTo(parseFloat(e.target.value))}
                        aria-label="شريط التقدم"
                        className="w-full h-1.5 accent-primary cursor-pointer rounded-full"
                      />
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span>{formatClock(currentTime)}</span>
                        <span>{formatClock(duration)}</span>
                      </div>
                    </div>
                  )}

                  {/* Seek ±15s & Speed Pills */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => seekTo(Math.max(0, currentTime - 15))}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-bold transition-colors cursor-pointer"
                        title="تأخير 15 ثانية"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>15ث</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          seekTo(
                            hasDuration
                              ? Math.min(duration, currentTime + 15)
                              : currentTime + 15
                          )
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-bold transition-colors cursor-pointer"
                        title="تقديم 15 ثانية"
                      >
                        <span>15ث</span>
                        <RotateCw className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {SPEED_OPTIONS.map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setPlaybackRate(rate)}
                          className={cn(
                            'px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border',
                            playbackRate === rate
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background/60 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                          )}
                        >
                          {rate === 1.0 ? '1x' : `${rate}x`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Single Volume Control + Destination Page Link */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={handleMuteToggle}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
                        title={isMuted || volume === 0 ? 'إلغاء الكتم' : 'كتم الصوت'}
                        aria-label={isMuted || volume === 0 ? 'إلغاء الكتم' : 'كتم الصوت'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-3.5 w-3.5 text-destructive" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        aria-label="مستوى الصوت"
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                    </div>

                    <Link
                      href={isPodcast ? '/podcasts' : '/radio'}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-colors shrink-0"
                    >
                      <span>{isPodcast ? 'البودكاست' : 'الإذاعة'}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
