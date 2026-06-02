'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import type { Lecture, ListenHistoryItem } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { LectureCard } from './lecture-card';
import { History, Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';

interface ContinueWatchingProps {
    isProfilePage?: boolean;
}

export function ContinueWatching({ isProfilePage = false }: ContinueWatchingProps) {
  const { user } = useUser();
  const [inProgress, setInProgress] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory, isLoading: historyLoading } = useCollection<ListenHistoryItem>(
      listenHistoryPath, 
      { orderBy: ['lastListened', 'desc'], limit: 12 }
  );
  
  const lectureIds = useMemo(() => {
    if (!listenHistory || listenHistory.length === 0) return [];
    return listenHistory.map(item => item.lectureId).filter(Boolean).slice(0, 10);
  }, [listenHistory]);

  const { data: matchedLectures, isLoading: lecturesLoading } = useCollection<Lecture>(
    lectureIds.length > 0 ? 'lectures' : null,
    useMemo(() => ({
      where: ['__name__', 'in', lectureIds]
    }), [lectureIds])
  );

  useEffect(() => {
    if (historyLoading || lecturesLoading) return;
    if (!listenHistory) {
      setIsLoading(false);
      return;
    }
    
    const lecturesList = matchedLectures || [];
    const inProgressLectures = listenHistory
      .map(item => {
        const lecture = lecturesList.find(l => l.id === item.lectureId);
        // Check if lecture exists and is not completed
        if (lecture && item.duration > 0 && (item.duration - item.position) > 10) {
          return lecture;
        }
        return null;
      })
      .filter((l): l is Lecture => !!l);
      
    setInProgress(inProgressLectures.slice(0, isProfilePage ? 10 : 3));
    setIsLoading(false);

  }, [listenHistory, matchedLectures, historyLoading, lecturesLoading, isProfilePage, lectureIds.length]);

  if (isLoading) {
    return (
        <section>
            <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-2"><History /> أكمل المشاهدة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
              ))}
            </div>
        </section>
    )
  }
  
  if (inProgress.length === 0) {
      if (isProfilePage) {
          return (
             <Card className="text-center py-16">
                <CardContent className="flex flex-col items-center gap-4">
                    <History className="w-16 h-16 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">لم تبدأ بمشاهدة أي محاضرات بعد.</p>
                    <Button asChild><Link href="/lectures">ابدأ المشاهدة الآن</Link></Button>
                </CardContent>
            </Card>
          )
      }
      return null;
  }

  return (
    <section>
        <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-2"><History /> أكمل المشاهدة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgress.map(lecture => (
                <LectureCard key={lecture.id} lecture={lecture} />
            ))}
        </div>
    </section>
  );
}
