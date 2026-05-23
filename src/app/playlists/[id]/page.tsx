import PlaylistPageClient from './PlaylistPageClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function Page() {
  return <PlaylistPageClient />;
}
