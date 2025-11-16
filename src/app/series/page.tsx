import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllSeries } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/images';

export const metadata = {
  title: 'السلاسل العلمية',
};

export default function SeriesListPage() {
  const allSeries = getAllSeries();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline">السلاسل العلمية</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allSeries.map((series) => {
          const placeholder = getPlaceholderImage(series.imageId);
          return (
            <Card
              key={series.slug}
              className="overflow-hidden transition-transform transform hover:-translate-y-1"
            >
              <Link href={`/series/${series.slug}`} className="block">
                <Image
                  src={placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/600/400`}
                  alt={series.title}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                  data-ai-hint={placeholder?.imageHint}
                />
              </Link>
              <CardHeader>
                <CardTitle className="font-headline">
                    <Link href={`/series/${series.slug}`}>{series.title}</Link>
                </CardTitle>
                <CardDescription>{series.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/series/${series.slug}`}
                  className="font-medium text-primary-foreground/80 hover:text-primary-foreground"
                >
                  عرض السلسلة ({series.lectureCount} محاضرة)
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
