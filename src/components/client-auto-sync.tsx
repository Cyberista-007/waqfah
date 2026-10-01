'use client';

import { useEffect, useRef } from 'react';

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const LAST_SYNC_KEY = 'waqfah_last_youtube_sync_timestamp';

export function ClientAutoSync() {
    const isSyncingRef = useRef(false);

    useEffect(() => {
        const checkAndTriggerSync = async () => {
            if (isSyncingRef.current) return;

            try {
                const lastSyncStr = typeof window !== 'undefined' ? localStorage.getItem(LAST_SYNC_KEY) : null;
                const now = Date.now();

                // If never synced or more than 24 hours have passed
                if (!lastSyncStr || (now - parseInt(lastSyncStr, 10)) > SYNC_INTERVAL_MS) {
                    isSyncingRef.current = true;
                    console.log('[AutoSync] 24 hours elapsed. Triggering automatic YouTube sync...');
                    
                    const res = await fetch('/api/cron/youtube-sync', {
                        method: 'GET',
                        cache: 'no-store'
                    });

                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem(LAST_SYNC_KEY, now.toString());
                        console.log('[AutoSync] YouTube sync completed successfully:', data);
                    } else {
                        console.warn('[AutoSync] YouTube sync returned status:', res.status);
                    }
                }
            } catch (err) {
                console.error('[AutoSync] Error during automatic YouTube sync:', err);
            } finally {
                isSyncingRef.current = false;
            }
        };

        // Delay initial check by 5 seconds so it doesn't compete with initial page load
        const timer = setTimeout(() => {
            checkAndTriggerSync();
        }, 5000);

        // Also check periodically every hour while app is kept open
        const interval = setInterval(checkAndTriggerSync, 60 * 60 * 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    return null;
}
