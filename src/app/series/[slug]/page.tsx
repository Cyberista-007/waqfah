'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection, useDoc } from '@/firebase';
import type { Lecture, Program, Series } from '@/lib/types';
import { SeriesClientPage } from '@/components/series-client-page';
import { SeriesPageSkeleton } from '@/components/skeletons';
import { useMemo } from 'react';

export default function SeriesDetailPage() {
  const params = useParams();
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = decodeURIComponent(slugParam as string);

  const { data: seriesList, isLoading: seriesLoading } = useCollection<Series>('series', {
    where: ['slug', '==', slug],
    limit: 1
  });
  
  const series = seriesList?.[0];

  const { data: lecturesInSeries, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', {
    where: ['seriesId', '==', series?.id || 'none'],
    limit: 100
  });

  const programId = series?.programId ?? null;
  
  const { data: creator, isLoading: programLoading } = useDoc<Program>(
    programId ? `programs/${programId}` : null
  );
  
  const sortedLectures = useMemo(() => {
    if (!lecturesInSeries) return [];
    return [...lecturesInSeries].sort((a, b) => {
        const toDate = (ts: any): Date => ts?.toDate ? ts.toDate() : new Date(ts || 0);
        return toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime();
    });
  }, [lecturesInSeries]);

  const isLoading = seriesLoading || (!!series && (lecturesLoading || (!!programId && programLoading)));

  if (seriesLoading) {
    return <SeriesPageSkeleton />;
  }
  
  if (!series && !isLoading) {
    notFound();
    return null;
  }

  return (
    <SeriesClientPage
      series={series!}
      lecturesInSeries={sortedLectures}
      seriesCreator={creator || null}
    />
  );
}
