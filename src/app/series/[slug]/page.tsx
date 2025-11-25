
import { notFound } from 'next/navigation';
import { getSeriesPageData } from '@/lib/data';
import { SeriesClientPage } from '@/components/series-client-page';

export default async function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const data = await getSeriesPageData(params.slug);

  if (!data) {
    notFound();
  }

  const { series, lecturesInSeries, seriesCreator } = data;

  return (
    <SeriesClientPage
      series={series}
      lecturesInSeries={lecturesInSeries}
      seriesCreator={seriesCreator}
    />
  );
}
