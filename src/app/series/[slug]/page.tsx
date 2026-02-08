'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection, useDoc } from '@/firebase';
import type { Lecture, Program, Series } from '@/lib/types';
import { SeriesClientPage } from '@/components/series-client-page';
import { SeriesPageSkeleton } from '@/components/skeletons';
import { useMemo } from 'react';

export default function SeriesDetailPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  // 1. Fetch all series and find the correct one by slug client-side.
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');

  const series = useMemo(() => {
    if (!allSeries) return null;
    return allSeries.find(s => s.slug === slug);
  }, [allSeries, slug]);

  // 2. Fetch ALL lectures to filter them on the client. This is more robust against missing indexes.
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
  
  const lecturesInSeries = useMemo(() => {
    if (!series || !allLectures) return [];

    const lecturesForThisSeries = allLectures.filter(l => l.seriesId === series.id);
    
    const toDate = (timestamp: any): Date => {
      if (!timestamp) return new Date(0);
      if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
      const d = new Date(timestamp);
      return isNaN(d.getTime()) ? new Date(0) : d;
    };

    // Create a new array before sorting to avoid mutating the original
    return [...lecturesForThisSeries].sort((a, b) => {
      const dateA = toDate(a.createdAt).getTime();
      const dateB = toDate(b.createdAt).getTime();
      return dateA - dateB;
    });

  }, [series, allLectures]);


  // 3. Fetch the program (creator) of the series
  const { data: seriesCreator, isLoading: programLoading } = useDoc<Program>(series?.programId ? `programs/${series.programId}` : null);
  
  const isLoading = seriesLoading || lecturesLoading || (!!series && programLoading);
  
  if (isLoading) {
    return <SeriesPageSkeleton />;
  }
  
  // After all data is loaded, if the series wasn't found, show 404.
  if (!series) {
    notFound();
    return null;
  }

  return (
    <SeriesClientPage
      series={series}
      lecturesInSeries={lecturesInSeries}
      seriesCreator={seriesCreator}
    />
  );
}
