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

  // 1. Fetch the series by slug.
  const { data: seriesList, isLoading: seriesLoading } = useCollection<Series>(
    'series', 
    { where: ['slug', '==', slug], limit: 1 }
  );

  const series = seriesList?.[0];

  // 2. Fetch lectures for this series.
  // The useCollection hook handles the case where series?.id is initially undefined.
  const { data: lectures, isLoading: lecturesLoading } = useCollection<Lecture>(
    'lectures',
    {
      where: ['seriesId', '==', series?.id]
    }
  );
  
  const lecturesInSeries = useMemo(() => {
    if (!lectures) return [];
    
    const toDate = (timestamp: any): Date => {
      if (!timestamp) return new Date(0);
      if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
      const d = new Date(timestamp);
      return isNaN(d.getTime()) ? new Date(0) : d;
    };

    // Create a new array before sorting to avoid mutating the original
    return [...lectures].sort((a, b) => {
      const dateA = toDate(a.createdAt).getTime();
      const dateB = toDate(b.createdAt).getTime();
      return dateA - dateB;
    });

  }, [lectures]);


  // 3. Fetch the program (creator) of the series
  const { data: seriesCreator, isLoading: programLoading } = useDoc<Program>(series?.programId ? `programs/${series.programId}` : null);
  
  const isLoading = seriesLoading || (!!series && (lecturesLoading || programLoading));
  
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
      lecturesInSeries={lecturesInSeries}
      seriesCreator={seriesCreator}
    />
  );
}
