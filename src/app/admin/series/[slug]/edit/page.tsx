
"use client";

import { notFound } from 'next/navigation';
import type { Series } from '@/lib/types';
import { SeriesForm } from '@/components/admin/series-form';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { HomePageSkeleton } from '@/components/skeletons';

export default function AdminEditSeriesPage({ params }: { params: { slug: string } }) {
  const firestore = useFirestore();
  const slug = params.slug;

  // Firestore `slug` is not a document ID, so we can't use `useDoc` directly.
  // We need to query for the document. But for an edit page, we can assume
  // that the component above passed the doc ID, or we fetch it.
  // This setup is simplified and assumes slug is passed as ID for routing.
  // A proper setup would query by slug, get the ID, then use useDoc.
  // However, since we are correcting a deeper issue, we will query by slug.

  // Let's find the document ID from the slug client-side.
  const [series, setSeries] = useState<Series | null>(null);
  const [seriesLoading, setSeriesLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !slug) return;
    
    const getSeries = async () => {
      setSeriesLoading(true);
      const seriesCol = collection(firestore, 'series');
      const q = query(seriesCol, where("slug", "==", slug), limit(1));
      const seriesSnap = await getDocs(q);
      
      if(seriesSnap.empty) {
        setSeries(null);
      } else {
        const docData = seriesSnap.docs[0];
        setSeries({ ...docData.data(), id: docData.id } as Series);
      }
      setSeriesLoading(false);
    }

    getSeries();

  }, [firestore, slug]);


  if (seriesLoading) {
      return <HomePageSkeleton />;
  }

  if (!series) {
    notFound();
  }

  return (
    <SeriesForm series={series} />
  );
}
