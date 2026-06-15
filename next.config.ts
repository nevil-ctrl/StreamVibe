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
              "default-src 'self' blob: data: https://*.kinobox.tv https://*.multiembed.mov https://*.vidsrc.to https://*.vidsrc.me",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.kinobox.tv https://*.multiembed.mov https://*.vidsrc.to https://*.vidsrc.me https://us-assets.i.posthog.com",
              "style-src 'self' 'unsafe-inline' https://*.kinobox.tv https://*.multiembed.mov https://*.vidsrc.to https://*.vidsrc.me",
              "img-src 'self' data: blob: https://*.tmdb.org https://image.tmdb.org https://lh3.googleusercontent.com https://utfs.io https://*.kinobox.tv https://*.multiembed.mov https://*.vidsrc.to https://*.vidsrc.me",
              "frame-src 'self' https://*.kinobox.tv https://*.multiembed.mov https://*.vidsrc.to https://*.vidsrc.me https://www.youtube.com https://*.youtube.com",
              "connect-src 'self' https://api.themoviedb.org https://*.tmdb.org https://us.i.posthog.com https://us-assets.i.posthog.com https://*.kinobox.tv https://*.multiembed.mov https://*.vidsrc.to https://*.vidsrc.me",
              "media-src 'self' blob: https: data: android-webview-video-poster:",
              "worker-src 'self' blob:",
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
              "connect-src 'self' https://api.themoviedb.org https://*.tmdb.org https://us.i.posthog.com https://us-assets.i.posthog.com",
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
