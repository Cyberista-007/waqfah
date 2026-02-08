'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { Lecture, Program, Series } from '@/lib/types';
import { SeriesClientPage } from '@/components/series-client-page';
import { SeriesPageSkeleton } from '@/components/skeletons';
import { useEffect, useState } from 'react';

export default function SeriesDetailPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);
  const firestore = useFirestore();

  // 1. Fetch the series by slug.
  const { data: seriesList, isLoading: seriesLoading } = useCollection<Series>(
    'series', 
    { where: ['slug', '==', slug], limit: 1 }
  );

  const series = seriesList?.[0];

  // State for lectures and program, to be fetched manually
  const [lecturesInSeries, setLecturesInSeries] = useState<Lecture[] | null>(null);
  const [seriesCreator, setSeriesCreator] = useState<Program | null>(null);
  const [isDependentDataLoading, setIsDependentDataLoading] = useState(true);

  useEffect(() => {
    if (!series || !firestore) {
      if (!seriesLoading) {
        // if series loading is done and we still have no series, we're done.
        setIsDependentDataLoading(false);
      }
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      setIsDependentDataLoading(true);
      try {
        // Fetch lectures
        const lecturesQuery = query(
          collection(firestore, 'lectures'),
          where('seriesId', '==', series.id),
          orderBy('createdAt', 'asc')
        );
        const lecturesSnapshot = await getDocs(lecturesQuery);
        const lecturesData = lecturesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lecture));
        
        // Fetch program
        let programData: Program | null = null;
        if (series.programId) {
          const programRef = doc(firestore, 'programs', series.programId);
          const programSnap = await getDoc(programRef);
          if (programSnap.exists()) {
            programData = { id: programSnap.id, ...programSnap.data() } as Program;
          }
        }
        
        if (isMounted) {
          setLecturesInSeries(lecturesData);
          setSeriesCreator(programData);
        }

      } catch (error) {
        console.error("Error fetching dependent data for series page:", error);
      } finally {
        if (isMounted) {
          setIsDependentDataLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    }
  }, [series, firestore, seriesLoading]);
  
  const isLoading = seriesLoading || (isDependentDataLoading && !!series);

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
      lecturesInSeries={lecturesInSeries || []}
      seriesCreator={seriesCreator}
    />
  );
}
