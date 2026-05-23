'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection } from '@/firebase';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import { CinematicAppLoader } from '@/components/skeletons';
import type { Lecture, Series } from '@/lib/types';

export default function TopicPageClient() {
  const params = useParams();
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = decodeURIComponent(slugParam as string);

  const { data: lectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', {
    where: ['topic', '==', slug],
    limit: 100
  });

  const { data: series, isLoading: seriesLoading } = useCollection<Series>('series', {
    where: ['topic', '==', slug],
    limit: 50
  });

  const isLoading = lecturesLoading || seriesLoading;

  if (isLoading) {
    return <CinematicAppLoader />;
  }

  if (!lectures?.length && !series?.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4 font-headline">{slug}</h1>
        <p className="text-lg text-muted-foreground">لا يوجد محتوى متاح لهذا الموضوع حالياً.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      <header className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tight">{slug}</h1>
        <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
      </header>

      {series && series.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">السلاسل المختارة في هذا الموضوع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {series.map(s => <SeriesCard key={s.id} series={s} />)}
          </div>
        </section>
      )}

      {lectures && lectures.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">المحاضرات المختارة في هذا الموضوع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map(l => <LectureCard key={l.id} lecture={l} />)}
          </div>
        </section>
      )}
    </div>
  );
}
