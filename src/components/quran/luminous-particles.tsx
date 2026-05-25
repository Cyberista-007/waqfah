'use client';

import React, { useEffect, useRef } from 'react';

interface LuminousParticlesProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

class Particle {
  x: number = 0;
  y: number = 0;
  size: number = 0;
  speedX: number = 0;
  speedY: number = 0;
  opacity: number = 0;
  color: string = '';
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.reset();
    this.y = Math.random() * canvas.height; // Distribute initially
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = this.canvas.height + Math.random() * 20;
    this.size = Math.random() * 2 + 0.8;
    this.speedX = Math.random() * 0.4 - 0.2;
    this.speedY = -(Math.random() * 0.4 + 0.1);
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = `rgba(245, 158, 11, ${this.opacity})`;
  }

  update(volume: number) {
    this.x += this.speedX * (1 + volume * 3);
    this.y += this.speedY * (1 + volume * 4);

    if (this.y < -20 || this.x < -20 || this.x > this.canvas.width + 20) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.size * 3;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.fill();
  }
}

export function LuminousParticles({ audioRef, isPlaying }: LuminousParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dataArray = new Uint8Array(0);

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize Web Audio API safely
    const initAudio = () => {
      if (!audioRef.current || audioCtxRef.current) return;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Enable CORS on audio element
        audioRef.current.crossOrigin = 'anonymous';

        // Connect media element source
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        audioCtxRef.current = audioCtx;
        sourceNodeRef.current = source;
        analyserRef.current = analyser;
      } catch (err) {
        console.warn("Web Audio API not initialized or blocked:", err);
      }
    };

    const resumeAudioCtx = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    };

    if (isPlaying) {
      initAudio();
      resumeAudioCtx();
    }

    const particleCount = 45;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let volume = 0;
      const analyser = analyserRef.current;
      if (analyser && isPlaying) {
        try {
          if (dataArray.length === 0) {
            dataArray = new Uint8Array(analyser.frequencyBinCount);
          }
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          volume = sum / dataArray.length / 255;
        } catch (e) {
          volume = 0.05 + Math.random() * 0.1;
        }
      } else if (isPlaying) {
        // Fallback simulation when Web Audio API is restricted or not initialized
        volume = 0.04 + Math.sin(Date.now() / 400) * 0.04 + Math.random() * 0.02;
      }

      particles.forEach(p => {
        p.update(volume);
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [audioRef, isPlaying]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50 mix-blend-screen" />;
}
