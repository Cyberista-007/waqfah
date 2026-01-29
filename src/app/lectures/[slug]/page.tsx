'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection } from '@/firebase';
import type { Lecture } from '@/lib/types';
import { LectureClientPage } from '@/components/lecture-client-page';
import { LecturePageSkeleton } from '@/components/skeletons';
import { useMemo } from 'react';

export default function LectureDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');

  const { lecture, relatedLectures } = useMemo(() => {
    if (lecturesLoading || !allLectures) {
      return { lecture: null, relatedLectures: [] };
    }

    const currentLecture = allLectures.find(l => l.slug === slug);

    if (!currentLecture) {
        return { lecture: null, relatedLectures: [] };
    }

    const related = currentLecture.seriesId
      ? allLectures
          .filter(l => l.seriesId === currentLecture.seriesId && l.id !== currentLecture.id)
          .slice(0, 3)
      : [];
      
    return { lecture: currentLecture, relatedLectures: related };

  }, [lecturesLoading, allLectures, slug]);
  
  if (lecturesLoading) {
    return <LecturePageSkeleton />;
  }

  if (!lecture) {
    notFound();
    return null;
  }
  
  return <LectureClientPage lecture={lecture} relatedLectures={relatedLectures || []} />;
}
