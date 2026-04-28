'use client';

import React from 'react';
import { FilmGrain } from '@/components/palestine/shared';
import { 
  CinematicAudioPlayer, 
  GlassyBackground, 
  CinematicCursor, 
  PalestineMapOverlay,
  ScrollProgressIndicator,
  BackgroundSoulWords,
  InteractiveBackgroundGlow
} from '@/components/palestine/layout-elements';
import { 
  HeroSection, 
  QuoteSection, 
  AlAqsaDetail, 
  EternalSpiritSection, 
  FlagMeaningSection, 
  SacredConnectionBento 
} from '@/components/palestine/identity';
import { 
  TatreezPatternsGrid, 
  FoodCultureSection, 
  SymbolsSection, 
  MuseumOfHeritageSection, 
  ArchHistorySection 
} from '@/components/palestine/heritage';
import { 
  LestWeForgetMemorial, 
  CitiesExplorerSection, 
  DiasporaUnitySection, 
  PersonalitiesSection 
} from '@/components/palestine/people';
import { 
  ResistanceChroniclesSection, 
  ResistanceStatsSection, 
  FactsCounterSection, 
  TimelineSection 
} from '@/components/palestine/history';
import { 
  GlobalAwarenessGrid, 
  GlobalVoicesSection, 
  GlobalMediaWatchSection, 
  DigitalLibrarySection, 
  MediaGallery,
  GazaResilienceSection,
  DigitalAdvocacyKit
} from '@/components/palestine/awareness';
import { 
  KnowledgeQuiz, 
  ImmersivePoetryWall, 
  PoetrySection, 
  TreePlantingSimulation, 
  PrayerCounter 
} from '@/components/palestine/interactive';
import { 
  FutureHopeSection, 
  PledgeCounterSection, 
  GlobalSolidarityCallSection, 
  SolidarityActionGrid, 
  SolidarityLivingWall,
  CommitmentSection 
} from '@/components/palestine/action';
import { 
  GlobalSolidarityCard, 
  FooterHeritage 
} from '@/components/palestine/footer';
import { SectionGrid } from '@/components/palestine/navigation';

/**
 * Palestine Portal: A cinematic journey through the soul of a nation.
 * Modularized for performance and maintainability.
 */
export default function PalestinePage() {
  return (
    <main id="palestine-portal-root" className="min-h-screen text-foreground selection:bg-rose-500/30 selection:text-rose-400 overflow-x-hidden relative" dir="rtl">
      {/* Cinematic Overlays */}
      <ScrollProgressIndicator />
      <BackgroundSoulWords />
      <FilmGrain />
      <GlassyBackground />
      <InteractiveBackgroundGlow />
      <CinematicCursor />
      <PalestineMapOverlay />
      <CinematicAudioPlayer />

      {/* ━━ PHASE 1: THE SOUL ━━ */}
      <HeroSection />
      <QuoteSection />
      <SectionGrid />
      <AlAqsaDetail />
      <EternalSpiritSection />
      <SacredConnectionBento />
      <FlagMeaningSection />

      {/* ━━ PHASE 2: THE FOUNDATION ━━ */}
      <TatreezPatternsGrid />
      <FoodCultureSection />
      <SymbolsSection />
      <MuseumOfHeritageSection />
      <ArchHistorySection />

      {/* ━━ PHASE 3: THE PEOPLE ━━ */}
      <LestWeForgetMemorial />
      <CitiesExplorerSection />
      <DiasporaUnitySection />
      <PersonalitiesSection />

      {/* ━━ PHASE 4: THE HISTORY ━━ */}
      <ResistanceChroniclesSection />
      <ResistanceStatsSection />
      <FactsCounterSection />
      <TimelineSection />

      {/* ━━ PHASE 5: THE TRUTH ━━ */}
      <GlobalAwarenessGrid />
      <GlobalVoicesSection />
      <GlobalMediaWatchSection />
      <GazaResilienceSection />
      <DigitalLibrarySection />
      <DigitalAdvocacyKit />
      <MediaGallery />

      {/* ━━ PHASE 6: THE CONNECTION ━━ */}
      <KnowledgeQuiz />
      <ImmersivePoetryWall />
      <PoetrySection />
      <TreePlantingSimulation />
      <PrayerCounter />

      {/* ━━ PHASE 7: THE SOLIDARITY ━━ */}
      <FutureHopeSection />
      <PledgeCounterSection />
      <GlobalSolidarityCallSection />
      <SolidarityActionGrid />
      <SolidarityLivingWall />
      <CommitmentSection />
      <GlobalSolidarityCard />
      <FooterHeritage />
    </main>
  );
}
