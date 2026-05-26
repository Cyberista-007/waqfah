import EditLectureClient from './EditLectureClient';

export const dynamic = 'force-dynamic';

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <EditLectureClient params={params} />;
}
