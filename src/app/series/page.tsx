import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllSeries } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/images';

export const metadata = {
  title: 'السلاسل العلمية',
};

export default async function SeriesListPage() {
  const allSeries = await getAllSeries();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline">السلاسل العلمية</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allSeries.map((series) => {
          const placeholder = getPlaceholderImage(series.imageId);
          return (
             <Card
                key={series.id}
                className="overflow-hidden transition-transform transform hover:-translate-y-1 group"
              >
                <Link href={`/series/${series.id}`} className="block relative">
                   <Image
                    src={placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/600/400`}
                    alt={series.title}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint={placeholder?.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   <div className="absolute top-2 left-2 bg-black/50 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <span>{series.lectureCount}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </Link>
                <div className="bg-card-foreground text-card p-4">
                  <h3 className="font-headline text-lg truncate">
                    <Link href={`/series/${series.id}`} className="hover:underline">{series.title}</Link>
                  </h3>
                </div>
              </Card>
          );
        })}
      </div>
    </div>
  );
}
