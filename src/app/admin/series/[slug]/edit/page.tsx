'use client';

import { notFound, useParams } from 'next/navigation';
import type { Series } from '@/lib/types';
import { SeriesForm } from '@/components/admin/series-form';
import { HomePageSkeleton } from '@/components/skeletons';
import { useCollection } from '@/firebase';

export default function AdminEditSeriesPage() {
    const params = useParams();
    const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const slug = decodeURIComponent(slugParam as string);

    const { data: allSeries, isLoading } = useCollection<Series>('series');

    if (isLoading) {
        return <HomePageSkeleton />;
    }

    const seriesToEdit = allSeries?.find(s => s.slug === slug);

    if (!seriesToEdit) {
        notFound();
        return null;
    }
  
  return <SeriesForm series={seriesToEdit} />;
}
