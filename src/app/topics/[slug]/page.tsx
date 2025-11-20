
import { notFound } from 'next/navigation';
import { getTopicBySlug, getLecturesByIds, getSeriesByIds } from '@/lib/data';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import { Hash } from 'lucide-react';

type TopicDetailPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: TopicDetailPageProps) {
  const topic = await getTopicBySlug(params.slug);
  if (!topic) {
    return { title: 'الموضوع غير موجود' };
  }
  return {
    title: `موضوع: ${topic.name}`,
    description: topic.description,
  };
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const topic = await getTopicBySlug(params.slug);

  if (!topic) {
    notFound();
  }

  const [lectures, series] = await Promise.all([
    getLecturesByIds(topic.lectureIds),
    getSeriesByIds(topic.seriesIds),
  ]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

