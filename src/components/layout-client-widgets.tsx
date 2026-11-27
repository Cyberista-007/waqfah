'use client';

import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/chat-widget').then(mod => mod.ChatWidget), { ssr: false });
const OfflineIndicator = dynamic(() => import('@/components/offline-indicator').then(mod => mod.OfflineIndicator), { ssr: false });
const HomePageIndexWrapper = dynamic(() => import('@/components/home-page-index').then(mod => mod.HomePageIndexWrapper), { ssr: false });
const FloatingRadioPlayer = dynamic(() => import('@/components/floating-radio-player').then(mod => mod.FloatingRadioPlayer), { ssr: false });
const BackToTop = dynamic(() => import('@/components/back-to-top').then(mod => mod.BackToTop), { ssr: false });
const PresenceTracker = dynamic(() => import('@/components/presence-tracker').then(mod => mod.PresenceTracker), { ssr: false });
const ScrollProgressBar = dynamic(() => import('@/components/scroll-progress').then(mod => mod.ScrollProgressBar), { ssr: false });

export function LayoutClientWidgets() {
  return (
    <>
      <ScrollProgressBar />
      <PresenceTracker />
      <HomePageIndexWrapper />
      <ChatWidget />
      <OfflineIndicator />
      <FloatingRadioPlayer />
      <BackToTop />
    </>
  );
}
