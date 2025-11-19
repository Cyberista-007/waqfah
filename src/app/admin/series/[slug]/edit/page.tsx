
"use client";

import { notFound } from 'next/navigation';
import type { Series, Sheikh } from '@/lib/types';
import { SeriesForm } from '@/components/admin/series-form';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { HomePageSkeleton } from '@/components/skeletons';

export default function AdminEditSeriesPage({ params }: { params: { slug: string } }) {
  // The 'slug' param from the URL is actually the document ID
  const firestore = useFirestore();
  const slug = params.slug;

  const { data: sheikhs, isLoading: sheikhsLoading } = useCollection<Sheikh>('sheikhs', { orderBy: ['name', 'asc'] });

  const seriesDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "series", slug) : null),
    [firestore, slug]
  );
  const { data: series, isLoading: seriesLoading } = useDoc<Series>(seriesDocRef);

  const isLoading = sheikhsLoading || seriesLoading;

  if (isLoading) {
      return <HomePageSkeleton />;
  }

  if (!series) {
    notFound();
  }

  return (
    <SeriesForm series={series} sheikhs={sheikhs || []} />
  );
}
