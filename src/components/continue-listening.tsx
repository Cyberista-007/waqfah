
'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import type { Lecture, ListenHistoryItem } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { LectureCard } from './lecture-card';
import { History, Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';

interface ContinueListeningProps {
    isProfilePage?: boolean;
}

export function ContinueListening({ isProfilePage = false }: ContinueListeningProps) {
  const { user } = useUser();
  const [inProgress, setInProgress] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory, isLoading: historyLoading } = useCollection<ListenHistoryItem>(
      listenHistoryPath, 
      { orderBy: ['lastListened', 'desc'], limit: 12 }
  );
  
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');

  useEffect(() => {
    if (historyLoading || lecturesLoading || !listenHistory || !allLectures) {
      if (!historyLoading && !lecturesLoading) {
        setIsLoading(false);
      }
      return;
    }
    
    const inProgressLectures = listenHistory
      .map(item => {
        const lecture = allLectures.find(l => l.id === item.lectureId);
        // Check if lecture exists and is not completed
        if (lecture && item.duration > 0 && (item.duration - item.position) > 10) {
          return lecture;
        }
        return null;
      })
      .filter((l): l is Lecture => !!l);
      
    setInProgress(inProgressLectures.slice(0, isProfilePage ? 12 : 4)); // Show more on profile page
    setIsLoading(false);

  }, [listenHistory, allLectures, historyLoading, lecturesLoading, isProfilePage]);

  if (isLoading) {
    return (
        <section>
            <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-2"><History /> أكمل الاستماع</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-48 w-full" />
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
                    <p className="text-lg text-muted-foreground">لم تبدأ أي محاضرات بعد.</p>
                    <Button asChild><Link href="/lectures">ابدأ الاستماع الآن</Link></Button>
                </CardContent>
            </Card>
          )
      }
      return null;
  }

  return (
    <section>
        <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-2"><History /> أكمل الاستماع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inProgress.map(lecture => (
                <LectureCard key={lecture.id} lecture={lecture} />
            ))}
        </div>
    </section>
  );
}
