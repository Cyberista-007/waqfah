
import { HomePageClient } from '@/components/home-page-client';
import { HomePageSkeleton } from '@/components/skeletons';
import { Suspense } from 'react';

export default function Home() {

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClient />
    </Suspense>
  );
}
