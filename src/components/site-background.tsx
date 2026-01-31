
'use client';

import { useAppearance } from './appearance-provider';
import { ParticlesBackground } from './particles-background';

export function SiteBackground() {
  const { backgroundEffect } = useAppearance();

  if (backgroundEffect === 'particles') {
    return (
      <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none bg-background">
        <ParticlesBackground />
      </div>
    );
  }

  return null;
}
