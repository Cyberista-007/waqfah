import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllSeries } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/images';
import { ListVideo } from 'lucide-react';
import { SeriesCard } from '@/components/series-card';

export const metadata = {
  title: 'السلاسل العلمية',
};

// Revalidate this page every hour
export const revalidate = 3600;


export default async function SeriesListPage() {
  const allSeries = await getAllSeries();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3"><ListVideo/>السلاسل العلمية</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allSeries.map((series) => (
          <SeriesCard series={series} key={series.id} />
        ))}
      </div>
       {!allSeries || allSeries.length === 0 && (
          <p className="text-center text-muted-foreground py-16">لم يتم إضافة أي سلاسل بعد.</p>
      )}
    </div>
  );
}
