'use client';

import { useEffect, useRef } from 'react';
import {
  computeSpectrumBands,
  getOrCreateMediaAnalyser,
  resolveCanvasColor,
} from '@/lib/audio-spectrum';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  barColor?: string;
  currentTime?: number;
  playbackRate?: number;
  volume?: number;
  isBuffering?: boolean;
  variant?: 'compact' | 'expanded';
  className?: string;
}

export function AudioVisualizer({
  audioElement,
  isPlaying,
  barColor,
  currentTime = 0,
  playbackRate = 1,
  volume = 1,
  isBuffering = false,
  variant = 'compact',
  className,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const prevLevelsRef = useRef<number[]>([]);
  const liveStateRef = useRef({
    isPlaying,
    isBuffering,
    currentTime,
    playbackRate,
    volume,
    audioElement,
  });

  liveStateRef.current = {
    isPlaying,
    isBuffering,
    currentTime,
    playbackRate,
    volume,
    audioElement,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = variant === 'expanded' ? 36 : 16;
    if (prevLevelsRef.current.length !== barCount) {
      prevLevelsRef.current = new Array(barCount).fill(0);
    }

    let phase = 0;
    let width = (canvas.width = canvas.offsetWidth || (variant === 'expanded' ? 380 : 112));
    let height = (canvas.height = canvas.offsetHeight || (variant === 'expanded' ? 56 : 24));

    const handleResize = () => {
      if (!canvas) return;
      if (canvas.offsetWidth > 0) width = canvas.width = canvas.offsetWidth;
      if (canvas.offsetHeight > 0) height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const drawFrame = () => {
      const {
        isPlaying: playing,
        isBuffering: buffering,
        currentTime: time,
        playbackRate: rate,
        volume: vol,
        audioElement: audioEl,
      } = liveStateRef.current;

      const resolvedColor = resolveCanvasColor(canvas, barColor, '#10b981');
      const graph = playing && audioEl ? getOrCreateMediaAnalyser(audioEl) : null;

      phase += playing ? 0.085 * Math.max(0.5, rate) : 0.03;

      const { levels } = computeSpectrumBands({
        barCount,
        analyser: graph?.analyser,
        dataArray: graph?.dataArray,
        isPlaying: playing,
        isBuffering: buffering,
        currentTime: time,
        playbackRate: rate,
        volume: vol,
        phase,
        prevLevels: prevLevelsRef.current,
      });

      ctx.clearRect(0, 0, width, height);

      const slotWidth = width / barCount;
      const gap = variant === 'expanded' ? 3 : 2;
      const barWidth = Math.max(2, slotWidth - gap);
      const minHeight = variant === 'expanded' ? 4 : 2;
      const radius = Math.min(3, barWidth / 2);

      for (let i = 0; i < barCount; i++) {
        const level = levels[i] ?? 0;
        const barHeight = Math.max(minHeight, level * (height - 4));
        const x = i * slotWidth + gap / 2;
        const y = variant === 'expanded' ? (height - barHeight) / 2 : height - barHeight;

        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = playing || level > 0.05 ? 0.35 + level * 0.65 : 0.22;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, barHeight, radius);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [barColor, variant]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        variant === 'expanded'
          ? 'w-full max-w-md h-14 rounded-2xl bg-card/70 border border-border/70 px-3 py-1.5 shadow-inner'
          : 'w-[108px] h-6 opacity-85 group-hover:opacity-100 transition-opacity',
        className
      )}
    />
  );
}
