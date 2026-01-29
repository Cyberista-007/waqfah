'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection } from '@/firebase';
import type { Lecture, Program, Series } from '@/lib/types';
import { SeriesClientPage } from '@/components/series-client-page';
import { SeriesPageSkeleton } from '@/components/skeletons';
import { useMemo } from 'react';

export default function SeriesDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');

  const isLoading = seriesLoading || lecturesLoading || programsLoading;

  const { series, lecturesInSeries, seriesCreator } = useMemo(() => {
    if (isLoading || !allSeries || !allLectures || !allPrograms) {
      return { series: null, lecturesInSeries: [], seriesCreator: null };
    }

    const currentSeries = allSeries.find(s => s.slug === slug);

    if (!currentSeries) {
      return { series: null, lecturesInSeries: [], seriesCreator: null };
    }

    const lectures = allLectures
      .filter(l => l.seriesId === currentSeries.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const creator = currentSeries.programId 
      ? allPrograms.find(p => p.id === currentSeries.programId) || null 
      : null;

    return { series: currentSeries, lecturesInSeries: lectures, seriesCreator: creator };

  }, [isLoading, allSeries, allLectures, allPrograms, slug]);

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
