'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/chat-widget').then(mod => mod.ChatWidget), { ssr: false });
const OfflineIndicator = dynamic(() => import('@/components/offline-indicator').then(mod => mod.OfflineIndicator), { ssr: false });
const HomePageIndexWrapper = dynamic(() => import('@/components/home-page-index').then(mod => mod.HomePageIndexWrapper), { ssr: false });
const FloatingRadioPlayer = dynamic(() => import('@/components/floating-radio-player').then(mod => mod.FloatingRadioPlayer), { ssr: false });
const BackToTop = dynamic(() => import('@/components/back-to-top').then(mod => mod.BackToTop), { ssr: false });
const PresenceTracker = dynamic(() => import('@/components/presence-tracker').then(mod => mod.PresenceTracker), { ssr: false });
const ScrollProgressBar = dynamic(() => import('@/components/scroll-progress').then(mod => mod.ScrollProgressBar), { ssr: false });

export function LayoutClientWidgets() {
  const [idleReady, setIdleReady] = useState(false);

  useEffect(() => {
    // Defer auxiliary floating chrome until after initial paint & hydration
    let handle: number | ReturnType<typeof setTimeout>;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      handle = (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
        () => setIdleReady(true),
        { timeout: 1200 }
      );
      return () => (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle as number);
    }
    handle = setTimeout(() => setIdleReady(true), 600);
    return () => clearTimeout(handle);
  }, []);

  return (
    <>
      <OfflineIndicator />
      <FloatingRadioPlayer />
      {idleReady && (
        <>
          <ScrollProgressBar />
          <PresenceTracker />
          <HomePageIndexWrapper />
          <ChatWidget />
          <BackToTop />
        </>
      )}
    </>
  );
}
