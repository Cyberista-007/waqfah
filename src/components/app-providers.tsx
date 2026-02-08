
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AudioPlayerProvider } from '@/components/audio-player-provider';
import { FirebaseClientProvider } from '@/firebase';
import { AppearanceProvider } from '@/components/appearance-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import dynamic from 'next/dynamic';
import { MaintenanceHandler } from '@/components/maintenance-handler';
import type { AppearanceSettings } from '@/lib/types';


const FloatingVideoPlayer = dynamic(
  () => import('./floating-video-player').then(mod => mod.FloatingVideoPlayer),
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
          <AppearanceProvider defaultFont={defaultFont}>
            <FirebaseClientProvider>
                <MaintenanceHandler maintenanceMode={maintenanceMode}>
                    <AudioPlayerProvider>
                        <FirebaseErrorListener />
                        {children}
                        <FloatingVideoPlayer />
                    </AudioPlayerProvider>
              </MaintenanceHandler>
            </FirebaseClientProvider>
          </AppearanceProvider>
        </ThemeProvider>
    )
}
