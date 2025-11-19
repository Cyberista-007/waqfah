
import { LectureForm } from '@/components/admin/lecture-form';
import type { Series, Lecture, Sheikh } from '@/lib/types';
import { initializeFirebaseOnServer } from '@/firebase/server-init';
import { collection, getDocs, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';

async function getPageData(lectureId: string) {
  const { serverFirestore } = initializeFirebaseOnServer();
  const seriesCol = collection(serverFirestore, 'series');
  const seriesQuery = query(seriesCol, orderBy('title'));
  
  const sheikhsCol = collection(serverFirestore, 'sheikhs');
  const sheikhsQuery = query(sheikhsCol, orderBy('name'));

  const lectureDocRef = doc(serverFirestore, 'lectures', lectureId);

  try {
    const [seriesSnapshot, sheikhsSnapshot, lectureSnap] = await Promise.all([
      getDocs(seriesQuery),
      getDocs(sheikhsQuery),
      getDoc(lectureDocRef)
    ]);
    
    if (!lectureSnap.exists()) {
      return null;
    }

    const series = seriesSnapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
    const sheikhs = sheikhsSnapshot.docs.map(doc => ({ ...(doc.data() as Omit<Sheikh, 'id'>), id: doc.id }));
    const lectureData = lectureSnap.data();
    // Ensure createdAt is a plain object for serialization
    const lecture = { 
      ...lectureData, 
      id: lectureSnap.id,
      createdAt: lectureData.createdAt.toDate().toISOString(),
     };

    return { series, sheikhs, lecture };
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

  const { series, sheikhs, lecture } = data;

  return (
    <LectureForm seriesList={series} sheikhsList={sheikhs} lecture={lecture} />
  );
}
