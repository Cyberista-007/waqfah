'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection } from '@/firebase';
import type { Lecture } from '@/lib/types';
import { LectureClientPage } from '@/components/lecture-client-page';
import { LecturePageSkeleton } from '@/components/skeletons';
import { useMemo } from 'react';


function LecturePageContent({ lecture }: { lecture: Lecture }) {
  const seriesId = lecture?.seriesId;

  const { data: allRelatedLectures } = useCollection<Lecture>(
      seriesId ? 'lectures' : null,
      { where: ['seriesId', '==', seriesId], limit: 4 }
  );

  const relatedLectures = useMemo(() => {
      if (!allRelatedLectures) return [];
      return allRelatedLectures
          .filter(l => l.id !== lecture.id)
          .slice(0, 3);
  }, [allRelatedLectures, lecture]);
  
  return <LectureClientPage lecture={lecture} relatedLectures={relatedLectures} />;
}


export default function LectureDetailPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  const { data: lectures, isLoading: lectureLoading } = useCollection<Lecture>(
      'lectures', 
      { where: ['slug', '==', slug], limit: 1 }
  );
  
  if (lectureLoading) {
    return <LecturePageSkeleton />;
  }

  const lecture = lectures?.[0];

  if (!lecture) {
    notFound();
    return null;
  }
  
  return <LecturePageContent lecture={lecture} />;
}
