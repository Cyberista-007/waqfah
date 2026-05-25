import { Suspense } from 'react';
import HadithPageClient from './HadithPageClient';
import { CinematicAppLoader } from '@/components/skeletons';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ bookId: 'bukhari' }];
}

export default function Page({ params }: { params: Promise<{ bookId: string }> }) {
  return (
    <Suspense fallback={<CinematicAppLoader />}>
      <HadithPageClient params={params} />
    </Suspense>
  );
}
