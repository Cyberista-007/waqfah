

import { initializeFirebaseOnServer } from '@/firebase/server-init';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Sheikh } from '@/lib/types';
import { SeriesForm } from '@/components/admin/series-form';

async function getPageData() {
    const { serverFirestore } = initializeFirebaseOnServer();
    const sheikhsCol = collection(serverFirestore, 'sheikhs');
    const sheikhsQuery = query(sheikhsCol, orderBy('name'));

    try {
        const sheikhsSnapshot = await getDocs(sheikhsQuery);
        const sheikhs = sheikhsSnapshot.docs.map(doc => ({ ...(doc.data() as Omit<Sheikh, 'id'>), id: doc.id }));
        return { sheikhs };
    } catch (error) {
        console.error("Failed to fetch page data:", error);
        return { sheikhs: [] };
    }
}

export default async function AdminNewSeriesPage() {
  const { sheikhs } = await getPageData();
  
  return (
    <SeriesForm sheikhs={sheikhs} />
  );
}
