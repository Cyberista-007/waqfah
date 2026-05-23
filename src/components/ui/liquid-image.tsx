'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

export interface Hotspot {
  x: number;
  y: number;
}

export interface LiquidImageProps {
  sourceType?: 'image' | 'video';
  image?: string | { src: string; alt?: string };
  video?: string;
  strength?: number;
  speed?: number;
  fit?: 'cover' | 'contain' | 'fill';
  borderRadius?: number;
  hotspots?: Hotspot[];
  style?: React.CSSProperties;
  className?: string;
}

const defaultImage = {
  src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
  alt: 'Gradient Background'
};

export function LiquidImage({
  sourceType = 'image',
  image = defaultImage,
  video = '',
  strength = 0.15,
  speed = 0.18,
  fit = 'cover',
  borderRadius = 8,
  hotspots = [],
  style,
  className
}: LiquidImageProps) {
  const isVideo = sourceType === 'video' && !!video;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const offCanvasRef = useRef<HTMLCanvasElement | null>(null); // Reused offscreen canvas for performance
  
  const [isMounted, setIsMounted] = useState(false);
  const [size, setSize] = useState({ width: 400, height: 300 });
  const sizeRef = useRef({ width: 400, height: 300 });
  const dprRef = useRef(1);
  const fitRef = useRef(fit);
  
  // Keep fit ref up to date
  fitRef.current = fit;

  // Animation and interaction refs
  const mouseRef = useRef({ x: -10, y: -10, active: false });
  const maskRadiusRef = useRef(0);
  const wakeRef = useRef<Array<{ x: number; y: number; t: number }>>([]);
  const hotspotsRef = useRef<Hotspot[]>(hotspots);
  const hoveredRef = useRef(false);

  // Sync hotspots prop changes
  useEffect(() => {
    hotspotsRef.current = hotspots;
  }, [hotspots]);

  // Mount logic
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Size tracking: observe the wrapper element and use ResizeObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const rect = el.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));

      sizeRef.current = { width: w, height: h };
      setSize(prev => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
    };

    measure();

    if (typeof window.ResizeObserver !== 'undefined') {
      const ro = new window.ResizeObserver(measure);
      ro.observe(el);
      window.addEventListener('resize', measure);
      return () => {
        ro.disconnect();
        window.removeEventListener('resize', measure);
      };
    } else {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
  }, [isMounted]);

  // Mouse move events
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    mouseRef.current = { x, y, active: true };
    hoveredRef.current = true;

    // Add a wake point (limit to 8 recent)
    const now = Date.now();
    wakeRef.current = [
      ...wakeRef.current.filter(w => now - w.t < 1200),
      { x, y, t: now }
    ].slice(-8);
  }, []);

  const handleLeave = useCallback(() => {
    mouseRef.current = { ...mouseRef.current, active: false };
    hoveredRef.current = false;
  }, []);

  // Animate mask radius on hover in/out (easeInOutCubic)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let animId: number;
    let lastHovered = false;
    let start: number | null = null;
    let from = 0;
    let to = 0;
    const duration = 650; // ms

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animate(ts: number) {
      const hovered = hoveredRef.current;
      if (hovered !== lastHovered) {
        lastHovered = hovered;
        start = ts;
        from = maskRadiusRef.current;
        to = hovered ? 1.5 : 0;
      }
      if (start === null) start = ts;
      const elapsed = Math.min((ts - start) / duration, 1);
      const eased = easeInOutCubic(elapsed);
      maskRadiusRef.current = from + (to - from) * eased;

      if (elapsed < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        maskRadiusRef.current = to;
        animId = requestAnimationFrame(animate);
      }
    }

    animId = requestAnimationFrame(animate);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isMounted]);

  // WebGL rendering setup
  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted || !canvasRef.current) return;

    const initialDpr = dprRef.current || 1;
    const initialSize = sizeRef.current;
    canvasRef.current.width = initialSize.width;
    canvasRef.current.height = initialSize.height;
    canvasRef.current.style.width = `${initialSize.width / initialDpr}px`;
    canvasRef.current.style.height = `${initialSize.height / initialDpr}px`;

    let appliedW = initialSize.width;
    let appliedH = initialSize.height;
    let gl = canvasRef.current.getContext('webgl');
    if (!gl) return;

    let animationId: number;
    let img: HTMLImageElement | null = null;
    let videoEl: HTMLVideoElement | null = null;
    let mediaReady = false;

    // Resolve source content
    const imgSrc = typeof image === 'string' ? image : image.src;

    if (isVideo) {
      videoEl = document.createElement('video');
      videoEl.crossOrigin = 'anonymous';
      videoEl.src = video;
      videoEl.muted = true;
      videoEl.loop = true;
      videoEl.playsInline = true;
      videoEl.autoplay = true;
      videoEl.setAttribute('playsinline', '');
      videoElRef.current = videoEl;
    } else {
      img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = imgSrc;
    }

    let tex: WebGLTexture | null = null;
    let program: WebGLProgram | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uMouse: WebGLUniformLocation | null = null;
    let uStrength: WebGLUniformLocation | null = null;
    let uSpeed: WebGLUniformLocation | null = null;
    let uResolution: WebGLUniformLocation | null = null;
    let uWake: WebGLUniformLocation | null = null;
    let uWakeCount: WebGLUniformLocation | null = null;
    let uMaskRadius: WebGLUniformLocation | null = null;
    
    const startTime = Date.now();
    let loaded = false;

    // Shaders
    const vs = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_image;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_strength;
      uniform float u_speed;
      uniform vec2 u_resolution;
      #define MAX_WAKE 16
      uniform int u_wakeCount;
      uniform vec3 u_wake[MAX_WAKE];
      uniform float u_maskRadius;
      void main() {
        vec2 uv = v_uv;
        // Wake ripples
        for (int i = 0; i < MAX_WAKE; ++i) {
          if (i >= u_wakeCount) break;
          vec2 w = u_wake[i].xy;
          float t = u_time - u_wake[i].z;
          float dist = distance(uv, w);
          float amp = exp(-dist * 16.0) * exp(-t * 1.2);
          float ripple = sin(32.0 * dist - t * 8.0 * u_speed) * 0.04;
          uv += normalize(uv - w) * ripple * u_strength * amp * 2.0;
        }
        // Live mouse ripple
        if (u_mouse.x >= 0.0 && u_mouse.x <= 1.0 && u_mouse.y >= 0.0 && u_mouse.y <= 1.0) {
          float dist = distance(uv, u_mouse);
          float ripple = sin(32.0 * dist - u_time * 8.0 * u_speed) * 0.04;
          float effect = exp(-dist * 12.0);
          uv += normalize(uv - u_mouse) * ripple * u_strength * effect * 2.0;
        }
        uv = clamp(uv, 0.0, 1.0);
        vec4 color = texture2D(u_image, uv);
        // Grayscale
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        vec3 grayColor = vec3(gray);
        // Reveal mask
        float mask = 0.0;
        float maskRadius = u_maskRadius;
        // Mouse mask
        if (u_mouse.x >= 0.0 && u_mouse.x <= 1.0 && u_mouse.y >= 0.0 && u_mouse.y <= 1.0 && maskRadius > 0.0) {
          float d = distance(uv, u_mouse);
          mask = max(mask, smoothstep(maskRadius, maskRadius * 0.8, d));
        }
        // Hotspot masks
        for (int i = 0; i < MAX_WAKE; ++i) {
          if (i >= u_wakeCount) break;
          vec2 w = u_wake[i].xy;
          float d = distance(uv, w);
          mask = max(mask, smoothstep(maskRadius, maskRadius * 0.8, d));
        }
        vec3 finalColor = mix(grayColor, color.rgb, mask);
        gl_FragColor = vec4(finalColor, color.a);
      }
    `;

    function createShader(type: number, src: string): WebGLShader | null {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    function createProgram(vsSrc: string, fsSrc: string): WebGLProgram | null {
      if (!gl) return null;
      const vshader = createShader(gl.VERTEX_SHADER, vsSrc);
      const fshader = createShader(gl.FRAGMENT_SHADER, fsSrc);
      if (!vshader || !fshader) return null;
      const p = gl.createProgram();
      if (!p) return null;
      gl.attachShader(p, vshader);
      gl.attachShader(p, fshader);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(p));
        return null;
      }
      return p;
    }

    function setup() {
      if (!gl) return;
      const p = createProgram(vs, fs);
      if (!p) return;
      program = p;
      gl.useProgram(program);

      // Setup full quad geometry
      const pos = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, pos);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      // Bind uniform locations
      uTime = gl.getUniformLocation(program, 'u_time');
      uMouse = gl.getUniformLocation(program, 'u_mouse');
      uStrength = gl.getUniformLocation(program, 'u_strength');
      uSpeed = gl.getUniformLocation(program, 'u_speed');
      uResolution = gl.getUniformLocation(program, 'u_resolution');
      uWake = gl.getUniformLocation(program, 'u_wake');
      uWakeCount = gl.getUniformLocation(program, 'u_wakeCount');
      uMaskRadius = gl.getUniformLocation(program, 'u_maskRadius');

      // Bind textures
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);

      loaded = true;
      mediaReady = true;
    }

    function getOffscreen(w: number, h: number): HTMLCanvasElement {
      let off = offCanvasRef.current;
      if (!off) {
        off = document.createElement('canvas');
        offCanvasRef.current = off;
      }
      if (off.width !== w || off.height !== h) {
        off.width = w;
        off.height = h;
      }
      return off;
    }

    if (isVideo && videoEl) {
      const startPlayback = () => {
        setup();
        const p = videoEl?.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
        render();
      };
      videoEl.addEventListener('loadeddata', startPlayback, { once: true });
      if (videoEl.readyState >= 2) startPlayback();
    } else if (img) {
      img.onload = () => {
        setup();
        render();
      };
    }

    function updateTexture() {
      if (!gl || !tex) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      const offW = sizeRef.current.width;
      const offH = sizeRef.current.height;
      const off = getOffscreen(offW, offH);
      const ctx = off.getContext('2d');
      if (!ctx) return;

      let sourceEl: CanvasImageSource;
      let iw = 0;
      let ih = 0;

      if (isVideo && videoEl) {
        sourceEl = videoEl;
        iw = videoEl.videoWidth;
        ih = videoEl.videoHeight;
        if (!iw || !ih) return;
      } else if (img) {
        sourceEl = img;
        iw = img.width;
        ih = img.height;
        if (!iw || !ih) return;
      } else {
        return;
      }

      const fitMode = fitRef.current;
      let sx = 0, sy = 0, sw = offW, sh = offH;

      if (fitMode === 'fill') {
        sx = 0; sy = 0; sw = offW; sh = offH;
      } else if (fitMode === 'contain') {
        const scale = Math.min(offW / iw, offH / ih);
        sw = iw * scale;
        sh = ih * scale;
        sx = (offW - sw) / 2;
        sy = (offH - sh) / 2;
      } else {
        const scale = Math.max(offW / iw, offH / ih);
        sw = iw * scale;
        sh = ih * scale;
        sx = (offW - sw) / 2;
        sy = (offH - sh) / 2;
      }

      ctx.clearRect(0, 0, offW, offH);
      ctx.drawImage(sourceEl, sx, sy, sw, sh);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off);
    }

    function render() {
      if (!gl || !loaded) return;

      const curW = sizeRef.current.width;
      const curH = sizeRef.current.height;

      if (curW !== appliedW || curH !== appliedH) {
        const d = dprRef.current || 1;
        if (canvasRef.current) {
          canvasRef.current.width = curW;
          canvasRef.current.height = curH;
          canvasRef.current.style.width = `${curW / d}px`;
          canvasRef.current.style.height = `${curH / d}px`;
        }
        appliedW = curW;
        appliedH = curH;
      }

      updateTexture();
      gl.viewport(0, 0, curW, curH);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const now = (Date.now() - startTime) / 1000;
      gl.uniform1f(uTime, now);

      let mx = mouseRef.current.active ? Math.max(0, Math.min(1, mouseRef.current.x)) : -10;
      let my = mouseRef.current.active ? Math.max(0, Math.min(1, mouseRef.current.y)) : -10;
      my = 1 - my; // Invert for WebGL UV coords
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uStrength, strength * 2.5);
      gl.uniform1f(uSpeed, speed);
      gl.uniform2f(uResolution, curW, curH);

      const nowMs = Date.now();
      const wakeArr = wakeRef.current.slice(-8);
      const hotspotArr = (hotspotsRef.current || []).slice(0, 8).map(h => ({ x: h.x, y: h.y, t: nowMs - 100000 }));
      const allWake = [...wakeArr, ...hotspotArr].slice(-16);
      const wakeData = new Float32Array(16 * 3);
      let count = 0;

      for (let i = 0; i < allWake.length; ++i) {
        const w = allWake[i];
        wakeData[i * 3 + 0] = w.x;
        wakeData[i * 3 + 1] = 1 - w.y;
        wakeData[i * 3 + 2] = (w.t - startTime) / 1000;
        count++;
      }

      gl.uniform1i(uWakeCount, count);
      gl.uniform3fv(uWake, wakeData);
      gl.uniform1f(uMaskRadius, maskRadiusRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationId = requestAnimationFrame(render);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (videoEl) {
        try {
          videoEl.pause();
        } catch (e) {}
        videoEl.removeAttribute('src');
        videoEl.load();
      }
      videoElRef.current = null;
      gl = null;
    };
  }, [isVideo, image, video, strength, speed, isMounted]);

  // Static/Hydration Fallback
  if (!isMounted) {
    const imgSrc = typeof image === 'string' ? image : image.src;
    const imgAlt = typeof image === 'string' ? 'Liquid Image' : (image.alt || 'Liquid Image');
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: `${borderRadius}px`,
          ...style
        }}
        className={className}
      >
        {isVideo ? (
          <video
            src={video}
            muted
            loop
            playsInline
            autoPlay
            style={{
              width: '100%',
              height: '100%',
              objectFit: fit,
              display: 'block',
              borderRadius: `${borderRadius}px`
            }}
          />
        ) : (
          <img
            src={imgSrc}
            alt={imgAlt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: fit,
              display: 'block',
              borderRadius: `${borderRadius}px`
            }}
          />
        )}
      </div>
    );
  }

  const imgAlt = typeof image === 'string' ? 'Liquid Image' : (image.alt || 'Liquid Image');

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: `${borderRadius}px`,
        ...style
      }}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchMove={handleMove}
      onTouchEnd={handleLeave}
    >
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: `${borderRadius}px`
        }}
        aria-label={isVideo ? 'Interactive Liquid Video' : `Interactive Liquid ${imgAlt}`}
      />
    </div>
  );
}
