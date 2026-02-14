import { MetadataRoute } from 'next';
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
    '/lectures',
    '/series',
    '/programs',
    '/topics',
    '/books',
    '/qa',
    '/schedule',
    '/contact',
    '/donations',
    '/curriculums',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as 'weekly',
    priority: route === '/' ? 1.0 : 0.8,
  }));

  return [
    ...staticPages,
    ...lectureEntries,
    ...seriesEntries,
    ...programEntries,
    ...topicEntries,
    ...curriculumEntries,
  ];
}
