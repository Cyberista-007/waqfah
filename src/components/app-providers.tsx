
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AudioPlayerProvider } from '@/components/audio-player-provider';
import { AppearanceProvider } from '@/components/appearance-provider';
import dynamic from 'next/dynamic';
import { MaintenanceHandler } from '@/components/maintenance-handler';
import type { AppearanceSettings } from '@/lib/types';
import { HomePageSkeleton } from './skeletons';

const DynamicFirebaseProvider = dynamic(
  () => import('@/firebase').then((mod) => mod.FirebaseProvider),
  {
    loading: () => <HomePageSkeleton />,
    ssr: false,
  }
);

const FloatingVideoPlayer = dynamic(
  () => import('./floating-video-player'),
  { ssr: false }
);

const FloatingAudioPlayer = dynamic(
  () => import('@/components/floating-audio-player').then(mod => mod.FloatingAudioPlayer),
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
    
    return (
        <ThemeProvider 
          attribute="class" 
          defaultTheme={defaultTheme || "theme-default-dark"}
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
            'theme-sunset-flare',
            'theme-light-academia',
            'theme-parchment',
            'theme-classic-dark',
            'theme-night-neon',
            'theme-red-volcano',
            'theme-hekla-volcano',
            'theme-deep-space',
            'theme-oled',
            'theme-studio-simpatico',
            'theme-digital-horizon',
            'theme-high-contrast'
          ]}
        >
          <AppearanceProvider 
            defaultFont={defaultFont}
            quranIconUrl={quranIconUrl}
            hadithIconUrl={hadithIconUrl}
            heroImageUrl={heroImageUrl}
            heroTitle={heroTitle}
            heroSubtitle={heroSubtitle}
          >
            <DynamicFirebaseProvider>
                <MaintenanceHandler maintenanceMode={maintenanceMode}>
                    <AudioPlayerProvider>
                        {children}
                        <FloatingAudioPlayer />
                        <FloatingVideoPlayer />
                    </AudioPlayerProvider>
              </MaintenanceHandler>
            </DynamicFirebaseProvider>
          </AppearanceProvider>
        </ThemeProvider>
    )
}

    