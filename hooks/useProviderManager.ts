'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Provider } from '@/lib/providers';
import {
  extractProgressFromMessage,
  isAllowedPlayerOrigin,
  parsePlayerMessage,
} from '@/lib/player-utils';

type MediaType = 'movie' | 'tv';

interface UseProviderManagerProps {
  providers: Provider[];
  tmdbId: string;
  imdbId?: string | null;
  type: MediaType;
  season?: number;
  episode?: number;
  onProgress?: (currentTime: number, duration: number) => void;
}

interface ProviderState {
  status: 'idle' | 'loading' | 'ok' | 'error';
}

const PROVIDER_LOAD_TIMEOUT_MS = 8000;

export function useProviderManager({
  providers,
  tmdbId,
  imdbId,
  type,
  season = 1,
  episode = 1,
  onProgress,
}: UseProviderManagerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, ProviderState>>(() =>
    Object.fromEntries((providers ?? []).map((p) => [p.id, { status: 'idle' }])),
  );
  const [playerReady, setPlayerReady] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingProviderIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const onProgressRef = useRef(onProgress);

  onProgressRef.current = onProgress;

  const getUrl = useCallback(
    (provider: Provider) =>
      type === 'movie'
        ? provider.getMovieUrl(tmdbId, imdbId)
        : provider.getTvUrl(tmdbId, season, episode, imdbId),
    [type, tmdbId, imdbId, season, episode],
  );

  const safeProviders = providers ?? [];
  const activeProvider = safeProviders[currentIndex] ?? safeProviders[0] ?? null;
  const activeId = activeProvider?.id ?? '';
  const providerUrl = activeProvider ? getUrl(activeProvider) : null;

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const tryNextProvider = useCallback(() => {
    setCurrentIndex((index) => {
      const next = index + 1;
      return next < safeProviders.length ? next : index;
    });
  }, [safeProviders.length]);

  const startProviderLoad = useCallback(
    (provider: Provider) => {
      clearLoadTimeout();
      loadingProviderIdRef.current = provider.id;
      setPlayerReady(false);
      setNeedsInteraction(false);
      setStatuses((prev) => ({ ...prev, [provider.id]: { status: 'loading' } }));

      const providerId = provider.id;
      timeoutRef.current = setTimeout(() => {
        if (!mountedRef.current || loadingProviderIdRef.current !== providerId) {
          return;
        }

        setStatuses((prev) => {
          if (prev[providerId]?.status !== 'loading') return prev;
          return { ...prev, [providerId]: { status: 'error' } };
        });

        tryNextProvider();
      }, PROVIDER_LOAD_TIMEOUT_MS);
    },
    [clearLoadTimeout, tryNextProvider],
  );

  const selectProvider = useCallback(
    (id: string) => {
      const idx = safeProviders.findIndex((p) => p.id === id);
      if (idx < 0) return;
      setCurrentIndex(idx);
    },
    [safeProviders],
  );

  const onIframeLoad = useCallback(() => {
    const providerId = loadingProviderIdRef.current;
    if (!providerId || !mountedRef.current) return;

    clearLoadTimeout();
    setStatuses((prev) => ({ ...prev, [providerId]: { status: 'ok' } }));
    setPlayerReady(true);

    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      setNeedsInteraction(true);
    }
  }, [clearLoadTimeout]);

  const onIframeError = useCallback(() => {
    const providerId = loadingProviderIdRef.current;
    if (!providerId || !mountedRef.current) return;

    clearLoadTimeout();
    setStatuses((prev) => ({ ...prev, [providerId]: { status: 'error' } }));
    tryNextProvider();
  }, [clearLoadTimeout, tryNextProvider]);

  const handleManualPlay = useCallback(() => {
    setNeedsInteraction(false);
    iframeRef.current?.focus();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setCurrentIndex(0);
    setPlayerReady(false);
    setNeedsInteraction(false);
    setStatuses(
      Object.fromEntries(safeProviders.map((p) => [p.id, { status: 'idle' }])),
    );

    return () => {
      mountedRef.current = false;
      clearLoadTimeout();
      loadingProviderIdRef.current = null;
    };
  }, [tmdbId, season, episode, safeProviders, clearLoadTimeout]);

  useEffect(() => {
    if (!activeProvider) return;
    startProviderLoad(activeProvider);
    return clearLoadTimeout;
  }, [currentIndex, activeProvider, startProviderLoad, clearLoadTimeout]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        if (!isAllowedPlayerOrigin(e.origin)) return;

        const msg = parsePlayerMessage(e.data);
        if (!msg) return;

        const progress = extractProgressFromMessage(msg);
        if (progress) {
          onProgressRef.current?.(progress.currentTime, progress.duration);
        }
      } catch {
        // Ignore malformed cross-origin messages
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return {
    activeId,
    embedUrl: providerUrl ?? '',
    providerUrl,
    playerReady,
    needsInteraction,
    statuses,
    iframeRef,
    selectProvider,
    onIframeLoad,
    onIframeError,
    handleManualPlay,
    providers: safeProviders,
    getUrl,
  };
}
