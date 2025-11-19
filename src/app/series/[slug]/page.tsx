
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import LectureListItem from '@/components/lecture-list-item';
import type { Series, Lecture } from '@/lib/types';
import { doc, getDoc, collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { initializeFirebaseOnServer } from '@/firebase/server-init';
import { SeriesPageSkeleton } from '@/components/skeletons';

type SeriesDetailPageProps = {
  params: {
    slug: string; // This is the document ID now
  };
};

async function getSeriesData(seriesId: string) {
    const { serverFirestore } = initializeFirebaseOnServer();
    const seriesDocRef = doc(serverFirestore, 'series', seriesId);
    const seriesSnap = await getDoc(seriesDocRef);

    if (!seriesSnap.exists()) {
        return null;
    }

    const seriesData = seriesSnap.data();
    const series = {
       ...seriesData,
       id: seriesSnap.id,
       createdAt: seriesData.createdAt instanceof Timestamp ? seriesData.createdAt.toDate().toISOString() : new Date().toISOString()
    } as Series;


    const lecturesCol = collection(serverFirestore, 'lectures');
    const lecturesQuery = query(lecturesCol, where('seriesId', '==', seriesId), orderBy('createdAt', 'asc'));
    const lecturesSnapshot = await getDocs(lecturesQuery);
    
    const lecturesInSeries = lecturesSnapshot.docs.map(doc => {
      const lectureData = doc.data();
      return { 
        ...lectureData, 
        id: doc.id,
        createdAt: lectureData.createdAt instanceof Timestamp ? lectureData.createdAt : Timestamp.now()
      } as Lecture
    });

    return { series, lecturesInSeries };
}


export async function generateMetadata({ params }: SeriesDetailPageProps) {
  const data = await getSeriesData(params.slug);
  if (!data?.series) {
    return { title: 'السلسلة غير موجودة' };
  }
  return { title: data.series.title };
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const data = await getSeriesData(params.slug);

  if (!data) {
    notFound();
  }

  const { series, lecturesInSeries } = data;
  const placeholder = getPlaceholderImage(series.imageId);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
      <Card className="flex flex-col md:flex-row gap-8 items-center p-8 border-none shadow-none bg-transparent">
        <Image
          src={placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/300/300`}
          alt={series.title}
          width={300}
          height={300}
          className="w-full md:w-1/4 h-auto rounded-lg object-cover shadow-2xl"
          data-ai-hint={placeholder?.imageHint || 'islamic art'}
        />
        <div className="md:w-3/4">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 font-headline">{series.title}</h1>
          <p className="text-lg mb-4 text-muted-foreground">{series.description}</p>
          <Badge variant="secondary" className="text-base">{series.lectureCount} محاضرة</Badge>
        </div>
      </Card>

      <section>
        <h2 className="text-3xl font-bold mb-6 font-headline">محاضرات السلسلة</h2>
        <div className="space-y-4">
          {lecturesInSeries.map((lecture, index) => (
            <LectureListItem key={lecture.id} lecture={lecture} index={index + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
