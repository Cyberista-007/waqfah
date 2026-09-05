import { MetadataRoute } from 'next';

export const dynamic = 'force-static';
import { getAllLectures, getAllSeries, getAllPrograms, getAllTopics, getAllCurriculums } from '@/lib/data';

// Helper function to convert Firestore Timestamp-like objects to Date
const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  // Firestore admin SDK returns a Timestamp object with toDate() method
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  // If it's already a Date object or string
  return new Date(timestamp);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  // Fetch all dynamic content
  const lectures = await getAllLectures();
  const series = await getAllSeries();
  const programs = await getAllPrograms();
  const topics = await getAllTopics();
  const curriculums = await getAllCurriculums();

  const lectureEntries: MetadataRoute.Sitemap = lectures.map(({ slug, createdAt }) => ({
    url: `${siteUrl}/lectures/${slug}`,
    lastModified: toDate(createdAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const seriesEntries: MetadataRoute.Sitemap = series.map(({ slug, createdAt }) => ({
    url: `${siteUrl}/series/${slug}`,
    lastModified: toDate(createdAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const programEntries: MetadataRoute.Sitemap = programs.map(({ slug, createdAt }) => ({
    url: `${siteUrl}/programs/${slug}`,
    lastModified: toDate(createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  
  const topicEntries: MetadataRoute.Sitemap = topics.map(({ slug }) => ({
    url: `${siteUrl}/topics/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const curriculumEntries: MetadataRoute.Sitemap = curriculums.map(({ slug, createdAt }) => ({
    url: `${siteUrl}/curriculums/${slug}`,
    lastModified: toDate(createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const staticPages = [
    '/',
    '/podcasts',
    '/quran',
    '/hadith',
    '/prayer',
    '/adhkar',
    '/dua',
    '/lectures',
    '/series',
    '/programs',
    '/topics',
    '/books',
    '/chastity',
    '/radio',
    '/curriculums',
    '/pathways',
    '/sciences-tree',
    '/aqeedah',
    '/seerah',
    '/adab',
    '/stories',
    '/shubuhat',
    '/muhlikat',
    '/mirath',
    '/memorize',
    '/bayan',
    '/athar',
    '/essentials',
    '/kanaf',
    '/namaa',
    '/palestine',
    '/accountability',
    '/leaderboard',
    '/badges',
    '/playlists',
    '/schedule',
    '/qa',
    '/donations',
    '/contact',
  ].map((route) => {
    let priority = 0.7;
    let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly';

    if (route === '/') {
      priority = 1.0;
      changeFrequency = 'daily';
    } else if (['/quran', '/hadith', '/podcasts', '/prayer', '/adhkar', '/lectures'].includes(route)) {
      priority = 0.95;
      changeFrequency = 'daily';
    } else if (['/series', '/programs', '/books', '/chastity', '/radio', '/curriculums', '/pathways'].includes(route)) {
      priority = 0.85;
      changeFrequency = 'weekly';
    } else if (['/aqeedah', '/seerah', '/sciences-tree', '/dua', '/muhlikat', '/mirath'].includes(route)) {
      priority = 0.8;
      changeFrequency = 'weekly';
    }

    return {
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    };
  });

  return [
    ...staticPages,
    ...lectureEntries,
    ...seriesEntries,
    ...programEntries,
    ...topicEntries,
    ...curriculumEntries,
  ];
}
