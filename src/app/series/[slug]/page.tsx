'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Lecture, Program, Series } from '@/lib/types';
import { SeriesClientPage } from '@/components/series-client-page';
import { SeriesPageSkeleton } from '@/components/skeletons';
import { useMemo } from 'react';

export default function SeriesDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const firestore = useFirestore();

  // 1. Fetch the series by slug
  const { data: seriesList, isLoading: seriesLoading } = useCollection<Series>(
    'series', 
    { where: ['slug', '==', slug], limit: 1 }
  );
  const series = seriesList?.[0];
  const seriesId = series?.id;
  const programId = series?.programId;

  // 2. Fetch lectures in this series
  const { data: lecturesInSeries, isLoading: lecturesLoading } = useCollection<Lecture>(
    seriesId ? 'lectures' : null, 
    { where: ['seriesId', '==', seriesId], orderBy: ['createdAt', 'asc'] }
  );
  
  // 3. Fetch the creator (Program)
  const programDocRef = useMemoFirebase(
    () => (programId ? doc(firestore, 'programs', programId) : null),
    [firestore, programId]
  );
  const { data: seriesCreator, isLoading: programLoading } = useDoc<Program>(programDocRef);
  
  const isLoading = seriesLoading || (seriesId !== undefined && lecturesLoading) || (programId !== undefined && programLoading);

  if (isLoading) {
    return <SeriesPageSkeleton />;
  }

  if (!series) {
    notFound();
    return null;
  }

  return (
    <SeriesClientPage
      series={series}
      lecturesInSeries={lecturesInSeries || []}
      seriesCreator={seriesCreator}
    />
  );
}
