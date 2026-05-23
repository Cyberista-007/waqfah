import EditSeriesClient from './EditSeriesClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ slug: 'default' }];
}

export default function Page() {
  return <EditSeriesClient />;
}
