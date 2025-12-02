
import { notFound } from 'next/navigation';
import type { Series } from '@/lib/types';
import { SeriesForm } from '@/components/admin/series-form';
import { getSeriesBySlug } from '@/lib/data';
import { HomePageSkeleton } from '@/components/skeletons';
import { Suspense } from 'react';

async function SeriesEditForm({ slug }: { slug: string }) {
  const series = await getSeriesBySlug(slug);

  if (!series) {
    notFound();
  }
  
  return <SeriesForm series={series} />;
}

export default function AdminEditSeriesPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <SeriesEditForm slug={params.slug} />
    </Suspense>
  );
}
