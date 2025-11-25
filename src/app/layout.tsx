
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from '@/components/ui/toaster';
import { FloatingAudioPlayer } from '@/components/floating-audio-player';
import { Analytics } from "@vercel/analytics/react";
import { AppProviders } from '@/components/app-providers';
import { alegreya, sourceCodePro, cairo, notoSansArabic, lalezar, tajawal, amiri, markaziText, ibmPlexSansArabic, almarai, changa, elMessiri, reemKufi, mada, scheherazadeNew, rubikOrigami } from './fonts';

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
      <body className={cn(
        'min-h-screen bg-background font-body antialiased',
        alegreya.variable,
        sourceCodePro.variable,
        cairo.variable,
        notoSansArabic.variable,
        lalezar.variable,
        tajawal.variable,
        amiri.variable,
        markaziText.variable,
        ibmPlexSansArabic.variable,
        almarai.variable,
        changa.variable,
        elMessiri.variable,
        reemKufi.variable,
        mada.variable,
        scheherazadeNew.variable,
        rubikOrigami.variable
      )}>
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
