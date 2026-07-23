'use client';

import { HomePageClient } from '@/components/home-page-client';
import { CinematicAppLoader } from '@/components/skeletons';
import { useCollection, useDoc } from '@/firebase';
import type { Lecture, Program, Series, ScheduleItem, QAPair, Playlist, HomepageDetailedConfig } from '@/lib/types';
import React, { Suspense, useMemo } from 'react';

function HomePageContent() {
  const { data: latestLectures } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'], limit: 12 });
  const { data: topPrograms } = useCollection<Program>('programs', { orderBy: ['followerCount', 'desc'], limit: 12 });
  const { data: latestSeries } = useCollection<Series>('series', { orderBy: ['createdAt', 'desc'], limit: 12 });
  const { data: homepageConfig } = useDoc<HomepageDetailedConfig>('settings/homepage');

  return (
    <HomePageClient 
        latestLectures={latestLectures || []}
        topPrograms={topPrograms || []}
        latestSeries={latestSeries || []}
        upcomingLesson={null} 
        latestQAPair={null} 
        publicPlaylists={[]}
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
