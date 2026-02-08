'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Lecture, Program, Series } from '@/lib/types';
import { SeriesClientPage } from '@/components/series-client-page';
import { SeriesPageSkeleton } from '@/components/skeletons';

export default function SeriesDetailPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);
  const firestore = useFirestore();

  // 1. Fetch the series by slug.
  const { data: seriesList, isLoading: seriesLoading } = useCollection<Series>(
    'series', 
    { where: ['slug', '==', slug], limit: 1 }
  );

  const series = seriesList?.[0];
  
  // 2. Based on series, fetch lectures. Use a stable query that only runs when `series.id` is available.
  const { data: lecturesInSeries, isLoading: lecturesLoading } = useCollection<Lecture>(
    series?.id ? 'lectures' : null, // Only create the query if we have a series.id
    { where: ['seriesId', '==', series?.id], orderBy: ['createdAt', 'asc'] }
  );
  
  // 3. Fetch the creator (Program) of the series.
  const programDocRef = useMemoFirebase(
    () => (series?.programId ? doc(firestore, 'programs', series.programId) : null),
    [firestore, series?.programId]
  );
  const { data: seriesCreator, isLoading: programLoading } = useDoc<Program>(programDocRef);
  
  // If still loading the main series data, show skeleton
  if (seriesLoading) {
    return <SeriesPageSkeleton />;
  }
  
  // If loading is done and no series was found, this is a 404.
  if (!series) {
    notFound();
    return null;
  }
  
  // Now we have a series, but the lectures might still be loading.
  if (lecturesLoading && !lecturesInSeries) {
      return <SeriesPageSkeleton />;
  }

  return (
    <SeriesClientPage
      series={series}
      lecturesInSeries={lecturesInSeries || []}
      seriesCreator={seriesCreator}
    />
  );
}
