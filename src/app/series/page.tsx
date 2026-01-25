
import { ListVideo } from 'lucide-react';
import { SeriesCard } from '@/components/series-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { getAllSeries } from '@/lib/data';
import { Suspense } from 'react';


function SeriesListSkeleton() {
  return (
    <>
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
    </>
  )
}

async function SeriesList() {
    const allSeries = await getAllSeries();
    return (
        <>
            {allSeries && allSeries.length > 0 ? (
                allSeries.map((series, index) => (
                  <SeriesCard series={series} key={series.id} index={index} />
                ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-16">
                  <p>لم يتم إضافة أي سلاسل بعد.</p>
              </div>
            )}
        </>
    )
}

export default function SeriesListPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3"><ListVideo/>السلاسل العلمية</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Suspense fallback={<SeriesListSkeleton />}>
          <SeriesList />
        </Suspense>
      </div>
    </div>
  );
}
