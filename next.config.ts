import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '*.tmdb.org' },
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'utfs.io' },
    ],
  },
  async headers() {
    return [
      {
        source: '/watch/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
              "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
              "style-src * 'unsafe-inline'",
              "img-src * data: blob:",
              "frame-src * data: blob:",
              "connect-src * data: blob:",
              "media-src * data: blob:",
              "worker-src * data: blob:",
            ].join('; '),
          },
        ],
      },
      {
        source: '/((?!watch).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us-assets.i.posthog.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://image.tmdb.org https://*.tmdb.org https://lh3.googleusercontent.com https://utfs.io",
              "frame-src 'self' https://www.youtube.com",
              "connect-src 'self' https://api.themoviedb.org https://*.tmdb.org https://us.i.posthog.com https://us-assets.i.posthog.com https://uploadthing.com https://*.uploadthing.com",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
