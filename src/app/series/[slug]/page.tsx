'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import LectureListItem from '@/components/lecture-list-item';
import type { Series, Lecture } from '@/lib/types';
import { doc, getDoc, collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { SeriesPageSkeleton } from '@/components/skeletons';
import { toSerializable } from '@/lib/data-helpers';
import { useEffect, useState, useMemo } from 'react';
import { Play } from 'lucide-react';
import { YoutubePlayerModal } from '@/components/youtube-player-modal';

function getYoutubeVideoId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const videoUrl = new URL(url);
    if (videoUrl.hostname === 'youtu.be') {
      return videoUrl.pathname.slice(1);
    }
    if (videoUrl.hostname.includes('youtube.com')) {
      const videoId = videoUrl.searchParams.get('v');
      if (videoId) {
        return videoId;
      }
    }
  } catch (error) {
    console.error("Invalid YouTube URL", error);
    return null;
  }
  return null;
}

export default function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const firestore = useFirestore();
  const [series, setSeries] = useState<Series | null>(null);
  const [lecturesInSeries, setLecturesInSeries] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const seriesId = params.slug;

  useEffect(() => {
    const getSeriesData = async () => {
      if (!firestore || !seriesId) return;

      try {
        const seriesDocRef = doc(firestore, 'series', seriesId);
        const seriesSnap = await getDoc(seriesDocRef);

        if (!seriesSnap.exists()) {
          setSeries(null);
          return;
        }
        
        const seriesData = seriesSnap.data();
        const serializableSeries = toSerializable({ ...seriesData, id: seriesSnap.id }) as Series;
        setSeries(serializableSeries);
        
        const lecturesCol = collection(firestore, 'lectures');
        const lecturesQuery = query(lecturesCol, where('seriesId', '==', seriesId), orderBy('createdAt', 'asc'));
        const lecturesSnapshot = await getDocs(lecturesQuery);
        
        const lecturesData = lecturesSnapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
        setLecturesInSeries(lecturesData);

      } catch (error) {
        console.error("Error fetching series data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getSeriesData();
  }, [firestore, seriesId]);

  if (isLoading) {
    return <SeriesPageSkeleton />;
  }

  if (!series) {
    notFound();
  }

  const placeholder = getPlaceholderImage(series.imageId);
  const mainVideoLecture = lecturesInSeries.find(l => l.youtubeUrl);
  const mainVideoId = getYoutubeVideoId(mainVideoLecture?.youtubeUrl);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
        <Card className="flex flex-col md:flex-row gap-8 items-center p-8 border-none shadow-none bg-transparent">
          <div 
            className="relative w-full md:w-1/4 group cursor-pointer"
            onClick={() => mainVideoId && setIsModalOpen(true)}
          >
            <Image
              src={placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/300/300`}
              alt={series.title}
              width={300}
              height={300}
              className="w-full h-auto rounded-lg object-cover shadow-2xl transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={placeholder?.imageHint || 'islamic art'}
            />
             {mainVideoId && (
              <>
                <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                  <Play className="w-8 h-8 fill-current ms-1" />
                </div>
              </>
            )}
          </div>
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
      {mainVideoId && (
        <YoutubePlayerModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoId={mainVideoId}
        />
      )}
    </>
  );
}
