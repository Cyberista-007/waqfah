
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from '@/components/ui/toaster';
import { FloatingAudioPlayer } from '@/components/floating-audio-player';
import { Analytics } from "@vercel/analytics/react";
import { AppProviders } from '@/components/app-providers';

export const metadata: Metadata = {
  title: 'منصة الدروس العلمية',
  description: 'منصة شاملة لمحاضرات ودروس نخبة من المشايخ.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;700&family=Lalezar&family=Markazi+Text:wght@400;700&family=Noto+Sans+Arabic:wght@400;700&family=Tajawal:wght@400;700&family=Almarai:wght@400;700&family=Changa:wght@400;700&family=El+Messiri:wght@400;700&family=Mada:wght@400;700&family=Reem+Kufi:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <AppProviders>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1 container py-8">
                {children}
              </main>
              <SiteFooter />
            </div>
            <FloatingAudioPlayer />
            <Toaster />
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
