'use client';

import { useEffect, useMemo } from 'react';
import { debounce } from '@/lib/player-utils';

interface UseWatchProgressOptions {
  movieId?: string;
  showId?: string;
  episodeId?: string;
  enabled?: boolean;
}

export function useWatchProgress({
  movieId,
  showId,
  episodeId,
  enabled = true,
}: UseWatchProgressOptions) {
  const saveProgress = useMemo(
    () =>
      debounce((progressSeconds: number, durationSeconds: number) => {
        if (!enabled || typeof window === 'undefined') return;
        if (!movieId && !showId) return;

        void fetch('/api/watch/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movieId,
            showId,
            episodeId,
            progressSeconds,
            durationSeconds,
          }),
        }).catch(() => {});
      }, 5000),
    [movieId, showId, episodeId, enabled],
  );

  useEffect(() => () => saveProgress.cancel(), [saveProgress]);

  return { saveProgress };
}
