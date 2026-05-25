import type { Lecture } from './types';

const OFFLINE_LECTURES_KEY = 'waqfah_offline_lectures';
const AUDIO_CACHE_NAME = 'waqfah-audio-v1';

export interface OfflineProgressCallback {
  (progress: number): void;
}

/**
 * Downloads a lecture's audio track and stores it in the Cache Storage for offline use.
 * Tracks progress through a custom reader.
 */
export async function downloadAudioForOffline(
  lecture: Lecture,
  onProgress?: OfflineProgressCallback
): Promise<void> {
  if (!lecture.audioSrc) {
    throw new Error('لا يوجد رابط صوتي لهذه المحاضرة');
  }

  const cache = await caches.open(AUDIO_CACHE_NAME);
  
  // Check if already cached
  const existing = await cache.match(lecture.audioSrc);
  if (existing) {
    onProgress?.(100);
    return;
  }

  const response = await fetch(lecture.audioSrc);
  if (!response.ok) {
    throw new Error('فشل تحميل الملف الصوتي من الخادم');
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  
  if (total === 0 || !response.body) {
    // Fallback if no content-length or body stream support
    await cache.put(lecture.audioSrc, response);
    onProgress?.(100);
  } else {
    // Read stream to monitor progress
    const reader = response.body.getReader();
    let loaded = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.length;
        const progress = Math.round((loaded / total) * 100);
        onProgress?.(progress);
      }
    }

    // Combine chunks
    const allChunks = new Uint8Array(loaded);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    // Create a new response with the full combined data
    const blob = new Blob([allChunks], { type: 'audio/mpeg' });
    const cachedResponse = new Response(blob, {
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'Content-Type': 'audio/mpeg',
        'Content-Length': loaded.toString(),
      })
    });

    await cache.put(lecture.audioSrc, cachedResponse);
  }

  // Save metadata to localStorage
  const offlineList = getOfflineLectures();
  if (!offlineList.some(l => l.id === lecture.id)) {
    offlineList.push(lecture);
    localStorage.setItem(OFFLINE_LECTURES_KEY, JSON.stringify(offlineList));
  }
}

/**
 * Returns all cached offline lectures from localStorage.
 */
export function getOfflineLectures(): Lecture[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(OFFLINE_LECTURES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Deletes a lecture's audio track from Cache Storage and removes it from localStorage.
 */
export async function deleteAudioFromOffline(lectureId: string, audioSrc?: string): Promise<void> {
  if (audioSrc) {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    await cache.delete(audioSrc);
  }

  const offlineList = getOfflineLectures();
  const updated = offlineList.filter(l => l.id !== lectureId);
  localStorage.setItem(OFFLINE_LECTURES_KEY, JSON.stringify(updated));
}

/**
 * Checks if a lecture's audio is currently cached offline.
 */
export async function checkIsAudioOffline(audioSrc?: string): Promise<boolean> {
  if (!audioSrc) return false;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(audioSrc);
    return !!response;
  } catch (e) {
    return false;
  }
}
