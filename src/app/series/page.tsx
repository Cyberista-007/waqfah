
"use client";

import { ListVideo } from 'lucide-react';
import { SeriesCard } from '@/components/series-card';
import { useCollection } from '@/firebase';
import type { Series } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';


export default function SeriesListPage() {
  const { data: allSeries, isLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });

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
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : allSeries?.map((series, index) => (
          <SeriesCard series={series} key={series.id} index={index} />
        ))}
      </div>
       {!isLoading && (!allSeries || allSeries.length === 0) && (
          <p className="text-center text-muted-foreground py-16">لم يتم إضافة أي سلاسل بعد.</p>
      )}
    </div>
  );
}
