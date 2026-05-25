import { Suspense } from 'react';
import LecturePageClient from './LecturePageClient';
import { CinematicAppLoader } from '@/components/skeletons';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ slug: 'default' }];
}

export default function Page() {
  return (
    <Suspense fallback={<CinematicAppLoader />}>
      <LecturePageClient />
    </Suspense>
  );
}
