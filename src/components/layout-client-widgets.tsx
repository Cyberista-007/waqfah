'use client';

import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/chat-widget').then(mod => mod.ChatWidget), { ssr: false });
const OfflineIndicator = dynamic(() => import('@/components/offline-indicator').then(mod => mod.OfflineIndicator), { ssr: false });
const HomePageIndexWrapper = dynamic(() => import('@/components/home-page-index').then(mod => mod.HomePageIndexWrapper), { ssr: false });
const ClientAutoSync = dynamic(() => import('@/components/client-auto-sync').then(mod => mod.ClientAutoSync), { ssr: false });

export function LayoutClientWidgets() {
  return (
    <>
      <HomePageIndexWrapper />
      <ChatWidget />
      <OfflineIndicator />
      <ClientAutoSync />
    </>
  );
}
