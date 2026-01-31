
'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useAppearance } from './appearance-provider';

const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};

interface TrianglifyBackgroundProps {
  className?: string;
}

export const TrianglifyBackground: React.FC<TrianglifyBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trianglifySettings } = useAppearance();

  const mouse = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (trianglifySettings.interaction) {
        mouse.current.x = event.x;
        mouse.current.y = event.y;
        draw();
    }
  }, [trianglifySettings.interaction]); // eslint-disable-line react-hooks/exhaustive-deps

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cellSize, variance, palette, interaction } = trianglifySettings;
    const seed = interaction ? mouse.current.x + mouse.current.y : 1;
    
    const rand = seededRandom(seed);

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    
    if (!palette || palette.length === 0) {
        return; // Don't draw if there is no palette
    }

    const vertices: [number, number][][] = [];

    for (let y = -cellSize; y <= height + cellSize; y += cellSize) {
      const row: [number, number][] = [];
      for (let x = -cellSize; x <= width + cellSize; x += cellSize) {
        const jitterX = variance > 0 ? (rand() - 0.5) * cellSize * variance : 0;
        const jitterY = variance > 0 ? (rand() - 0.5) * cellSize * variance : 0;
        row.push([x + jitterX, y + jitterY]);
      }
      vertices.push(row);
    }
    
    for (let y = 0; y < vertices.length - 1; y++) {
      for (let x = 0; x < vertices[y].length - 1; x++) {
        const v1 = vertices[y][x];
        const v2 = vertices[y][x + 1];
        const v3 = vertices[y + 1][x];
        const v4 = vertices[y + 1][x + 1];
        
        const color1 = palette[Math.floor(rand() * palette.length)];
        const color2 = palette[Math.floor(rand() * palette.length)];

        ctx.fillStyle = color1;
        ctx.beginPath();
        ctx.moveTo(v1[0], v1[1]);
        ctx.lineTo(v2[0], v2[1]);
        ctx.lineTo(v3[0], v3[1]);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.moveTo(v2[0], v2[1]);
        ctx.lineTo(v4[0], v4[1]);
        ctx.lineTo(v3[0], v3[1]);
        ctx.closePath();
        ctx.fill();
      }
    }

  }, [trianglifySettings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    if (trianglifySettings.interaction) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
       if (trianglifySettings.interaction) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [draw, trianglifySettings.interaction, handleMouseMove]);

  // Redraw when theme changes
  useEffect(() => {
      draw();
  }, [draw]);

  return <canvas ref={canvasRef} className={className} />;
};
