'use client';

import { useEffect, useRef, useState } from 'react';
import {
  computeSpectrumBands,
  getOrCreateMediaAnalyser,
  resolveCanvasColor,
} from '@/lib/audio-spectrum';
import type { TranscriptItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export type VisualizerStyle = 'columns' | 'waves' | 'particles';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  barColor?: string;
  currentTime?: number;
  playbackRate?: number;
  volume?: number;
  isBuffering?: boolean;
  transcript?: TranscriptItem[];
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
  transcript,
  variant = 'compact',
  className,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const prevLevelsRef = useRef<number[]>([]);
  const [styleMode, setStyleMode] = useState<VisualizerStyle>('columns');

  const liveStateRef = useRef({
    isPlaying,
    isBuffering,
    currentTime,
    playbackRate,
    volume,
    audioElement,
    transcript,
    styleMode,
  });

  liveStateRef.current = {
    isPlaying,
    isBuffering,
    currentTime,
    playbackRate,
    volume,
    audioElement,
    transcript,
    styleMode,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth || (variant === 'expanded' ? 380 : 108);
      const h = canvas.clientHeight || (variant === 'expanded' ? 56 : 24);
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
    };

    updateSize();
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    resizeObserver?.observe(canvas);
    window.addEventListener('resize', updateSize);

    let phase = 0;

    const drawFrame = () => {
      const {
        isPlaying: playing,
        isBuffering: buffering,
        currentTime: time,
        playbackRate: rate,
        volume: vol,
        audioElement: audioEl,
        transcript: cues,
        styleMode: activeStyle,
      } = liveStateRef.current;

      const width = canvas.width;
      const height = canvas.height;
      const barCount =
        variant === 'compact' ? 16 : activeStyle === 'waves' ? 40 : 35;

      if (prevLevelsRef.current.length !== barCount) {
        prevLevelsRef.current = new Array(barCount).fill(0);
      }

      const resolvedColor = resolveCanvasColor(canvas, barColor, '#10b981');
      const graph = playing && audioEl ? getOrCreateMediaAnalyser(audioEl) : null;

      phase += playing ? 0.085 * Math.max(0.5, rate) : 0.025;

      const { levels, average } = computeSpectrumBands({
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
        transcript: cues,
      });

      ctx.clearRect(0, 0, width, height);

      if (variant === 'expanded' && activeStyle === 'waves') {
        const sliceWidth = width / barCount;
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let i = 0; i <= barCount; i++) {
          const level = levels[Math.min(i, barCount - 1)] ?? 0;
          const yVal = height - level * (height * 0.82) - 3;
          ctx.lineTo(i * sliceWidth, yVal);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = playing ? 0.25 : 0.08;
        ctx.fill();

        ctx.beginPath();
        for (let i = 0; i <= barCount; i++) {
          const level = levels[Math.min(i, barCount - 1)] ?? 0;
          const yVal = height - level * (height * 0.82) - 3;
          const xVal = i * sliceWidth;
          if (i === 0) ctx.moveTo(xVal, yVal);
          else ctx.lineTo(xVal, yVal);
        }
        ctx.strokeStyle = resolvedColor;
        ctx.globalAlpha = playing ? 0.95 : 0.35;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (variant === 'expanded' && activeStyle === 'particles') {
        const cX = width / 2;
        const cY = height / 2;
        const baseRadius = Math.min(width, height) * 0.18;
        const maxRadius = baseRadius + average * (height * 0.34);

        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = playing ? 0.22 : 0.08;
        ctx.beginPath();
        ctx.arc(cX, cY, maxRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = resolvedColor;
        ctx.globalAlpha = playing ? 0.8 : 0.25;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cX, cY, maxRadius, 0, Math.PI * 2);
        ctx.stroke();

        const dotCount = 8;
        for (let i = 0; i < dotCount; i++) {
          const angle = (i / dotCount) * Math.PI * 2 + phase * 0.18;
          const dist = maxRadius + (levels[i % barCount] ?? 0) * 8;
          const pX = cX + Math.cos(angle) * dist;
          const pY = cY + Math.sin(angle) * dist;
          ctx.fillStyle = resolvedColor;
          ctx.globalAlpha = playing ? 0.9 : 0.25;
          ctx.beginPath();
          ctx.arc(pX, pY, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Default: glowing rounded columns matching the Radio page visualizer
        const slotWidth = width / barCount;
        const gap = variant === 'expanded' ? 3 : 2;
        const barWidth = Math.max(2, slotWidth - gap);
        const minHeight = variant === 'expanded' ? 4 : 2;
        const radius = Math.min(3, barWidth / 2);

        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, resolvedColor);
        grad.addColorStop(0.75, resolvedColor);
        grad.addColorStop(1, '#ffffff');

        for (let i = 0; i < barCount; i++) {
          const level = levels[i] ?? 0;
          const barHeight = Math.max(minHeight, level * (height - 4));
          const x = i * slotWidth + gap / 2;
          const y = height - barHeight;

          ctx.fillStyle = variant === 'expanded' ? grad : resolvedColor;
          ctx.globalAlpha = playing || level > 0.05 ? 0.4 + level * 0.6 : 0.2;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, barWidth, barHeight, radius);
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateSize);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [barColor, variant]);

  if (variant === 'compact') {
    return (
      <canvas
        ref={canvasRef}
        className={cn(
          'w-[108px] h-6 opacity-85 group-hover:opacity-100 transition-opacity',
          className
        )}
      />
    );
  }

  return (
    <div className={cn('w-full max-w-md flex flex-col items-center gap-2', className)}>
      <div className="w-full h-14 rounded-2xl bg-black/45 border border-border/80 p-2 overflow-hidden flex items-center justify-center shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
      <div className="flex items-center gap-1.5" dir="rtl">
        {(['columns', 'waves', 'particles'] as const).map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setStyleMode(style)}
            className={cn(
              'text-[10px] px-3 py-0.5 rounded-full transition-all cursor-pointer font-bold',
              styleMode === style
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:text-foreground'
            )}
          >
            {style === 'columns' ? 'أعمدة' : style === 'waves' ? 'أمواج' : 'نبض'}
          </button>
        ))}
      </div>
    </div>
  );
}
