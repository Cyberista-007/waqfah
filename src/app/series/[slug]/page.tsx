
'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import type { Series, Lecture, ListenHistoryItem, UserProfile } from '@/lib/types';
import { doc, getDoc, collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { SeriesPageSkeleton } from '@/components/skeletons';
import { toSerializable } from '@/lib/data-helpers';
import { useEffect, useState } from 'react';
import { Play, Search, Share2 } from 'lucide-react';
import { YoutubePlayerModal } from '@/components/youtube-player-modal';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LectureListItem } from '@/components/lecture-list-item';
import { cn } from '@/lib/utils';


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
  const { user } = useUser();
  const [series, setSeries] = useState<Series | null>(null);
  const [lecturesInSeries, setLecturesInSeries] = useState<Lecture[]>([]);
  const [filteredLectures, setFilteredLectures] = useState<Lecture[]>([]);
  const [seriesCreator, setSeriesCreator] = useState<UserProfile | null>(null);
  const [listenHistory, setListenHistory] = useState<ListenHistoryItem[]>([]);
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
        
        const sheikhRef = doc(firestore, 'sheikhs', serializableSeries.sheikhId);
        const sheikhSnap = await getDoc(sheikhRef);
        if(sheikhSnap.exists()) {
            setSeriesCreator(toSerializable(sheikhSnap.data()) as UserProfile)
        }

        const lecturesCol = collection(firestore, 'lectures');
        const lecturesQuery = query(lecturesCol, where('seriesId', '==', seriesId), orderBy('createdAt', 'asc'));
        const lecturesSnapshot = await getDocs(lecturesQuery);
        
        const lecturesData = lecturesSnapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
        setLecturesInSeries(lecturesData);
        setFilteredLectures(lecturesData);

      } catch (error) {
        console.error("Error fetching series data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const getListenHistory = async () => {
        if (!user || !firestore) return;
        const historyCol = collection(firestore, 'users', user.uid, 'listenHistory');
        const historyQuery = query(historyCol, where('seriesId', '==', seriesId));
        const historySnapshot = await getDocs(historyQuery);
        const historyData = historySnapshot.docs.map(doc => toSerializable(doc.data()) as ListenHistoryItem);
        setListenHistory(historyData);
    }
    
    getSeriesData();
    if(user) getListenHistory();

  }, [firestore, seriesId, user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = lecturesInSeries.filter(lecture => lecture.title.toLowerCase().includes(searchTerm));
    setFilteredLectures(filtered);
  }
  
  const seriesProgress = () => {
    const completedLectures = listenHistory.filter(item => item.duration > 0 && item.position / item.duration > 0.95);
    if (!series || series.lectureCount === 0) return 0;
    return (completedLectures.length / series.lectureCount) * 100;
  }

  if (isLoading) {
    return <SeriesPageSkeleton />;
  }

  if (!series) {
    notFound();
  }

  const placeholder = getPlaceholderImage(series.imageId);
  const featuredLecture = lecturesInSeries[0] || null;
  const mainVideoId = getYoutubeVideoId(featuredLecture?.youtubeUrl);

  return (
    <>
      <div className="space-y-8 -mt-8 -mx-4 md:-mx-8">
        <div className="relative w-full h-[60vh] min-h-[500px] md:h-[70vh] text-white">
          <Image
            src={placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/1200/800`}
            alt={series.title}
            fill
            className="object-cover"
            priority
            data-ai-hint={placeholder?.imageHint || 'islamic art'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div 
            className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-300", mainVideoId ? "cursor-pointer group" : "cursor-default")}
            onClick={() => mainVideoId && setIsModalOpen(true)}
          >
            {mainVideoId && (
              <div className="h-20 w-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100">
                <Play className="w-10 h-10 fill-current ms-1" />
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <p className="font-headline text-lg text-primary">{series.title}</p>
              <h1 className="text-4xl md:text-6xl font-extrabold my-2 font-headline">{featuredLecture?.title || series.title}</h1>
              {seriesCreator && <p className="text-lg text-white/80">الشيخ: {seriesCreator.name}</p>}
            </div>
          </div>
        </div>
        
        <div className="container transform -translate-y-16">
            <div className="max-w-4xl mx-auto bg-card p-6 rounded-2xl shadow-2xl animate-slide-in">
                <h2 className="text-2xl font-bold mb-4 font-headline">{series.title}</h2>
                {user && (
                    <>
                        <div className="flex justify-between items-center mb-2">
                           <p className="text-sm text-muted-foreground">تقدمك في هذه السلسلة</p>
                           <p className="text-sm font-bold">{Math.round(seriesProgress())}%</p>
                        </div>
                        <Progress value={seriesProgress()} className="mb-4" />
                    </>
                )}
                <Button variant="secondary" size="lg" className="w-full md:w-auto">
                    <Share2 className="w-5 h-5 me-2" />
                    مشاركة السلسلة
                </Button>
            </div>
        </div>

        <section className="container">
          <h2 className="text-3xl font-bold mb-6 font-headline">المحاضرات</h2>
          <div className="relative mb-6">
              <Input 
                placeholder="ابحث في المحاضرات..."
                className="pe-10 h-12 text-lg"
                onChange={handleSearch}
              />
              <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground"/>
          </div>
          <div className="space-y-4">
            {filteredLectures.map((lecture, index) => (
              <LectureListItem key={lecture.id} lecture={lecture} index={index + 1} />
            ))}
             {filteredLectures.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">لا توجد محاضرات تطابق بحثك.</p>
                </div>
            )}
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
