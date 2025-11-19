

import { initializeFirebaseOnServer } from '@/firebase/server-init';
import { collection, getDocs, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import type { Series, Sheikh } from '@/lib/types';
import { SeriesForm } from '@/components/admin/series-form';

async function getPageData(seriesId: string) {
  const { serverFirestore } = initializeFirebaseOnServer();
  
  const sheikhsCol = collection(serverFirestore, 'sheikhs');
  const sheikhsQuery = query(sheikhsCol, orderBy('name'));

  const seriesDocRef = doc(serverFirestore, 'series', seriesId);

  try {
    const [sheikhsSnapshot, seriesSnap] = await Promise.all([
      getDocs(sheikhsQuery),
      getDoc(seriesDocRef)
    ]);
    
    if (!seriesSnap.exists()) {
      return null;
    }

    const sheikhs = sheikhsSnapshot.docs.map(doc => ({ ...(doc.data() as Omit<Sheikh, 'id'>), id: doc.id }));
    const seriesData = seriesSnap.data();
    
    // Ensure createdAt is a plain object for serialization
    const createdAt = seriesData.createdAt?.toDate ? seriesData.createdAt.toDate().toISOString() : new Date().toISOString();

    const series = { 
      ...seriesData, 
      id: seriesSnap.id,
      createdAt: createdAt,
     } as Series;

    return { series, sheikhs };
  } catch (error) {
    console.error("Failed to fetch page data:", error);
    return null;
  }
}


export default async function AdminEditSeriesPage({ params }: { params: { slug: string } }) {
  // The 'slug' param from the URL is actually the document ID
  const data = await getPageData(params.slug);

  if (!data) {
    notFound();
  }

  const { series, sheikhs } = data;

  return (
    <SeriesForm series={series} sheikhs={sheikhs} />
  );
}
