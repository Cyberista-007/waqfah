
import { LectureForm } from "@/components/admin/lecture-form";
import { initializeFirebaseOnServer } from "@/firebase/server-init";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import type { Series, Sheikh } from "@/lib/types";

async function getPageData() {
    const { serverFirestore } = initializeFirebaseOnServer();
    const seriesCol = collection(serverFirestore, 'series');
    const sheikhsCol = collection(serverFirestore, 'sheikhs');
    
    const seriesQuery = query(seriesCol, orderBy('title'));
    const sheikhsQuery = query(sheikhsCol, orderBy('name'));

    try {
        const [seriesSnapshot, sheikhsSnapshot] = await Promise.all([
            getDocs(seriesQuery),
            getDocs(sheikhsQuery)
        ]);

        const series = seriesSnapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
        const sheikhs = sheikhsSnapshot.docs.map(doc => ({ ...(doc.data() as Omit<Sheikh, 'id'>), id: doc.id }));

        return { series, sheikhs };
    } catch (error) {
        console.error("Failed to fetch page data:", error);
        return { series: [], sheikhs: [] };
    }
}

export default async function AdminNewLecturePage() {
  const { series, sheikhs } = await getPageData();
  
  return (
    <LectureForm seriesList={series} sheikhsList={sheikhs} />
  );
}
