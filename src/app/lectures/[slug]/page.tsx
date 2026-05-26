import { Suspense } from 'react';
import LecturePageClient from './LecturePageClient';
import { CinematicAppLoader } from '@/components/skeletons';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<CinematicAppLoader />}>
      <LecturePageClient />
    </Suspense>
  );
}
