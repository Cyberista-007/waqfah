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

  // 1. Fetch the current lecture by slug
  const { data: lectures, isLoading: lectureLoading } = useCollection<Lecture>(
      'lectures', 
      { where: ['slug', '==', slug], limit: 1 }
  );
  const lecture = lectures?.[0];
  const seriesId = lecture?.seriesId;

  // 2. Fetch related lectures from the same series
  const { data: allRelatedLectures, isLoading: relatedLoading } = useCollection<Lecture>(
      seriesId ? 'lectures' : null,
      { where: ['seriesId', '==', seriesId], limit: 4 } // Fetch a few more to ensure we have 3 others
  );

  // 3. Filter out the current lecture from related list and take 3
  const relatedLectures = useMemo(() => {
      if (!allRelatedLectures || !lecture) return [];
      return allRelatedLectures
          .filter(l => l.id !== lecture.id)
          .slice(0, 3);
  }, [allRelatedLectures, lecture]);
  
  const isLoading = lectureLoading || (seriesId && relatedLoading);
  
  if (isLoading) {
    return <LecturePageSkeleton />;
  }

  if (!lecture) {
    notFound();
    return null;
  }
  
  return <LectureClientPage lecture={lecture} relatedLectures={relatedLectures} />;
}
