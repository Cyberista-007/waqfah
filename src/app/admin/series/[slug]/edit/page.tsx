
"use client";

import { notFound } from 'next/navigation';
import type { Series } from '@/lib/types';
import { SeriesForm } from '@/components/admin/series-form';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { HomePageSkeleton } from '@/components/skeletons';
import { useEffect, useState } from 'react';

export default function AdminEditSeriesPage({ params }: { params: { slug: string } }) {
  const firestore = useFirestore();
  const slug = params.slug;

  const [series, setSeries] = useState<Series | null>(null);
  const [seriesLoading, setSeriesLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !slug) return;

    const getSeries = async () => {
        setSeriesLoading(true);
        const seriesCol = collection(firestore, 'series');
        const q = query(seriesCol, where("slug", "==", slug), limit(1));
        const seriesSnap = await getDocs(q);

        if (seriesSnap.empty) {
            setSeries(null);
        } else {
            const doc = seriesSnap.docs[0];
            setSeries({ ...doc.data(), id: doc.id } as Series);
        }
        setSeriesLoading(false);
    }
    getSeries();

  }, [firestore, slug]);


  if (seriesLoading) {
      return <HomePageSkeleton />;
  }

  if (!series) {
    notFound();
  }

  return (
    <SeriesForm series={series} />
  );
}
