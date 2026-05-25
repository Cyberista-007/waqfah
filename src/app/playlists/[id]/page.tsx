import { Suspense } from 'react';
import PlaylistPageClient from './PlaylistPageClient';
import { CinematicAppLoader } from '@/components/skeletons';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function Page() {
  return (
    <Suspense fallback={<CinematicAppLoader />}>
      <PlaylistPageClient />
    </Suspense>
  );
}
