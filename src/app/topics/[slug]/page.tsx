'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection } from '@/firebase';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import { Hash, Loader2 } from 'lucide-react';
import type { Topic, Lecture, Series } from '@/lib/types';
import { useMemo } from 'react';
import { HomePageSkeleton } from '@/components/skeletons';

export default function TopicDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: allTopics, isLoading: topicsLoading } = useCollection<Topic>('topics');
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');

  const isLoading = topicsLoading || lecturesLoading || seriesLoading;

  const { topic, lectures, series } = useMemo(() => {
    if (isLoading || !allTopics || !allLectures || !allSeries) {
      return { topic: null, lectures: [], series: [] };
    }

    const currentTopic = allTopics.find(t => t.slug === slug);
    if (!currentTopic) {
      return { topic: null, lectures: [], series: [] };
    }

    const topicLectures = (currentTopic.lectureIds || [])
      .map(id => allLectures.find(l => l.id === id))
      .filter((l): l is Lecture => !!l);
      
    const topicSeries = (currentTopic.seriesIds || [])
      .map(id => allSeries.find(s => s.id === id))
      .filter((s): s is Series => !!s);

    return { topic: currentTopic, lectures: topicLectures, series: topicSeries };
  }, [isLoading, allTopics, allLectures, allSeries, slug]);

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  if (!topic) {
    notFound();
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
      <header className="text-center">
        <Hash className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-4xl lg:text-5xl font-extrabold mt-4 mb-2 font-headline">{topic.name}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{topic.description}</p>
      </header>

      {series.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">السلاسل المتعلقة بالموضوع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {series.map(s => <SeriesCard key={s.id} series={s} />)}
          </div>
        </section>
      )}

      {lectures.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">المحاضرات المتعلقة بالموضوع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map(l => <LectureCard key={l.id} lecture={l} />)}
          </div>
        </section>
      )}

      {lectures.length === 0 && series.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">لا يوجد محتوى مرتبط بهذا الموضوع حالياً.</p>
        </div>
      )}
    </div>
  );
}
