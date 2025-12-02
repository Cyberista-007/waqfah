

import { notFound } from 'next/navigation';
import { getLectureBySlug, getRelatedLectures } from '@/lib/data';
import { LectureClientPage } from '@/components/lecture-client-page';

// This is now a Server Component
export default async function LectureDetailPage({ params }: { params: { slug: string } }) {
  
  const lecture = await getLectureBySlug(params.slug);

  if (!lecture) {
    notFound();
  }

  // Fetch related lectures on the server as well
  const relatedLectures = await getRelatedLectures(lecture.id, lecture.seriesId);

  // Pass server-fetched data to the Client Component
  return (
    <LectureClientPage lecture={lecture} relatedLectures={relatedLectures} />
  );
}
