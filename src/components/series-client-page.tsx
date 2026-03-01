
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase';
import type { Series, Lecture, Program, ListenHistoryItem } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/images';
import { Play, Search, Share2, Clock, ListVideo } from 'lucide-react';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LectureListItem } from '@/components/lecture-list-item';
import { formatTotalDuration, getVideoIdFromUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getInitials } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface SeriesClientPageProps {
  series: Series;
  lecturesInSeries: Lecture[];
  seriesCreator: Program | null;
}

export function SeriesClientPage({ series, lecturesInSeries, seriesCreator }: SeriesClientPageProps) {
  const { playTrack, playIframe } = useAudioPlayer();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory } = useCollection<ListenHistoryItem>(
      listenHistoryPath, 
      { where: ['seriesId', '==', series.id] }
  );

  const filteredLectures = useMemo(() => {
    if (!searchTerm) {
        return lecturesInSeries;
    }
    return lecturesInSeries.filter(lecture => lecture.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [lecturesInSeries, searchTerm]);
  
  const seriesProgress = useMemo(() => {
    if (!listenHistory || !lecturesInSeries || lecturesInSeries.length === 0) return 0;
    const completedLecturesCount = listenHistory.filter(item => {
        const lecture = lecturesInSeries.find(l => l.id === item.lectureId);
        return lecture && item.duration > 0 && (item.position / item.duration > 0.95);
    }).length;
    return (completedLecturesCount / lecturesInSeries.length) * 100;
  }, [listenHistory, lecturesInSeries]);

  const totalDuration = useMemo(() => {
      return lecturesInSeries.reduce((acc, lecture) => acc + (lecture.duration || 0), 0);
  }, [lecturesInSeries]);
  
  const handleShare = async () => {
    const shareData = {
        title: `سلسلة: ${series.title}`,
        text: `شاهد سلسلة "${series.title}" على منصة وقفة`,
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
  
  const handlePlayAll = () => {
    const firstLecture = lecturesInSeries[0];
    if (firstLecture) {
        const videoId = getVideoIdFromUrl(firstLecture.youtubeUrl);
        if (videoId) {
            playIframe({ type: 'youtube', src: videoId, title: firstLecture.title, lectureId: firstLecture.id, seriesId: series.id });
        } else {
            playTrack({
                audioSrc: firstLecture.audioSrc,
                title: firstLecture.title,
                id: firstLecture.id,
                seriesId: series.id,
                seriesSlug: series.slug,
                seriesTitle: series.title,
                imageId: firstLecture.imageId,
                slug: firstLecture.slug,
                programName: firstLecture.programName,
            });
        }
    } else {
        toast({ variant: 'destructive', title: 'لا توجد محاضرات في هذه السلسلة.' });
    }
  };

  const { imageUrl, imageHint } = useMemo(() => {
    if (lecturesInSeries && lecturesInSeries.length > 0) {
        const lectureWithImage = lecturesInSeries.find(l => l.youtubeUrl || l.imageId);
        if (lectureWithImage) {
            const videoId = getVideoIdFromUrl(lectureWithImage.youtubeUrl);
            if (videoId) {
                return {
                    imageUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    imageHint: 'youtube thumbnail'
                };
            }
            const placeholder = getPlaceholderImage(lectureWithImage.imageId);
            if (placeholder) {
                return { imageUrl: placeholder.imageUrl, imageHint: placeholder.imageHint };
            }
        }
    }
    const seriesPlaceholder = getPlaceholderImage(series.imageId);
    return { 
        imageUrl: seriesPlaceholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/600/600`,
        imageHint: seriesPlaceholder?.imageHint || 'islamic art'
    };
  }, [lecturesInSeries, series.imageId, series.slug]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start mt-8">
        {/* Left Column (Sticky) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Card className="overflow-hidden shadow-lg">
                <div className="relative aspect-square">
                    <Image
                        src={imageUrl}
                        alt={series.title}
                        fill
                        className="object-cover image-theme-filter"
                        priority
                        data-ai-hint={imageHint}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <CardContent className="p-6 bg-card/80 backdrop-blur-sm space-y-4">
                    <h1 className="text-3xl font-extrabold font-headline">{series.title}</h1>
                    {seriesCreator && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={seriesCreator.imageUrl} alt={seriesCreator.name} />
                                <AvatarFallback>{getInitials(seriesCreator.name)}</AvatarFallback>
                            </Avatar>
                            <Link href={`/programs/${seriesCreator.slug}`} className="hover:underline text-foreground/90 font-semibold">{seriesCreator.name}</Link>
                        </div>
                    )}
                    <p className="text-muted-foreground line-clamp-4">{series.description}</p>
                    
                    <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
                        <div className="flex items-center gap-1.5"><ListVideo className="h-4 w-4" /> <span>{lecturesInSeries.length} محاضرة</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> <span>{formatTotalDuration(totalDuration)}</span></div>
                    </div>

                    {user && (
                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between items-center text-sm">
                                <p className="text-muted-foreground">تقدمك</p>
                                <p className="font-bold">{Math.round(seriesProgress)}%</p>
                            </div>
                            <Progress value={seriesProgress} />
                        </div>
                    )}
                    <div className="flex gap-2 pt-2">
                         <Button onClick={handlePlayAll} size="lg" className="w-full">
                            <Play className="w-5 h-5 me-2" />
                            بدء السلسلة
                         </Button>
                         <Button onClick={handleShare} size="lg" variant="outline" className="shrink-0">
                            <Share2 className="w-5 h-5" />
                         </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <Input 
                placeholder="ابحث في محاضرات السلسلة..."
                className="pe-10 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground"/>
            </div>
            <div className="space-y-4">
            {filteredLectures.length > 0 ? (
              filteredLectures.map((lecture, index) => (
                <LectureListItem key={lecture.id} lecture={lecture} index={index + 1} />
              ))
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <p className="text-lg text-muted-foreground">
                        {searchTerm ? "لا توجد محاضرات تطابق بحثك." : "لا توجد محاضرات في هذه السلسلة بعد."}
                    </p>
                </div>
            )}
            </div>
        </div>
    </div>
  );
}
