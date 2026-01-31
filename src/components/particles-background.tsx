
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
  const { particleColor: customHexColor, particleSettings } = useAppearance();

  const mouse = useRef({
    x: null as number | null,
    y: null as number | null,
    radius: 150,
  });

  const handleMouseMove = (event: MouseEvent) => {
    mouse.current.x = event.x;
    mouse.current.y = event.y;
  };
  
  const handleMouseOut = () => {
    mouse.current.x = null;
    mouse.current.y = null;
  };


  const draw = useCallback((ctx: CanvasRenderingContext2D, particlesArray: any[]) => {
    const defaultColor = resolvedTheme?.includes('dark') || resolvedTheme?.includes('night') ? '#FFFFFF' : '#000000';
    const finalColor = toRgba(customHexColor || defaultColor, 0.5);
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw(finalColor);
    }
    
    const connectDistance = particleSettings.lineDistance;
    for (let i = 0; i < particlesArray.length; i++) {
        for(let j = i; j < particlesArray.length; j++) {
            const dx = particlesArray[i].x - particlesArray[j].x;
            const dy = particlesArray[i].y - particlesArray[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < connectDistance) {
                ctx.beginPath();
                ctx.strokeStyle = finalColor;
                ctx.lineWidth = 0.2;
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                ctx.stroke();
            }
        }
    }
  }, [resolvedTheme, customHexColor, particleSettings]);
  
  const toRgba = (hex: string, alpha: number) => {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
        return `rgba(255, 255, 255, ${alpha})`;
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particlesArray: any[] = [];
    
    if (particleSettings.interaction) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseout', handleMouseOut);
    }
    
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
        if (particleSettings.interaction && mouse.current.x !== null && mouse.current.y !== null) {
          let dx = mouse.current.x - this.x;
          let dy = mouse.current.y - this.y;
          let distance = Math.sqrt(dx*dx + dy*dy);
          if (distance < mouse.current.radius) {
            this.x -= dx / 20;
            this.y -= dy / 20;
          }
        }

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
      const numberOfParticles = particleSettings.count;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = (Math.random() * 2) + 1;
        const x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        const y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        const speed = particleSettings.speed || 0.3;
        const directionX = (Math.random() * speed * 2) - speed;
        const directionY = (Math.random() * speed * 2) - speed;
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
      if (particleSettings.interaction) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseout', handleMouseOut);
      }
    };
  }, [draw, particleSettings]);

  return <canvas ref={canvasRef} className={className} />;
};
