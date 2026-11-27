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
 * when available, falling back to speech-cadence synthesis driven by time, speed, and volume.
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

  // Timeline clock for speech-like modulation synced with playback position & speed
  const timeline = (currentTime > 0 ? currentTime : phase * 0.45) * Math.max(0.5, playbackRate);
  // Syllabic envelope: mimics natural speech bursts (~3-5 syllables/sec + breath pauses)
  const syllableWave =
    0.55 +
    0.25 * Math.sin(timeline * 9.5) +
    0.2 * Math.cos(timeline * 14.3);
  const phraseEnvelope = Math.max(
    0.22,
    0.68 + 0.32 * Math.sin(timeline * 1.35 + Math.cos(timeline * 0.55))
  );
  const volumeScale = 0.25 + 0.75 * effectiveVolume;

  for (let i = 0; i < barCount; i++) {
    let target = 0;

    if (active) {
      if (hasRealFft && dataArray && dataArray.length > 0) {
        // Map index non-linearly so voice fundamentals (lower bins) aren't crammed at one edge
        const normIdx = i / Math.max(1, barCount - 1);
        const binIndex = Math.min(
          dataArray.length - 1,
          Math.floor(Math.pow(normIdx, 1.35) * (dataArray.length * 0.72))
        );
        const raw = dataArray[binIndex] / 255;
        target = Math.min(1, raw * 1.15);
      } else {
        // Multi-band harmonic energy profile synced to timeline & playbackRate
        const normPos = i / Math.max(1, barCount - 1);
        const vocalCenter = Math.exp(-Math.pow((normPos - 0.36) / 0.34, 2));
        const harmonic =
          Math.abs(Math.sin(i * 0.72 + timeline * 5.8 * (1 + (i % 3) * 0.15))) * 0.6 +
          Math.abs(Math.cos(i * 1.35 - phase * (0.9 + playbackRate * 0.35))) * 0.4;
        target = Math.min(
          1,
          (0.16 + 0.84 * vocalCenter) * harmonic * syllableWave * phraseEnvelope * volumeScale
        );
      }
    } else if (isBuffering) {
      // Gentle scanning ripple while buffering
      target = 0.12 + 0.18 * Math.max(0, Math.sin(phase * 1.4 - i * 0.35));
    } else {
      target = 0;
    }

    const prev = prevLevels[i] ?? 0;
    // Fast attack, smooth gravity decay
    const smoothed =
      target >= prev
        ? prev + (target - prev) * 0.52
        : Math.max(target, prev - 0.065);

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
