import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getSeriesBySlug, getLecturesBySeries } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import LectureListItem from '@/components/lecture-list-item';
import type { Series } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebaseOnServer } from '@/firebase/server-init';

type SeriesDetailPageProps = {
  params: {
    slug: string; // This is the document ID now
  };
};

export async function generateMetadata({ params }: SeriesDetailPageProps) {
  const { serverFirestore } = initializeFirebaseOnServer();
  const seriesDocRef = doc(serverFirestore, 'series', params.slug);
  const seriesSnap = await getDoc(seriesDocRef);

  if (!seriesSnap.exists()) {
    return { title: 'السلسلة غير موجودة' };
  }
  const series = seriesSnap.data() as Series;
  return { title: series.title };
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  // We use the doc ID from the params to fetch the series
  const { serverFirestore } = initializeFirebaseOnServer();
  const seriesDocRef = doc(serverFirestore, 'series', params.slug);
  const seriesSnap = await getDoc(seriesDocRef);

  if (!seriesSnap.exists()) {
    notFound();
  }

  const series = { ...seriesSnap.data(), id: seriesSnap.id } as Series;

  // We use the original slug field to find lectures
  const lecturesInSeries = await getLecturesBySeries(series.slug);
  const placeholder = getPlaceholderImage(series.imageId);

  return (
    <div className="space-y-8">
      <Card className="flex flex-col md:flex-row gap-6 items-center p-6">
        <Image
          src={placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/300/300`}
          alt={series.title}
          width={300}
          height={300}
          className="w-full md:w-1/3 h-auto rounded-lg object-cover"
          data-ai-hint={placeholder?.imageHint || 'islamic art'}
        />
        <div className="md:w-2/3">
          <h1 className="text-4xl font-bold mb-4 font-headline">{series.title}</h1>
          <p className="text-lg mb-4 text-muted-foreground">{series.description}</p>
          <Badge>{series.lectureCount} محاضرة</Badge>
        </div>
      </Card>

      <section>
        <h2 className="text-3xl font-bold mb-6 font-headline">محاضرات السلسلة</h2>
        <div className="space-y-4">
          {lecturesInSeries.map((lecture, index) => (
            <LectureListItem key={lecture.slug} lecture={lecture} index={index + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
