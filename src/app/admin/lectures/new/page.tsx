
import { LectureForm } from "@/components/admin/lecture-form";
import { initializeFirebaseOnServer } from "@/firebase/server-init";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import type { Series } from "@/lib/types";

async function getSeries() {
    const { serverFirestore } = initializeFirebaseOnServer();
    const seriesCol = collection(serverFirestore, 'series');
    const q = query(seriesCol, orderBy('title'));
    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
    } catch (error) {
        console.error("Failed to fetch series:", error);
        return [];
    }
}

export default async function AdminNewLecturePage() {
  const series = await getSeries();
  
  return (
    <LectureForm seriesList={series} />
  );
}
