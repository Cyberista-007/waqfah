'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  barColor?: string;
}

export function AudioVisualizer({ audioElement, isPlaying, barColor = '#8b5cf6' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    // Initialize Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    
    // Connect audio element to analyser
    // Only connect if not already connected (to prevent errors on re-mount)
    if (!sourceRef.current) {
        try {
            const source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            sourceRef.current = source;
        } catch (e) {
            console.warn("Audio source already connected or blocked by CORS", e);
        }
    }

    analyser.fftSize = 64; // Smaller for a simpler look
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isPlaying) {
          // Flatten bars when paused
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            ctx.fillStyle = barColor; // Use primary color
            ctx.globalAlpha = 0.2;
            ctx.fillRect(x, canvas.height - 2, barWidth - 2, 2);
            x += barWidth;
          }
          return;
      }

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient for a premium look
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, barColor);
        gradient.addColorStop(1, `${barColor}33`); // Transparent version

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.8;
        
        // Rounded bars logic (simulated with rect)
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // We don't close the audioContext here to avoid re-initializing issues
    };
  }, [audioElement, isPlaying, barColor]);

  return (
    <canvas 
      ref={canvasRef} 
      width={120} 
      height={30} 
      className="opacity-60 group-hover:opacity-100 transition-opacity"
    />
  );
}
