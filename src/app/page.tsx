
"use client";

import {
  Card,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getPlaceholderImage } from '@/lib/images';
import { LectureCard } from '@/components/lecture-card';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Series, Lecture } from '@/lib/types';
import { HomePageSkeleton } from '@/components/skeletons';
import { RecommendedLectures } from '@/components/recommended-lectures';
import { useMemo } from 'react';


export default function Home() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const latestSeriesQuery = useMemo(
    () => (firestore ? query(collection(firestore, 'series'), orderBy('createdAt', 'desc'), limit(3)) : null),
    [firestore]
  );
  const { data: latestSeries, isLoading: seriesLoading } = useCollection<Series>(latestSeriesQuery);

  const latestLecturesQuery = useMemo(
    () => (firestore ? query(collection(firestore, 'lectures'), orderBy('createdAt', 'desc'), limit(8)) : null),
    [firestore]
  );
  const { data: latestLectures, isLoading: lecturesLoading } = useCollection<Lecture>(latestLecturesQuery);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  if (seriesLoading || lecturesLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="space-y-12">
      <section className="relative -mt-[calc(4rem+1px)] flex h-[60vh] min-h-[500px] flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 to-transparent"></div>
        <div className="container relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 font-headline tracking-tight text-foreground">
            العلم الشرعي بين يديك
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            منصة شاملة لمحاضرات ودروس نخبة من المشايخ. تصفح، استمع، وتعلم.
          </p>
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="search"
                  name="search"
                  placeholder="ابحث عن محاضرة، سلسلة، كتاب..."
                  className="w-full p-6 pe-12 text-lg rounded-full shadow-lg focus:ring-2 focus:ring-ring border-2 border-transparent focus:border-primary"
                  aria-label="بحث"
                />
                <button type="submit" className="absolute top-1/2 end-4 -translate-y-1/2 text-muted-foreground">
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-16">
        {user && <RecommendedLectures />}

        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">أحدث السلاسل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestSeries?.map((series) => {
              const placeholder = getPlaceholderImage(series.imageId);
              return (
                <Card
                  key={series.id}
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
                        <span>{series.lectureCount || 0}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  </Link>
                  <div className="p-4 bg-card">
                    <h3 className="font-headline text-lg font-bold">
                      <Link href={`/series/${series.id}`} className="hover:text-primary transition-colors">{series.title}</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{series.sheikhName}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">أحدث المحاضرات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestLectures?.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
