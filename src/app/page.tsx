import {
  Card,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getLatestLectures, getLatestSeries } from '@/lib/data';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getPlaceholderImage } from '@/lib/images';
import { LectureCard } from '@/components/lecture-card';

export default async function Home() {
  const latestSeries = await getLatestSeries(3);
  const latestLectures = await getLatestLectures(8);

  return (
    <div className="space-y-12">
      <section className="relative -mt-[calc(4rem+1px)] flex h-[60vh] min-h-[500px] flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 to-transparent"></div>
        <div className="container relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 font-headline tracking-tight text-foreground">
            العلم الشرعي بين يديك
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            منصة شاملة لمحاضرات ودروس الشيخ أمجد سمير. تصفح، استمع، وتعلم.
          </p>
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Input
                type="search"
                placeholder="ابحث عن محاضرة، سلسلة، كتاب..."
                className="w-full p-6 pe-12 text-lg rounded-full shadow-lg focus:ring-2 focus:ring-ring border-2 border-transparent focus:border-primary"
                aria-label="بحث"
              />
              <span className="absolute top-1/2 end-4 -translate-y-1/2 text-muted-foreground">
                <Search className="w-6 h-6" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-16">
        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">أحدث السلاسل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestSeries.map((series) => {
              const placeholder = getPlaceholderImage(series.imageId);
              return (
                <Card
                  key={series.slug}
                  className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 group border-2 border-transparent hover:border-primary/50"
                >
                  <Link href={`/series/${series.id}`} className="block relative">
                     <Image
                      src={placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/600/400`}
                      alt={series.title}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={placeholder?.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <span>{series.lectureCount}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  </Link>
                  <div className="p-4 bg-card">
                    <h3 className="font-headline text-lg font-bold">
                      <Link href={`/series/${series.id}`} className="hover:text-primary transition-colors">{series.title}</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{series.description}</p>
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
    </div>
  );
}
