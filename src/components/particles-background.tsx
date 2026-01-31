
'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useAppearance } from './appearance-provider';

interface ParticlesBackgroundProps {
  className?: string;
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const { particleColor: customHexColor } = useAppearance();

  const toRgba = (hex: string, alpha: number) => {
    // Handle invalid hex colors
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
        return `rgba(255, 255, 255, ${alpha})`; // Default to white
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D, particlesArray: any[]) => {
    const defaultColor = resolvedTheme?.includes('dark') || resolvedTheme?.includes('night') ? '#FFFFFF' : '#000000';
    const finalColor = toRgba(customHexColor || defaultColor, 0.5);
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw(finalColor);
    }
    
    for (let i = 0; i < particlesArray.length; i++) {
        for(let j = i; j < particlesArray.length; j++) {
            const dx = particlesArray[i].x - particlesArray[j].x;
            const dy = particlesArray[i].y - particlesArray[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = finalColor;
                ctx.lineWidth = 0.2;
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                ctx.stroke();
            }
        }
    }
  }, [resolvedTheme, customHexColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particlesArray: any[] = [];
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      ctx: CanvasRenderingContext2D;

      constructor(x: number, y: number, directionX: number, directionY: number, size: number, context: CanvasRenderingContext2D) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.ctx = context;
      }

      draw(color: string) {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();
      }

      update() {
        if (this.x > this.ctx.canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > this.ctx.canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }
        this.x += this.directionX;
        this.y += this.directionY;
      }
    }

    function init() {
      particlesArray.length = 0;
      const numberOfParticles = (canvas.height * canvas.width) / 9000;
      for (let i = 0; i < Math.min(150, numberOfParticles); i++) { // Capped at 150 particles
        const size = (Math.random() * 2) + 1;
        const x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        const y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        const directionX = (Math.random() * .4) - .2;
        const directionY = (Math.random() * .4) - .2;
        particlesArray.push(new Particle(x, y, directionX, directionY, size, ctx));
      }
    }

    const render = () => {
      draw(ctx, particlesArray);
      animationFrameId = window.requestAnimationFrame(render);
    };

    init();
    render();
    
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    }
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className={className} />;
};
