
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import type { Series, Lecture, Program, ListenHistoryItem } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/images';
import { Play, Search, Share2 } from 'lucide-react';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LectureListItem } from '@/components/lecture-list-item';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { getVideoIdFromUrl } from '@/lib/utils';


interface SeriesClientPageProps {
  series: Series;
  lecturesInSeries: Lecture[];
  seriesCreator: Program | null;
}

export function SeriesClientPage({ series, lecturesInSeries, seriesCreator }: SeriesClientPageProps) {
  const { playIframe } = useAudioPlayer();
  const { user } = useUser();
  const { toast } = useToast();
  const [filteredLectures, setFilteredLectures] = useState<Lecture[]>(lecturesInSeries);

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory } = useCollection<ListenHistoryItem>(
      listenHistoryPath, 
      { where: ['seriesId', '==', series.id] }
  );

  useEffect(() => {
    setFilteredLectures(lecturesInSeries);
  }, [lecturesInSeries]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = lecturesInSeries.filter(lecture => lecture.title.toLowerCase().includes(searchTerm));
    setFilteredLectures(filtered);
  }
  
  const seriesProgress = () => {
    if (!listenHistory || series.lectureCount === 0) return 0;
    const completedLectures = listenHistory.filter(item => item.duration > 0 && item.position / item.duration > 0.95);
    return (completedLectures.length / series.lectureCount) * 100;
  }
  
  const handleShare = async () => {
    const shareData = {
        title: `سلسلة: ${series.title}`,
        text: `شاهد سلسلة "${series.title}" على موقع وقفة`,
        url: window.location.href,
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
             await navigator.clipboard.writeText(window.location.href);
             toast({ title: 'تم نسخ الرابط!' });
        }
    } catch (error) {
        console.error('Error sharing:', error);
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'تم نسخ الرابط!' });
    }
  };

  const placeholder = getPlaceholderImage(series.imageId);
  const featuredLecture = lecturesInSeries[0] || null;
  const mainVideoId = getVideoIdFromUrl(featuredLecture?.youtubeUrl);

  const handlePlayVideo = () => {
    if (mainVideoId) {
      playIframe({ type: 'youtube', src: mainVideoId, title: featuredLecture?.title || series.title });
    }
  }

  return (
    <>
      <div className="space-y-8 -mt-8 -mx-4 md:-mx-8">
        <div className="relative w-full h-[60vh] min-h-[500px] md:h-[70vh] text-white">
          <Image
            src={placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/1200/800`}
            alt={series.title}
            fill
            className="object-cover image-theme-filter"
            priority
            data-ai-hint={placeholder?.imageHint || 'islamic art'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div 
            className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-300", mainVideoId ? "cursor-pointer group" : "cursor-default")}
            onClick={handlePlayVideo}
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
                <Button onClick={handleShare} variant="secondary" size="lg" className="w-full md:w-auto">
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
    </>
  );
}
