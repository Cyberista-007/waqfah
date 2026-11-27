'use client';

import { useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export function PresenceTracker() {
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    let sessionId = sessionStorage.getItem('waqfah_session_id');
    if (!sessionId) {
      sessionId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('waqfah_session_id', sessionId);
    }

    const device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    const presenceDocRef = doc(firestore, 'presence', sessionId);

    const updatePresence = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        await setDoc(
          presenceDocRef,
          {
            lastActive: Date.now(),
            device,
          },
          { merge: true }
        );
      } catch {
        // Ignore transient network failures
      }
    };

    // Defer first write slightly so it never competes with initial page render/data
    const initTimer = setTimeout(updatePresence, 3000);
    const interval = setInterval(updatePresence, 60000);

    const cleanup = () => {
      try {
        deleteDoc(presenceDocRef).catch(() => {});
      } catch {
        // Ignore cleanup failures on unload
      }
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [firestore]);

  return null;
}
