'use client';

import Image from 'next/image';
import { Play, Plus, ThumbsUp, Volume2 } from 'lucide-react';
import { tmdbBackdrop } from '@/lib/tmdb-images';
import { startWatchingMovie, startWatchingShow } from '@/app/actions/watch.actions';

interface DetailHeroProps {
  id: number;
  title: string;
  overview: string;
  backdropPath: string | null;
  type: 'movie' | 'tv';
  posterPath: string | null;
}

export default function DetailHero({
  id,
  title,
  overview,
  backdropPath,
  type,
  posterPath,
}: DetailHeroProps) {
  const backdrop = tmdbBackdrop(backdropPath);

  const handlePlay = () => {
    if (type === 'movie') {
      startWatchingMovie({ id, title, poster_path: posterPath });
    } else {
      startWatchingShow({ id, name: title, poster_path: posterPath });
    }
  };

  return (
    <section className="relative w-full px-4 pt-4 md:px-12 md:pt-6">
      <div className="relative mx-auto h-[55vh] min-h-[420px] max-w-[1600px] overflow-hidden rounded-2xl border border-[#262628] bg-[#1A1A1A] md:h-[65vh]">
        {backdrop ? (
          <Image
            src={backdrop}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#141414]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/60 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-10 text-center md:px-16">
          <h1 className="mb-3 max-w-3xl text-[28px] font-bold tracking-tight text-white drop-shadow-md md:text-[42px]">
            {title}
          </h1>
          <p className="mb-6 max-w-2xl line-clamp-2 text-[14px] leading-relaxed text-[#E4E4E7] opacity-90 md:text-[15px]">
            {overview || 'Описание скоро появится.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePlay}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#E50000] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
              <Play size={16} fill="currentColor" />
              Play Now
            </button>
            <button
              type="button"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#262628] bg-[#141414] transition hover:bg-[#1A1A1A]">
              <Plus size={18} className="text-white" />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#262628] bg-[#141414] transition hover:bg-[#1A1A1A]">
              <ThumbsUp size={16} className="text-white" />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#262628] bg-[#141414] transition hover:bg-[#1A1A1A]">
              <Volume2 size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
