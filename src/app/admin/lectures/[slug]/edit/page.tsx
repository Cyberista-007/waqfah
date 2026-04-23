
"use client";

import { use } from 'react';
import { LectureForm } from '@/components/admin/lecture-form';
import type { Series, Lecture } from '@/lib/types';
import { notFound } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { HomePageSkeleton } from '@/components/skeletons';

export default function AdminEditLecturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const firestore = useFirestore();

  const { data: series, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });

  const lectureDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "lectures", slug) : null),
    [firestore, slug]
  );
  const { data: lecture, isLoading: lectureLoading } = useDoc<Lecture>(lectureDocRef);

  const isLoading = seriesLoading || lectureLoading;

  if (isLoading) {
    return <HomePageSkeleton />;
  }
  
  if (!lecture) {
    notFound();
  }

  return (
    <LectureForm seriesList={series || []} lecture={lecture} />
  );
}
