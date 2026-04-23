
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AudioPlayerProvider } from '@/components/audio-player-provider';
import { AppearanceProvider } from '@/components/appearance-provider';
import dynamic from 'next/dynamic';
import { MaintenanceHandler } from '@/components/maintenance-handler';
import type { AppearanceSettings } from '@/lib/types';
import { FirebaseClientProvider } from '@/firebase';
import { themes } from './theme-switcher';
import { SearchProvider } from './search-provider';
import { MoodProvider } from './mood-provider';
import { ScrollProgressBar } from './scroll-progress';

const FloatingVideoPlayer = dynamic(
  () => import('./floating-video-player'),
  { ssr: false }
);

const FloatingAudioPlayer = dynamic(
  () => import('@/components/floating-audio-player').then(mod => mod.FloatingAudioPlayer),
  { ssr: false }
);

const CinematicCursor = dynamic(
  () => import('./cinematic-cursor').then(mod => mod.CinematicCursor),
  { ssr: false }
);

const AuroraBackground = dynamic(
  () => import('./aurora-background').then(mod => mod.AuroraBackground),
  { ssr: false }
);

const ParticlesBackground = dynamic(
  () => import('./particles-background').then(mod => mod.ParticlesBackground),
  { ssr: false }
);


export function AppProviders({
  children,
  appearanceSettings,
}: {
  children: React.ReactNode;
  appearanceSettings: AppearanceSettings | null;
}) {
    const maintenanceMode = appearanceSettings?.maintenanceMode || false;
    const defaultTheme = appearanceSettings?.defaultTheme;
    const defaultFont = appearanceSettings?.defaultFont;
    const quranIconUrl = appearanceSettings?.quranIconUrl;
    const hadithIconUrl = appearanceSettings?.hadithIconUrl;
    const heroImageUrl = appearanceSettings?.heroImageUrl;
    const heroTitle = appearanceSettings?.heroTitle;
    const heroSubtitle = appearanceSettings?.heroSubtitle;
    const heroBanners = appearanceSettings?.heroBanners;
    
    return (
        <ThemeProvider 
          attribute="class" 
          defaultTheme={defaultTheme || "theme-default-dark"}
          enableSystem={false}
          themes={themes.map(t => t.value)}
        >
          <AppearanceProvider 
            defaultFont={defaultFont}
            quranIconUrl={quranIconUrl}
            hadithIconUrl={hadithIconUrl}
            heroImageUrl={heroImageUrl}
            heroTitle={heroTitle}
            heroSubtitle={heroSubtitle}
            heroBanners={heroBanners}
          >
            <FirebaseClientProvider>
                <MaintenanceHandler maintenanceMode={maintenanceMode}>
                    <AudioPlayerProvider>
                        <SearchProvider>
                            <MoodProvider>
                                {/* ══ Cinematic Global Layer ══ */}
                                <ScrollProgressBar />
                                <CinematicCursor />
                                {/* ══ Content ══ */}
                                {children}
                                <FloatingAudioPlayer />
                                <FloatingVideoPlayer />
                            </MoodProvider>
                        </SearchProvider>
                    </AudioPlayerProvider>
              </MaintenanceHandler>
            </FirebaseClientProvider>
          </AppearanceProvider>
        </ThemeProvider>
    )
}
