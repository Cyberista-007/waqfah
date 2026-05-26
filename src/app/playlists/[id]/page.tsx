import { Suspense } from 'react';
import PlaylistPageClient from './PlaylistPageClient';
import { CinematicAppLoader } from '@/components/skeletons';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<CinematicAppLoader />}>
      <PlaylistPageClient />
    </Suspense>
  );
}
