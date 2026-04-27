import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from '@/components/ui/toaster';
import { PWARegistry } from '@/components/pwa-registry';
import { Analytics } from "@vercel/analytics/react";
import { AppProviders } from '@/components/app-providers';
import { sourceCodePro, cairo, tajawal, amiri } from './fonts';
import { SiteBackground } from '@/components/site-background';
import { getAppearanceSettings, getAnnouncement } from '@/lib/data';
import type { AppearanceSettings, AnnouncementSettings } from '@/lib/types';
import { AnnouncementBar } from '@/components/announcement-bar';
import { OfflineIndicator } from '@/components/offline-indicator';
import { GlobalBackButton } from '@/components/global-back-button';
import { FloatingTasbih } from '@/components/floating-tasbih';
import { ReadingProvider } from '@/components/reading-provider';
import { ChatWidget } from '@/components/chat-widget';

export const viewport: Viewport = {
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  title: {
    default: 'منصة الدروس العلمية',
    template: '%s | منصة الدروس العلمية',
  },
  description: 'منصة شاملة لمحاضرات ودروس نخبة من المشايخ والعلماء. تصفح، استمع، وتعلم العلوم الشرعية: عقيدة، فقه، تفسير، سيرة، وحديث.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'وقفة',
  },
  openGraph: {
    title: 'منصة الدروس العلمية',
    description: 'منصة شاملة لمحاضرات ودروس نخبة من المشايخ والعلماء.',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'منصة الدروس العلمية',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'منصة الدروس العلمية',
    description: 'منصة شاملة لمحاضرات ودروس نخبة من المشايخ والعلماء.',
  },
};

import { PageTransition } from '@/components/page-transition';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appearanceSettings = await getAppearanceSettings();
  const announcement = await getAnnouncement();
  
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-background font-body antialiased body-background',
        sourceCodePro.variable,
        cairo.variable,
        tajawal.variable,
        amiri.variable
      )}>
        <AppProviders 
          appearanceSettings={appearanceSettings}
        >
          <ReadingProvider>
            {announcement?.isActive && announcement.text && (
              <div className="hide-in-reading-mode">
                <AnnouncementBar text={announcement.text} link={announcement.link} />
              </div>
            )}
            <SiteBackground />
            <div className="relative flex min-h-screen flex-col">
              <div className="hide-in-reading-mode">
                <SiteHeader />
              </div>
              <div className="hide-in-reading-mode">
                <GlobalBackButton />
              </div>
              <main className="flex-1 w-full max-w-7xl mx-auto py-8 pb-24 md:pb-8 px-4 sm:px-8 overflow-hidden">
                <PageTransition>
                    {children}
                </PageTransition>
              </main>
              <div className="hide-in-reading-mode">
                <SiteFooter />
              </div>
            </div>
            <Toaster />
            <ChatWidget />
            <OfflineIndicator />
            <PWARegistry />
          </ReadingProvider>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
