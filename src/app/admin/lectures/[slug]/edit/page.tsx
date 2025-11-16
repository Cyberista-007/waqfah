

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LectureForm } from '@/components/admin/lecture-form';
import type { Series } from '@/lib/types';
import { initializeFirebaseOnServer } from '@/firebase/server-init';
import { collection, getDocs, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';

async function getPageData(lectureId: string) {
  const { serverFirestore } = initializeFirebaseOnServer();
  const seriesCol = collection(serverFirestore, 'series');
  const seriesQuery = query(seriesCol, orderBy('title'));
  
  const lectureDocRef = doc(serverFirestore, 'lectures', lectureId);

  const [seriesSnapshot, lectureSnap] = await Promise.all([
    getDocs(seriesQuery),
    getDoc(lectureDocRef)
  ]);
  
  if (!lectureSnap.exists()) {
    return null;
  }

  const series = seriesSnapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
  const lecture = { ...lectureSnap.data(), id: lectureSnap.id };

  return { series, lecture };
}


export default async function AdminEditLecturePage({ params }: { params: { slug: string } }) {
  const data = await getPageData(params.slug);

  if (!data) {
    notFound();
  }

  const { series, lecture } = data;

  return (
    <LectureForm seriesList={series} lecture={lecture} />
  );
}
