'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { Play, Plus, ThumbsUp, Volume2, Loader2, Check } from 'lucide-react';
import { tmdbBackdrop } from '@/lib/tmdb-images';
import {
  startWatchingMovie,
  startWatchingShow,
  toggleFavoriteMedia,
  toggleWatchlistMedia,
} from '@/app/actions/watch.actions';

interface DetailHeroProps {
  id: number;
  title: string;
  overview: string;
  backdropPath: string | null;
  type: 'movie' | 'tv';
  posterPath: string | null;
  initialFavorited?: boolean;
  initialInWatchlist?: boolean;
}

export default function DetailHero({
  id,
  title,
  overview,
  backdropPath,
  type,
  posterPath,
  initialFavorited = false,
  initialInWatchlist = false,
}: DetailHeroProps) {
  const router = useRouter();
  const backdrop = tmdbBackdrop(backdropPath);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [pending, startTransition] = useTransition();

  const handlePlay = () => {
    startTransition(async () => {
      if (type === 'movie') {
        await startWatchingMovie({ id, title, poster_path: posterPath });
      } else {
        await startWatchingShow({ id, name: title, poster_path: posterPath });
      }
    });
  };

  const handleFavorite = () => {
    startTransition(async () => {
      const result = await toggleFavoriteMedia({
        type,
        id,
        title,
        poster_path: posterPath,
      });
      setFavorited(result.favorited);
      router.refresh();
    });
  };

  const handleWatchlist = () => {
    startTransition(async () => {
      const result = await toggleWatchlistMedia({
        type,
        id,
        title,
        poster_path: posterPath,
      });
      setInWatchlist(result.inWatchlist);
      router.refresh();
    });
  };

  return (
    <section className="relative w-full md:px-12 md:pt-6">
      <div className="relative mx-auto w-full max-w-[1600px] h-[80vh] min-h-[500px] sm:h-[600px] md:h-[55vh] md:min-h-[420px] md:max-h-[65vh] overflow-hidden md:rounded-2xl border-b border-[#262628] md:border bg-[#1A1A1A]">
        <div className="absolute inset-0 w-full h-full">
          {backdrop ? (
            <Image
              src={backdrop}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0 bg-[#141414]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/60 via-transparent to-transparent hidden md:block" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-4 pb-8 text-center md:px-16 md:pb-10">
          <h1 className="mb-3 max-w-3xl text-[28px] font-bold tracking-tight text-white md:text-[42px] drop-shadow-lg">
            {title}
          </h1>
          <p className="mb-6 max-w-2xl line-clamp-3 text-[14px] leading-relaxed text-[#E4E4E7] opacity-90 md:line-clamp-2 md:text-[15px] drop-shadow-md">
            {overview || 'Описание скоро появится.'}
          </p>

          <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <button
              type="button"
              onClick={handlePlay}
              disabled={pending}
              className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#E50000] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 sm:w-auto">
              {pending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
              Play Now
            </button>
            <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleWatchlist}
              disabled={pending}
              title={
                inWatchlist ? 'Убрать из «Мой список»' : 'Добавить в «Мой список»'
              }
              className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border transition disabled:opacity-60 ${
                inWatchlist
                  ? 'border-white bg-white text-black'
                  : 'border-[#262628] bg-[#141414] hover:bg-[#1A1A1A]'
              }`}>
              {inWatchlist ? (
                <Check size={18} strokeWidth={2.5} />
              ) : (
                <Plus size={18} className="text-white" />
              )}
            </button>
            <button
              type="button"
              onClick={handleFavorite}
              disabled={pending}
              title={favorited ? 'Убрать из избранного' : 'В избранное'}
              className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border transition disabled:opacity-60 ${
                favorited
                  ? 'border-[#E50000] bg-[#E50000]/20 text-[#E50000]'
                  : 'border-[#262628] bg-[#141414] hover:bg-[#1A1A1A]'
              }`}>
              <ThumbsUp
                size={16}
                className={favorited ? 'fill-current text-[#E50000]' : 'text-white'}
              />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#262628] bg-[#141414] transition hover:bg-[#1A1A1A]"
              title="Скоро"
            >
              <Volume2 size={16} className="text-white" />
            </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
