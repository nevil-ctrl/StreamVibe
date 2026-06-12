'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnalyticsEvents } from '@/lib/consent/analytics';

/** Отслеживает просмотры страниц фильмов/сериалов (PostHog movie_view). */
export function MediaViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const movieMatch = pathname.match(/^\/movies\/([^/]+)$/);
    const showMatch = pathname.match(/^\/shows\/([^/]+)$/);

    if (movieMatch) {
      AnalyticsEvents.movieView({ id: movieMatch[1], type: 'movie' });
    } else if (showMatch) {
      AnalyticsEvents.movieView({ id: showMatch[1], type: 'tv' });
    }
  }, [pathname]);

  return null;
}
