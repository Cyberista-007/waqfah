
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from '@/components/ui/toaster';
import { FloatingAudioPlayer } from '@/components/floating-audio-player';
import { Analytics } from "@vercel/analytics/react";
import { AppProviders } from '@/components/app-providers';
import { sourceCodePro, cairo, tajawal, amiri } from './fonts';
import { SiteBackground } from '@/components/site-background';
import { getAppearanceSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: {
    default: 'منصة الدروس العلمية',
    template: '%s | منصة الدروس العلمية',
  },
  description: 'منصة شاملة لمحاضرات ودروس نخبة من المشايخ والعلماء. تصفح، استمع، وتعلم العلوم الشرعية: عقيدة، فقه، تفسير، سيرة، وحديث.',
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appearanceSettings = await getAppearanceSettings();
  
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
          defaultTheme={appearanceSettings?.defaultTheme}
          defaultFont={appearanceSettings?.defaultFont}
        >
            <SiteBackground />
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1 container py-8 pb-24 md:pb-8">
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
