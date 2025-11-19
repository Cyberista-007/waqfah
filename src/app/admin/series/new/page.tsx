
"use client";

import { useCollection } from '@/firebase';
import type { Sheikh } from '@/lib/types';
import { SeriesForm } from '@/components/admin/series-form';
import { HomePageSkeleton } from '@/components/skeletons';

export default function AdminNewSeriesPage() {
  const { data: sheikhs, isLoading: sheikhsLoading } = useCollection<Sheikh>('sheikhs', { orderBy: ['name', 'asc'] });
  
  if (sheikhsLoading) {
      return <HomePageSkeleton />;
  }

  return (
    <SeriesForm sheikhs={sheikhs || []} />
  );
}
