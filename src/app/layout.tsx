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
import { getAppearanceSettings, getAnnouncement } from '@/lib/data';
import type { AppearanceSettings, AnnouncementSettings } from '@/lib/types';
import { AnnouncementBar } from '@/components/announcement-bar';
import { ReadingProvider } from '@/components/reading-provider';
import { LayoutClientWidgets } from '@/components/layout-client-widgets';



export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6f2' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0f12' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'وقفة | المنصة العلمية',
    template: '%s | وقفة',
  },
  description: 'منصة شاملة لمحاضرات ودروس نخبة من المشايخ والعلماء. تصفح، استمع، وتعلم العلوم الشرعية: عقيدة، فقه، تفسير، سيرة، وحديث، مع مصحف متكامل ومواقيت الصلاة.',
  keywords: [
    'وقفة',
    'منصة وقفة',
    'محاضرات إسلامية',
    'دروس شرعية',
    'القرآن الكريم',
    'الحديث الشريف',
    'صحيح البخاري',
    'مسند أحمد',
    'الفقه والأصول',
    'العقيدة والتوحيد',
    'السيرة النبوية',
    'مواقيت الصلاة',
    'أذكار المسلم',
    'بودكاست إسلامي'
  ],
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
    title: 'وقفة | المنصة العلمية الإسلامية',
    description: 'منصة شاملة للمحاضرات والدروس الشرعية والقرآن ومواقيت الصلاة.',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'وقفة',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'وقفة | المنصة العلمية الإسلامية',
    description: 'منصة شاملة للمحاضرات والدروس الشرعية والقرآن ومواقيت الصلاة.',
  },
};

import { PageTransition } from '@/components/page-transition';

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://waqfah.app/#website',
      'url': 'https://waqfah.app',
      'name': 'وقفة - المنصة العلمية',
      'description': 'منصة إسلامية علمية شاملة للمحاضرات والدروس والقرآن والحديث ومواقيت الصلاة',
      'inLanguage': 'ar',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://waqfah.app/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://waqfah.app/#organization',
      'name': 'منصة وقفة العلمية',
      'url': 'https://waqfah.app',
      'logo': 'https://waqfah.app/icon.jpg',
      'description': 'منصة تعليمية إسلامية موثوقة لتعليم العلوم الشرعية والقرآن الكريم والحديث النبوي الشريف'
    }
  ]
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <script dangerouslySetInnerHTML={{ __html: `
          window.onerror = function(message, source, lineno, colno, error) {
            console.error("GLOBAL ERROR:", message, source, lineno, colno, error);
          };
          window.onunhandledrejection = function(event) {
            console.error("UNHANDLED REJECTION:", event.reason);
          };
        `}} />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          'min-h-screen bg-background antialiased body-background',
          appearanceSettings?.defaultFont || 'font-body',
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
        )}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var f=localStorage.getItem("site-font");if(f&&f!=="font-body"){document.body.classList.remove("font-body");document.body.classList.add(f);}}catch(e){}`,
          }}
        />
        <AppProviders 
          appearanceSettings={appearanceSettings}
        >
          <ReadingProvider>
            {announcement?.isActive && announcement.text && (
              <div className="hide-in-reading-mode">
                <AnnouncementBar text={announcement.text} link={announcement.link} />
              </div>
            )}
            <div className="relative flex min-h-screen flex-col">
              <div className="hide-in-reading-mode">
                <SiteHeader />
              </div>
              <main className="flex-1 w-full overflow-hidden">
                <PageTransition>
                    {children}
                </PageTransition>
              </main>
              <div className="hide-in-reading-mode pb-24 md:pb-0">
                <SiteFooter />
              </div>
            </div>
            <Toaster />
            <LayoutClientWidgets />
            <PWARegistry />
          </ReadingProvider>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
