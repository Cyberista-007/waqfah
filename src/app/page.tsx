

import { HomePageClient } from '@/components/home-page-client';
import { HomePageSkeleton } from '@/components/skeletons';
import { getLatestLectures, getTopPrograms, getLatestSeries } from '@/lib/data';
import { Suspense } from 'react';

export default async function Home() {
  const [latestLectures, topPrograms, latestSeries] = await Promise.all([
    getLatestLectures(),
    getTopPrograms(),
    getLatestSeries(),
  ]);

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClient 
        latestLectures={latestLectures}
        topPrograms={topPrograms}
        latestSeries={latestSeries}
      />
    </Suspense>
  );
}
