'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Lecture, Program, Series } from '@/lib/types';
import { SeriesClientPage } from '@/components/series-client-page';
import { SeriesPageSkeleton } from '@/components/skeletons';
import { useMemo } from 'react';

// Wrapper to fetch dependent data now that we have a valid series
function SeriesContentWrapper({ series }: { series: Series }) {
  const firestore = useFirestore();

  // Fetch lectures in this series
  const { data: lecturesInSeries, isLoading: lecturesLoading } = useCollection<Lecture>(
    'lectures', 
    { where: ['seriesId', '==', series.id], orderBy: ['createdAt', 'asc'] }
  );
  
  // Fetch the creator (Program)
  const programDocRef = useMemoFirebase(
    () => (series.programId ? doc(firestore, 'programs', series.programId) : null),
    [firestore, series.programId]
  );
  const { data: seriesCreator, isLoading: programLoading } = useDoc<Program>(programDocRef);
  
  const contentIsLoading = lecturesLoading || programLoading;

  // Show skeleton if any of the dependent content is loading for the first time
  if (contentIsLoading && !lecturesInSeries) {
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

export default function SeriesDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // 1. Fetch the series by slug
  const { data: seriesList, isLoading: seriesLoading } = useCollection<Series>(
    'series', 
    { where: ['slug', '==', slug], limit: 1 }
  );
  
  // Show skeleton while the main resource is loading
  if (seriesLoading) {
    return <SeriesPageSkeleton />;
  }

  const series = seriesList?.[0];
  
  // If loading is done and still no series, it's a 404
  if (!series) {
    notFound();
    return null;
  }
  
  // This component will now only be rendered if `series` is found.
  // It fetches its own dependent data.
  return <SeriesContentWrapper series={series} />;
}
