
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import type { Lecture, ListenHistoryItem } from '@/lib/types';
import { recommendLectures } from '@/ai/flows/recommend-lectures';
import { Skeleton } from './ui/skeleton';
import { LectureCard } from './lecture-card';
import { BrainCircuit } from 'lucide-react';

export function RecommendedLectures() {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory, isLoading: historyLoading } = useCollection<ListenHistoryItem>(
      listenHistoryPath, 
      { orderBy: ['lastListened', 'desc'], limit: 10 }
  );
  
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');


  useEffect(() => {
    const getRecommendations = async () => {
      if (historyLoading || lecturesLoading || !listenHistory || !allLectures) {
        if (!historyLoading && !lecturesLoading) {
            setIsLoading(false);
        }
        return;
      }
      
      if (listenHistory.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const listenedLectureTitles = listenHistory.map(item => {
             const lecture = allLectures.find(l => l.id === item.lectureId);
             return lecture?.title || '';
        }).filter(Boolean);
        
        const allLectureTitles = allLectures.map(l => l.title);

        const result = await recommendLectures({
          viewingHistory: listenedLectureTitles,
          allLectures: allLectureTitles,
          numberOfRecommendations: 4,
        });

        const recommended = result.recommendedLectures
            .map(title => allLectures.find(lecture => lecture.title === title))
            .filter((l): l is Lecture => !!l);
            
        setRecommendations(recommended);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]); // Clear recommendations on error
      } finally {
        setIsLoading(false);
      }
    };

    getRecommendations();
  }, [listenHistory, allLectures, historyLoading, lecturesLoading]);

  if (isLoading) {
    return (
        <section>
            <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-2"><BrainCircuit /> نرشح لك</h2>
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
  
  if (recommendations.length === 0) {
      return null; // Don't show the section if there are no recommendations
  }

  return (
    <section>
        <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-2"><BrainCircuit /> نرشح لك</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map(lecture => (
                <LectureCard key={lecture.id} lecture={lecture} />
            ))}
        </div>
    </section>
  );
}
