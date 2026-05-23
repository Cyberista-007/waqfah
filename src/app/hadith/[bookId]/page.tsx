import HadithPageClient from './HadithPageClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ bookId: 'bukhari' }];
}

export default function Page({ params }: { params: Promise<{ bookId: string }> }) {
  return <HadithPageClient params={params} />;
}
