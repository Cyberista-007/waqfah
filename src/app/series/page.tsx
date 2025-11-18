
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import { ListVideo } from 'lucide-react';
import { SeriesCard } from '@/components/series-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Series } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function SeriesListPage() {
  const firestore = useFirestore();
  const seriesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'series'), orderBy('title')) : null),
    [firestore]
  );
  const { data: allSeries, isLoading } = useCollection<Series>(seriesQuery);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3"><ListVideo/>السلاسل العلمية</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : allSeries?.map((series) => (
          <SeriesCard series={series} key={series.id} />
        ))}
      </div>
       {!isLoading && (!allSeries || allSeries.length === 0) && (
          <p className="text-center text-muted-foreground py-16">لم يتم إضافة أي سلاسل بعد.</p>
      )}
    </div>
  );
}
