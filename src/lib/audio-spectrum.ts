'use client';

import type { TranscriptItem } from '@/lib/types';

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
    analyser.smoothingTimeConstant = 0.72;

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

/**
 * Fast deterministic pseudo-random generator for organic non-repeating speech energy.
 */
function fractHash(seed: number): number {
  const s = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Smoothly interpolated pseudo-random value noise over continuous time `t`.
 */
function smoothNoise(t: number, channelSeed: number): number {
  const i0 = Math.floor(t);
  const f = t - i0;
  const u = f * f * (3 - 2 * f);
  const a = fractHash(i0 + channelSeed * 19.37);
  const b = fractHash(i0 + 1 + channelSeed * 19.37);
  return a + (b - a) * u;
}

/**
 * Evaluates speech activity factor [0.12..1.15] from transcript cues when available.
 */
function getTranscriptActivity(transcript: TranscriptItem[] | undefined, currentTime: number): number | null {
  if (!transcript || transcript.length === 0 || currentTime <= 0) return null;

  let activeIdx = -1;
  for (let i = 0; i < transcript.length; i++) {
    if (transcript[i].timestamp <= currentTime) {
      activeIdx = i;
    } else {
      break;
    }
  }
  if (activeIdx < 0) return 0.2;

  const cur = transcript[activeIdx];
  const next = transcript[activeIdx + 1];
  const elapsed = currentTime - cur.timestamp;
  const cueSpan = next ? Math.max(1.5, next.timestamp - cur.timestamp) : 6;
  const wordCount = cur.text ? cur.text.trim().split(/\s+/).length : 0;

  // Quiet gap at the tail of a long cue before next spoken segment
  if (wordCount === 0 || (next && next.timestamp - currentTime > 0 && elapsed > cueSpan * 0.85)) {
    return 0.16;
  }
  const density = Math.min(1.15, 0.72 + wordCount * 0.035);
  return density;
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
  transcript?: TranscriptItem[];
}

/**
 * Computes normalized [0..1] bar heights:
 * - Uses real Web Audio FFT when CORS-enabled direct audio is active.
 * - Otherwise synthesizes independent per-band vocal bursts + natural breath pauses
 *   (and respects transcript cadence if provided) with zero conveyor-belt sine waves.
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
  transcript,
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

  const rate = Math.max(0.5, playbackRate);
  // Continuous advancing clock anchored to currentTime ticks when present
  const t = (phase * 0.95 + (currentTime > 0 ? currentTime * 0.65 : 0)) * rate;
  const volumeScale = 0.35 + 0.65 * effectiveVolume;

  // Natural speech gating: creates genuine micro-pauses (~breath gaps) between spoken phrases
  const phraseNoise = smoothNoise(t * 0.55, 7);
  const microPauseGate = phraseNoise < 0.24 ? 0.16 : 0.62 + (phraseNoise - 0.24) * 0.58;
  const syllableTransient = 0.45 + 0.65 * Math.pow(smoothNoise(t * 3.8, 13), 1.4);
  const transcriptFactor = active ? getTranscriptActivity(transcript, currentTime) : null;
  const speechDrive = microPauseGate * syllableTransient * (transcriptFactor ?? 1) * volumeScale;

  for (let i = 0; i < barCount; i++) {
    let target = 0;

    if (active) {
      if (hasRealFft && dataArray && dataArray.length > 0) {
        const normIdx = i / Math.max(1, barCount - 1);
        const binIndex = Math.min(
          dataArray.length - 1,
          Math.floor(Math.pow(normIdx, 1.3) * (dataArray.length * 0.72))
        );
        target = Math.min(1, (dataArray[binIndex] / 255) * 1.2);
      } else {
        // Scramble bar order with prime hashing so neighboring bars never form a sliding sine loop
        const normPos = i / Math.max(1, barCount - 1);
        const bandSeed = ((i * 17 + 5) % 41) + 1;
        const bassWeight = Math.exp(-Math.pow((normPos - 0.28) / 0.36, 2));
        const sibilantWeight = normPos > 0.55 ? smoothNoise(t * 6.4, bandSeed + 90) * 0.65 : 0;

        const fastJitter = smoothNoise(t * (3.1 + (bandSeed % 5) * 0.75), bandSeed);
        const midFlutter = smoothNoise(t * 1.45, bandSeed * 3.1);

        const spectralShape = 0.28 + 0.72 * bassWeight;
        const burst = (fastJitter * 0.7 + midFlutter * 0.3) * spectralShape + sibilantWeight * 0.4;

        target = Math.min(0.96, Math.max(0.06, burst * speechDrive * 1.22));
      }
    } else if (isBuffering) {
      target = 0.12 + 0.2 * smoothNoise(phase * 1.6 - i * 0.35, i + 1);
    } else {
      target = 0;
    }

    const prev = prevLevels[i] ?? 0;
    // Snappy attack (real speech transient feel), quick natural decay
    const smoothed =
      target >= prev
        ? prev + (target - prev) * 0.65
        : Math.max(target, prev - 0.085);

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
