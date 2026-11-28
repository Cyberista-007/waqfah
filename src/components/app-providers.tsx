
'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ThemeProvider } from '@/components/theme-provider';
import { AudioPlayerProvider } from '@/components/audio-player-provider';
import { RadioProvider } from '@/components/radio-provider';
import { AppearanceProvider } from '@/components/appearance-provider';
import dynamic from 'next/dynamic';
import { MaintenanceHandler } from '@/components/maintenance-handler';
import type { AppearanceSettings } from '@/lib/types';
import { FirebaseClientProvider } from '@/firebase';
import { DEFAULT_DARK_THEME, isLightTheme, themes } from './theme-switcher';
import { SearchProvider } from './search-provider';
import { MoodProvider } from './mood-provider';

function ThemeModeClassSync() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const active = !theme || theme === 'system' ? resolvedTheme : theme;
    const isLight = isLightTheme(active);
    document.documentElement.classList.toggle('dark', !isLight);
  }, [theme, resolvedTheme]);

  return null;
}

const FloatingVideoPlayer = dynamic(
  () => import('./floating-video-player'),
  { ssr: false }
);

const FloatingAudioPlayer = dynamic(
  () => import('@/components/floating-audio-player').then(mod => mod.FloatingAudioPlayer),
  { ssr: false }
);




const AuroraBackground = dynamic(
  () => import('./aurora-background').then(mod => mod.AuroraBackground),
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
          defaultTheme={defaultTheme || DEFAULT_DARK_THEME}
          enableSystem={true}
          themes={themes.map(t => t.value)}
          value={{
            light: 'theme-default-light',
            dark: 'theme-default-dark',
            ...Object.fromEntries(themes.map((t) => [t.value, t.value])),
          }}
        >
          <ThemeModeClassSync />
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
                    <RadioProvider>
                    <AudioPlayerProvider>
                        <SearchProvider>
                            <MoodProvider>
                                {/* ══ Content ══ */}
                                {children}
                                <FloatingAudioPlayer />
                                <FloatingVideoPlayer />
                            </MoodProvider>
                        </SearchProvider>
                    </AudioPlayerProvider>
                    </RadioProvider>
              </MaintenanceHandler>
            </FirebaseClientProvider>
          </AppearanceProvider>
        </ThemeProvider>
    )
}
