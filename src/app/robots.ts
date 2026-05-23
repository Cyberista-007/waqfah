import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'; 

  return {
    rules: [
        {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/profile/', '/settings/', '/auth/login'],
        }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
