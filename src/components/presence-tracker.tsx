'use client';

import { useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export function PresenceTracker() {
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    // Retrieve or generate a unique session ID for the tab
    let sessionId = sessionStorage.getItem('waqfah_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('waqfah_session_id', sessionId);
    }

    const device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    const presenceDocRef = doc(firestore, 'presence', sessionId);

    const updatePresence = async () => {
      try {
        await setDoc(presenceDocRef, {
          lastActive: Date.now(),
          device: device,
        }, { merge: true });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    // Update presence immediately on mount
    updatePresence();

    // Heartbeat every 20 seconds
    const interval = setInterval(updatePresence, 20000);

    // Clean up presence on unmount (tab close)
    const cleanup = () => {
      try {
        deleteDoc(presenceDocRef);
      } catch (error) {
        console.error('Error deleting presence document:', error);
      }
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [firestore]);

  return null;
}
