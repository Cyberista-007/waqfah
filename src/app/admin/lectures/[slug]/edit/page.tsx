

import { LectureForm } from '@/components/admin/lecture-form';
import type { Series, Lecture } from '@/lib/types';
import { initializeFirebaseOnServer } from '@/firebase/server-init';
import { collection, getDocs, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';

async function getPageData(lectureId: string) {
  const { serverFirestore } = initializeFirebaseOnServer();
  const seriesCol = collection(serverFirestore, 'series');
  const seriesQuery = query(seriesCol, orderBy('title'));
  
  const lectureDocRef = doc(serverFirestore, 'lectures', lectureId);

  try {
    const [seriesSnapshot, lectureSnap] = await Promise.all([
      getDocs(seriesQuery),
      getDoc(lectureDocRef)
    ]);
    
    if (!lectureSnap.exists()) {
      return null;
    }

    const series = seriesSnapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
    const lectureData = lectureSnap.data();
    // Ensure createdAt is a plain object for serialization
    const lecture = { 
      ...lectureData, 
      id: lectureSnap.id,
      createdAt: lectureData.createdAt.toDate().toISOString(),
     };

    return { series, lecture };
  } catch (error) {
    console.error("Failed to fetch page data:", error);
    return null;
  }
}


export default async function AdminEditLecturePage({ params }: { params: { slug: string } }) {
  // The 'slug' param from the URL is actually the document ID
  const data = await getPageData(params.slug);

  if (!data) {
    notFound();
  }

  const { series, lecture } = data;

  return (
    <LectureForm seriesList={series} lecture={lecture} />
  );
}
