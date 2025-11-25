
import { notFound } from 'next/navigation';
import { getLectureBySlug, getRelatedLectures, getSheikhById } from '@/lib/data';
import { LectureClientPage } from '@/components/lecture-client-page';
import type { Sheikh } from '@/lib/types';

// This is now a Server Component
export default async function LectureDetailPage({ params }: { params: { slug: string } }) {
  
  const lecture = await getLectureBySlug(params.slug);

  if (!lecture) {
    notFound();
  }

  // Fetch related lectures on the server as well
  const [relatedLectures, sheikh] = await Promise.all([
      getRelatedLectures(lecture.id, lecture.seriesId),
      lecture.sheikhId ? getSheikhById(lecture.sheikhId) : Promise.resolve(null)
  ]);

  // Pass server-fetched data to the Client Component
  return (
    <LectureClientPage lecture={lecture} relatedLectures={relatedLectures} sheikh={sheikh as Sheikh | null} />
  );
}
