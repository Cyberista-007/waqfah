import { HomePageClient } from '@/components/home-page-client';
import {
  getHomepageConfig,
  getLatestLectures,
  getLatestSeries,
  getLecturesByIds,
  getTopPrograms,
} from '@/lib/data';

export const revalidate = 120;

export default async function Home() {
  const [latestLectures, topPrograms, latestSeries, homepageConfig] = await Promise.all([
    getLatestLectures(),
    getTopPrograms(),
    getLatestSeries(),
    getHomepageConfig(),
  ]);

  const stripIds = Array.from(
    new Set(
      (homepageConfig?.featuredStrips ?? []).flatMap((strip) => strip.lectureIds ?? [])
    )
  ).slice(0, 30);

  const stripLectures = stripIds.length > 0 ? await getLecturesByIds(stripIds) : [];

  return (
    <HomePageClient
      latestLectures={latestLectures}
      topPrograms={topPrograms}
      latestSeries={latestSeries}
      upcomingLesson={null}
      latestQAPair={null}
      publicPlaylists={[]}
      homepageConfig={homepageConfig}
      stripLectures={stripLectures}
    />
  );
}
