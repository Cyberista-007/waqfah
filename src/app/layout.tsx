
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from '@/components/ui/toaster';
import { AudioPlayerProvider } from '@/components/audio-player-provider';
import { FloatingAudioPlayer } from '@/components/floating-audio-player';
import { FirebaseProvider } from '@/firebase';
import { Analytics } from "@vercel/analytics/react"

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
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="theme-default-dark" 
          enableSystem={false}
          themes={[
            'theme-default-light', 
            'theme-default-dark', 
            'theme-emerald-mosque', 
            'theme-desert-night', 
            'theme-royal-blue', 
            'theme-crimson-gold', 
            'theme-olive-sage',
            'theme-mecca-nights',
            'theme-medina-green',
            'theme-andalusian-sunset',
            'theme-light-academia',
            'theme-parchment',
            'theme-classic-dark',
            'theme-night-neon',
            'theme-red-volcano',
            'theme-hekla-volcano',
            'theme-deep-space',
            'theme-oled'
          ]}
        >
          <FirebaseProvider>
            <AudioPlayerProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1 container py-8">
                  {children}
                </main>
                <SiteFooter />
              </div>
              <FloatingAudioPlayer />
              <Toaster />
            </AudioPlayerProvider>
          </FirebaseProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
