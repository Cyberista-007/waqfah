'use client';

import { HomePageClient } from '@/components/home-page-client';
import { CinematicAppLoader } from '@/components/skeletons';
import { useCollection, useDoc } from '@/firebase';
import type { Lecture, Program, Series, ScheduleItem, QAPair, Playlist, HomepageDetailedConfig } from '@/lib/types';
import React, { Suspense, useMemo } from 'react';

function HomePageContent() {
  const { data: latestLectures, isLoading: l1 } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'], limit: 12 });
  const { data: topPrograms, isLoading: l2 } = useCollection<Program>('programs', { orderBy: ['followerCount', 'desc'], limit: 12 });
  const { data: latestSeries, isLoading: l3 } = useCollection<Series>('series', { orderBy: ['createdAt', 'desc'], limit: 12 });
  
  // For simplicity in client-side fallback, we fetch some basics
  // In a real app, we'd more precisely match the server component's complex logic
  const { data: homepageConfig, isLoading: l4 } = useDoc<HomepageDetailedConfig>('settings/homepage');
  const { data: publicPlaylists, isLoading: l5 } = useCollection<Playlist>('playlists', { where: ['isPublic', '==', true], limit: 3 });
  
  const [forceFinish, setForceFinish] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setForceFinish(true), 2500); // 2.5s safety timeout
    return () => clearTimeout(timer);
  }, []);

  return (
    <HomePageClient 
        latestLectures={latestLectures || []}
        topPrograms={topPrograms || []}
        latestSeries={latestSeries || []}
        upcomingLesson={null} 
        latestQAPair={null} 
        publicPlaylists={publicPlaylists || []}
        homepageConfig={homepageConfig || null}
        stripLectures={[]} 
      />
  );
}

export default function Home() {
    return (
        <HomePageContent />
    )
}
