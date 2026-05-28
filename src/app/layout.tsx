import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from '@/components/ui/toaster';
import { PWARegistry } from '@/components/pwa-registry';
import { Analytics } from "@vercel/analytics/react";
import { AppProviders } from '@/components/app-providers';
import {
  sourceCodePro,
  cairo,
  tajawal,
  amiri,
  almarai,
  lalezar,
  notoSansArabic,
  ibmPlexSansArabic,
  changa,
  elMessiri,
  reemKufi,
  markaziText,
  scheherazadeNew,
  mada
} from './fonts';
import { SiteBackground } from '@/components/site-background';
import { getAppearanceSettings, getAnnouncement } from '@/lib/data';
import type { AppearanceSettings, AnnouncementSettings } from '@/lib/types';
import { AnnouncementBar } from '@/components/announcement-bar';
import { OfflineIndicator } from '@/components/offline-indicator';
import { GlobalBackButton } from '@/components/global-back-button';
import { ReadingProvider } from '@/components/reading-provider';
import { ChatWidget } from '@/components/chat-widget';

export const viewport: Viewport = {
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  title: {
    default: 'وقفة',
    template: '%s | وقفة',
  },
  description: 'منصة شاملة لمحاضرات ودروس نخبة من المشايخ والعلماء. تصفح، استمع، وتعلم العلوم الشرعية: عقيدة، فقه، تفسير، سيرة، وحديث.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.jpg',
    apple: '/icon.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'وقفة',
  },
  openGraph: {
    title: 'وقفة',
    description: 'منصة شاملة لمحاضرات ودروس نخبة من المشايخ والعلماء.',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'وقفة',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'وقفة',
    description: 'منصة شاملة لمحاضرات ودروس نخبة من المشايخ والعلماء.',
  },
};

import { PageTransition } from '@/components/page-transition';
import { HomePageIndexWrapper } from '@/components/home-page-index';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appearanceSettings = await getAppearanceSettings();
  const announcement = await getAnnouncement();
  
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          window.onerror = function(message, source, lineno, colno, error) {
            console.error("GLOBAL ERROR:", message, source, lineno, colno, error);
          };
          window.onunhandledrejection = function(event) {
            console.error("UNHANDLED REJECTION:", event.reason);
          };
        `}} />
      </head>
      <body className={cn(
        'min-h-screen bg-background font-body antialiased body-background',
        sourceCodePro.variable,
        cairo.variable,
        tajawal.variable,
        amiri.variable,
        almarai.variable,
        lalezar.variable,
        notoSansArabic.variable,
        ibmPlexSansArabic.variable,
        changa.variable,
        elMessiri.variable,
        reemKufi.variable,
        markaziText.variable,
        scheherazadeNew.variable,
        mada.variable
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
              <main className="flex-1 w-full overflow-hidden">
                <PageTransition>
                    {children}
                </PageTransition>
              </main>
              <div className="hide-in-reading-mode">
                <SiteFooter />
              </div>
            </div>
            <HomePageIndexWrapper />
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
