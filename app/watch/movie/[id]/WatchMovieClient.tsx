'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ALL_PROVIDERS } from '@/lib/providers';
import { useProviderManager } from '@/hooks/useProviderManager';

interface Props {
  movieId: string;
  title: string;
  imdbId: string | null;
}

export default function WatchMovieClient({ movieId, title, imdbId }: Props) {
  const {
    activeId,
    embedUrl,
    statuses,
    iframeRef,
    selectProvider,
    onIframeLoad,
  } = useProviderManager({
    providers: ALL_PROVIDERS,
    tmdbId: movieId,
    imdbId,
    type: 'movie',
  });

  return (
    <div className="flex flex-col h-screen bg-[#0F0F0F] overflow-hidden">
      <div className="flex-shrink-0 px-4 py-2 md:px-6 flex items-center gap-4 border-b border-[#1A1A1A] min-h-[52px]">
        <Link
          href={`/movies/${movieId}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#999] hover:text-white transition whitespace-nowrap shrink-0">
          <ArrowLeft size={15} />
          Назад
        </Link>

        <span className="text-white font-semibold text-sm truncate shrink-0 max-w-[180px] md:max-w-xs">
          {title}
        </span>

        <div className="flex items-center gap-1.5 ml-auto flex-wrap justify-end">
          {ALL_PROVIDERS.map((p) => {
            const status = statuses[p.id]?.status ?? 'idle';
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectProvider(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border cursor-pointer ${
                  activeId === p.id
                    ? 'bg-[#E50000] border-[#E50000] text-white'
                    : status === 'error'
                      ? 'bg-[#1A1A1A] border-[#3a1a1a] text-[#666]'
                      : 'bg-[#1A1A1A] border-[#262628] text-[#999] hover:text-white hover:border-[#444]'
                }`}>
                {activeId === p.id && status === 'loading' && (
                  <Loader2 size={10} className="animate-spin" />
                )}
                {status === 'ok' && activeId !== p.id && (
                  <CheckCircle size={10} className="text-green-500" />
                )}
                {status === 'error' && (
                  <XCircle size={10} className="text-red-400" />
                )}

                <span>{p.label}</span>

                {p.lang === 'ru' && (
                  <span className="text-[9px] bg-white/20 px-1 rounded">
                    RU
                  </span>
                )}
                {p.lang === 'en' && (
                  <span className="text-[9px] opacity-50">EN</span>
                )}
                {p.lang === 'multi' && (
                  <span className="text-[9px] opacity-50">RU/EN</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 relative bg-black min-h-0">
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            key={`${activeId}-${embedUrl}`}
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0 bg-black"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            onLoad={onIframeLoad}
            title={title}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#999] bg-black">
            Нет доступных источников
          </div>
        )}
      </div>
    </div>
  );
}
