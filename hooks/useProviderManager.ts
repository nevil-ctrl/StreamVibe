'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Provider } from '@/lib/providers';

type MediaType = 'movie' | 'tv';

interface UseProviderManagerProps {
  providers: Provider[];
  tmdbId: string;
  imdbId?: string | null;
  type: MediaType;
  season?: number;
  episode?: number;
}

interface ProviderState {
  status: 'idle' | 'loading' | 'ok' | 'error';
}

export function useProviderManager({
  providers,
  tmdbId,
  imdbId,
  type,
  season = 1,
  episode = 1,
}: UseProviderManagerProps) {
  const [activeId, setActiveId] = useState(providers[0]?.id ?? '');
  const [statuses, setStatuses] = useState<Record<string, ProviderState>>(() =>
    Object.fromEntries(providers.map((p) => [p.id, { status: 'idle' }])),
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getUrl = useCallback(
    (provider: Provider) =>
      type === 'movie'
        ? provider.getMovieUrl(tmdbId, imdbId)
        : provider.getTvUrl(tmdbId, season, episode, imdbId),
    [type, tmdbId, imdbId, season, episode],
  );

  const active = providers.find((p) => p.id === activeId) ?? providers[0];
  const embedUrl = active ? getUrl(active) : '';

  const selectProvider = useCallback((id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveId(id);
    setStatuses((prev) => ({ ...prev, [id]: { status: 'loading' } }));

    timeoutRef.current = setTimeout(() => {
      setStatuses((prev) => {
        if (prev[id]?.status === 'loading') {
          return { ...prev, [id]: { status: 'ok' } };
        }
        return prev;
      });
    }, 4500);
  }, []);

  const onIframeLoad = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatuses((prev) => ({ ...prev, [activeId]: { status: 'ok' } }));
  }, [activeId]);

  useEffect(() => {
    const firstProvider = providers[0]?.id ?? '';
    setActiveId(firstProvider);
    setStatuses(
      Object.fromEntries(providers.map((p) => [p.id, { status: 'idle' }])),
    );
    selectProvider(firstProvider);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tmdbId, season, episode, providers, selectProvider]);

  return {
    activeId,
    embedUrl,
    statuses,
    iframeRef,
    selectProvider,
    onIframeLoad,
    providers,
    getUrl,
  };
}
