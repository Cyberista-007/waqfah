
import { HomePageClient } from '@/components/home-page-client';
import { getLatestSeries, getLatestLectures, getTopPrograms } from '@/lib/data';
import { HomePageSkeleton } from '@/components/skeletons';
import { Suspense } from 'react';

export default async function Home() {
  const [latestSeries, latestLectures, topPrograms] = await Promise.all([
    getLatestSeries(),
    getLatestLectures(),
    getTopPrograms(),
  ]);

  // This is a simple way to handle the case where firebase-admin isn't configured.
  // The page will still render with empty arrays.
  const isLoading = !latestSeries || !latestLectures || !topPrograms;
  if (isLoading && process.env.FIREBASE_SERVICE_ACCOUNT) {
    return <HomePageSkeleton />;
  }

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClient
        latestSeries={latestSeries || []}
        latestLectures={latestLectures || []}
        topPrograms={topPrograms || []}
      />
    </Suspense>
  );
}
