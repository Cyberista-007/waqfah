const exportStatic = process.env.EXPORT_STATIC === 'true';

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
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'date-fns',
      'recharts',
      'fuse.js',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip'
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

let finalConfig = nextConfig;

try {
  const withPWAInit = (await import('next-pwa')).default;
  const runtimeCaching = (await import('next-pwa/cache.js')).default;
  
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
    {
      urlPattern: /^https:\/\/api\.alquran\.cloud\/v1\/.*$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'quran-api-cache',
        expiration: {
          maxEntries: 500,
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

  finalConfig = withPWA(nextConfig);
} catch {
  // PWA wrapper fallback if not installed or during specific environments
  finalConfig = nextConfig;
}

export default finalConfig;
