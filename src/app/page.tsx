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
  const latestLectures = getLatestLectures(5);

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
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 font-headline">أحدث المحاضرات</h2>
        <div className="space-y-4">
          {latestLectures.map((lecture) => (
            <LectureCard key={lecture.slug} lecture={lecture} />
          ))}
        </div>
      </section>
    </div>
  );
}
