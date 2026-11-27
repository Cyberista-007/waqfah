'use client';

type AudioGraphEntry = {
  ctx: AudioContext;
  analyser: AnalyserNode;
  dataArray: Uint8Array;
};

const mediaGraphCache = new WeakMap<HTMLAudioElement, AudioGraphEntry>();

/**
 * Safely attaches a Web Audio AnalyserNode once per CORS-enabled HTMLAudioElement.
 * Never attaches to non-CORS elements so playback isn't muted by browser policies.
 */
export function getOrCreateMediaAnalyser(
  audioEl: HTMLAudioElement | null | undefined
): AudioGraphEntry | null {
  if (typeof window === 'undefined' || !audioEl) return null;
  if (audioEl.crossOrigin !== 'anonymous') return null;

  const existing = mediaGraphCache.get(audioEl);
  if (existing) {
    if (existing.ctx.state === 'suspended') {
      existing.ctx.resume().catch(() => {});
    }
    return existing;
  }

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.78;

    const source = ctx.createMediaElementSource(audioEl);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const entry = { ctx, analyser, dataArray };
    mediaGraphCache.set(audioEl, entry);
    return entry;
  } catch {
    return null;
  }
}

/**
 * Resolves CSS colors including `hsl(var(--primary))` into canvas-safe color strings.
 */
export function resolveCanvasColor(
  el: HTMLElement | null,
  color?: string,
  fallback = '#10b981'
): string {
  if (!color) return fallback;
  if (!color.includes('var(') || !el) return color;
  try {
    const match = color.match(/var\((--[^),\s]+)/);
    if (!match) return fallback;
    const raw = getComputedStyle(el).getPropertyValue(match[1]).trim();
    if (!raw) return fallback;
    if (/^\d/.test(raw) && !raw.startsWith('#') && !raw.startsWith('hsl') && !raw.startsWith('rgb')) {
      return `hsl(${raw})`;
    }
    return raw;
  } catch {
    return fallback;
  }
}

export interface SpectrumSampleInput {
  barCount: number;
  analyser?: AnalyserNode | null;
  dataArray?: Uint8Array | null;
  isPlaying: boolean;
  isBuffering?: boolean;
  currentTime?: number;
  playbackRate?: number;
  volume?: number;
  phase: number;
  prevLevels: number[];
}

/**
 * Computes normalized [0..1] bar heights with smooth rise/decay and real FFT support
 * when available, falling back to rich 60fps speech-cadence synthesis scaled by speed & volume.
 */
export function computeSpectrumBands({
  barCount,
  analyser,
  dataArray,
  isPlaying,
  isBuffering = false,
  currentTime = 0,
  playbackRate = 1,
  volume = 1,
  phase,
  prevLevels,
}: SpectrumSampleInput): { levels: number[]; average: number; hasRealFft: boolean } {
  const effectiveVolume = Math.max(0, Math.min(1, volume));
  const active = isPlaying && !isBuffering && effectiveVolume > 0.01;

  let hasRealFft = false;
  if (active && analyser && dataArray) {
    try {
      analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);
      for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > 2) {
          hasRealFft = true;
          break;
        }
      }
    } catch {
      hasRealFft = false;
    }
  }

  const levels = new Array<number>(barCount);
  let sum = 0;

  // Continuous 60fps clock blended with playback position so motion never freezes between YouTube polls
  const rate = Math.max(0.5, playbackRate);
  const clock = phase + (currentTime > 0 ? (currentTime % 60) * 0.35 : 0);
  const volumeScale = 0.35 + 0.65 * effectiveVolume;
  const phrasePulse = 0.68 + 0.32 * Math.sin(clock * 0.55 * rate);

  for (let i = 0; i < barCount; i++) {
    let target = 0;

    if (active) {
      if (hasRealFft && dataArray && dataArray.length > 0) {
        const normIdx = i / Math.max(1, barCount - 1);
        const binIndex = Math.min(
          dataArray.length - 1,
          Math.floor(Math.pow(normIdx, 1.3) * (dataArray.length * 0.7))
        );
        target = Math.min(1, (dataArray[binIndex] / 255) * 1.2);
      } else {
        // Multi-wave speech/recitation profile matching the Radio visualizer's lush full-height motion
        const waveA = Math.abs(Math.sin(i * 0.22 + clock * 1.15 * rate));
        const waveB = Math.abs(Math.cos(i * 0.13 - clock * 0.72 * rate));
        const syllableBurst = 0.55 + 0.45 * Math.abs(Math.sin(clock * 2.2 * rate + i * 0.48));
        const rawLevel = (waveA * 0.58 + waveB * 0.42) * syllableBurst * phrasePulse * volumeScale;
        target = Math.min(0.96, Math.max(0.14, rawLevel * 1.18));
      }
    } else if (isBuffering) {
      target = 0.14 + 0.22 * Math.max(0, Math.sin(phase * 1.5 - i * 0.35));
    } else {
      target = 0;
    }

    const prev = prevLevels[i] ?? 0;
    const smoothed =
      target >= prev
        ? prev + (target - prev) * 0.48
        : Math.max(target, prev - 0.055);

    levels[i] = smoothed;
    prevLevels[i] = smoothed;
    sum += smoothed;
  }

  return {
    levels,
    average: barCount > 0 ? sum / barCount : 0,
    hasRealFft,
  };
}
