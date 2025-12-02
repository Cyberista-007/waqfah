
import { notFound } from 'next/navigation';
import { getLectureBySlug } from '@/lib/data';
import { LectureClientPage } from '@/components/lecture-client-page';
import type { Sheikh } from '@/lib/types';

// This is now a Server Component
export default async function LectureDetailPage({ params }: { params: { slug: string } }) {
  
  const lecture = await getLectureBySlug(params.slug);

  if (!lecture) {
    notFound();
  }

  // Fetch related lectures on the server as well
  const [relatedLectures] = await Promise.all([
      getRelatedLectures(lecture.id, lecture.seriesId),
  ]);

  // Pass server-fetched data to the Client Component
  return (
    <LectureClientPage lecture={lecture} relatedLectures={relatedLectures} sheikh={null} />
  );
}
