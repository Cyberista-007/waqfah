'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection, useDoc } from '@/firebase';
import type { Lecture, Program, Series } from '@/lib/types';
import { SeriesClientPage } from '@/components/series-client-page';
import { SeriesPageSkeleton } from '@/components/skeletons';

export default function SeriesDetailPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  // Fetch all data and let React re-render as it arrives.
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
  
  // Find the current series based on the slug.
  const series = allSeries?.find(s => s.slug === slug) ?? null;

  // Determine IDs for dependent fetches.
  const programId = series?.programId ?? null;
  const seriesId = series?.id ?? null;
  
  // Fetch the program/creator using the programId from the series.
  const { data: seriesCreator, isLoading: programLoading } = useDoc<Program>(
    programId ? `programs/${programId}` : null
  );
  
  // Filter and sort lectures for the current series.
  // This is more robust than a Firestore 'where' query if indexes are missing.
  const lecturesInSeries = (allLectures && seriesId)
    ? allLectures
        .filter(l => l.seriesId === seriesId)
        .sort((a, b) => {
            const toDate = (ts: any): Date => ts?.toDate ? ts.toDate() : new Date(ts || 0);
            return toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime();
        })
    : [];

  // Determine overall loading state.
  const isLoading = seriesLoading || lecturesLoading || (!!series && !seriesCreator && !!programId && programLoading);

  if (isLoading) {
    return <SeriesPageSkeleton />;
  }
  
  // If, after loading, the series still isn't found, show a 404 page.
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
