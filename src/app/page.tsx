

import { HomePageClient } from '@/components/home-page-client';
import { HomePageSkeleton } from '@/components/skeletons';
import { getLatestLectures, getTopPrograms, getLatestSeries, getUpcomingLesson, getLatestQAPair, getPublicPlaylists } from '@/lib/data';
import { Suspense } from 'react';

export default async function Home() {
  const [
    latestLectures, 
    topPrograms, 
    latestSeries, 
    upcomingLesson, 
    latestQAPair, 
    publicPlaylists
  ] = await Promise.all([
    getLatestLectures(),
    getTopPrograms(),
    getLatestSeries(),
    getUpcomingLesson(),
    getLatestQAPair(),
    getPublicPlaylists(),
  ]);

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClient 
        latestLectures={latestLectures}
        topPrograms={topPrograms}
        latestSeries={latestSeries}
        upcomingLesson={upcomingLesson}
        latestQAPair={latestQAPair}
        publicPlaylists={publicPlaylists}
      />
    </Suspense>
  );
}
