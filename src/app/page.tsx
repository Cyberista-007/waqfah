import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getLatestLectures, getLatestSeries } from '@/lib/data';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getPlaceholderImage } from '@/lib/images';
import { LectureCard } from '@/components/lecture-card';

export default function Home() {
  const latestSeries = getLatestSeries(3);
  const latestLectures = getLatestLectures(8);

  return (
    <div className="space-y-12">
      <section className="mb-12">
        <div className="relative">
          <Input
            type="search"
            placeholder="ابحث عن محاضرة، سلسلة، كتاب..."
            className="w-full p-6 pe-12 text-lg rounded-lg shadow-sm focus:ring-2 focus:ring-ring"
            aria-label="بحث"
          />
          <span className="absolute top-1/2 end-4 -translate-y-1/2 text-muted-foreground">
            <Search className="w-6 h-6" />
          </span>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 font-headline">أحدث السلاسل</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestSeries.map((series) => {
            const placeholder = getPlaceholderImage(series.imageId);
            return (
              <Card
                key={series.slug}
                className="overflow-hidden transition-transform transform hover:-translate-y-1 group"
              >
                <Link href={`/series/${series.slug}`} className="block relative">
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
                    <Link href={`/series/${series.slug}`} className="hover:underline">{series.title}</Link>
                  </h3>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 font-headline">أحدث المحاضرات</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestLectures.map((lecture) => (
            <LectureCard key={lecture.slug} lecture={lecture} />
          ))}
        </div>
      </section>
    </div>
  );
}
