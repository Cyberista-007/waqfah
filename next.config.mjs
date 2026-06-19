import withPWAInit from 'next-pwa';
import runtimeCaching from 'next-pwa/cache.js';

const exportStatic = process.env.EXPORT_STATIC === 'true';

const customRuntimeCaching = [
  {
    urlPattern: /^https:\/\/cdn\.islamic\.network\/quran\/audio\/.*$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'quran-audio-cache',
      expiration: {
        maxEntries: 150,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /^https:\/\/archive\.org\/download\/.*$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'archive-audio-cache',
      expiration: {
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  ...runtimeCaching
];

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: customRuntimeCaching,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: exportStatic ? 'export' : undefined,
  trailingSlash: true,
  assetPrefix: exportStatic ? './' : undefined,
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'quran.islam-db.com',
      }
    ],
    formats: exportStatic ? undefined : ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    unoptimized: exportStatic,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withPWA(nextConfig);
