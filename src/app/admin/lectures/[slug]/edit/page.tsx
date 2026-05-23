import EditLectureClient from './EditLectureClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ slug: 'default' }];
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <EditLectureClient params={params} />;
}
