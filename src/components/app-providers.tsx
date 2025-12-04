
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AudioPlayerProvider } from '@/components/audio-player-provider';
import { FirebaseClientProvider } from '@/firebase';
import { FontProvider } from '@/components/font-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
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
            'theme-oled',
            'theme-studio-simpatico',
            'theme-digital-horizon',
            'theme-sunset-flare'
          ]}
        >
          <FontProvider>
            <FirebaseClientProvider>
              <AudioPlayerProvider>
                <FirebaseErrorListener />
                {children}
              </AudioPlayerProvider>
            </FirebaseClientProvider>
          </FontProvider>
        </ThemeProvider>
    )
}

    