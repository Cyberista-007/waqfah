import { Suspense } from 'react';
import HadithPageClient from './HadithPageClient';
import { CinematicAppLoader } from '@/components/skeletons';

export const dynamic = 'force-dynamic';

export default function Page({ params }: { params: Promise<{ bookId: string }> }) {
  return (
    <Suspense fallback={<CinematicAppLoader />}>
      <HadithPageClient params={params} />
    </Suspense>
  );
}
