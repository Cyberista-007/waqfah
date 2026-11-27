'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  barColor?: string;
}

const DEFAULT_COLOR = '#10b981';

function resolveCanvasColor(canvas: HTMLCanvasElement, color?: string): string {
  if (!color) return DEFAULT_COLOR;
  try {
    if (!color.includes('var(')) return color;
    const match = color.match(/var\((--[^)]+)\)/);
    if (!match) return DEFAULT_COLOR;
    const raw = getComputedStyle(canvas).getPropertyValue(match[1]).trim();
    if (!raw) return DEFAULT_COLOR;
    // Tailwind HSL variable format: e.g. "160 84% 39%"
    if (/^\d/.test(raw) && !raw.startsWith('#') && !raw.startsWith('hsl') && !raw.startsWith('rgb')) {
      return `hsl(${raw})`;
    }
    return raw;
  } catch {
    return DEFAULT_COLOR;
  }
}

export function AudioVisualizer({ audioElement, isPlaying, barColor }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resolvedColor = resolveCanvasColor(canvas, barColor);
    const barCount = 18;
    const stepWidth = canvas.width / barCount;
    const barWidth = Math.max(2, stepWidth - 2.5);
    let phase = 0;

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isPlaying) {
        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = 0.25;
        for (let i = 0; i < barCount; i++) {
          ctx.fillRect(i * stepWidth, canvas.height - 2, barWidth, 2);
        }
        return;
      }

      phase += 0.14;
      ctx.fillStyle = resolvedColor;

      // Also reflect real audio output if native HTMLAudioElement is actively playing unmuted audio
      const isNativeAudioPlaying =
        Boolean(audioElement) && !audioElement!.paused && Boolean(audioElement!.currentSrc);

      for (let i = 0; i < barCount; i++) {
        const wave = Math.abs(Math.sin(phase + i * 0.55)) * 0.65 + Math.abs(Math.cos(phase * 0.7 - i * 0.3)) * 0.35;
        const scale = isNativeAudioPlaying ? wave : wave * 0.85;
        const barHeight = Math.max(3, scale * (canvas.height - 2));
        ctx.globalAlpha = 0.45 + wave * 0.45;
        ctx.fillRect(i * stepWidth, canvas.height - barHeight, barWidth, barHeight);
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [audioElement, isPlaying, barColor]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={24}
      className="opacity-80 group-hover:opacity-100 transition-opacity"
    />
  );
}
