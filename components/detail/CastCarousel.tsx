'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { TMDBCastMember } from '@/types/media-detail';
import { tmdbProfile } from '@/lib/tmdb-images';

interface CastCarouselProps {
  cast: TMDBCastMember[];
}

export default function CastCarousel({ cast }: CastCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const items = cast.slice(0, 18);

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({
      left: dir === 'right' ? 280 : -280,
      behavior: 'smooth',
    });
  };

  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#262628] bg-[#1A1A1A] p-6 md:p-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Cast</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#262628] bg-[#141414] transition hover:border-white/30">
            <ArrowLeft size={16} className="text-white" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#262628] bg-[#141414] transition hover:border-white/30">
            <ArrowRight size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}>
        {items.map((person) => {
          const photo = tmdbProfile(person.profile_path);
          return (
            <div
              key={person.id}
              className="w-[100px] shrink-0 text-center md:w-[110px]">
              <div className="relative mx-auto mb-2 aspect-square w-full overflow-hidden rounded-xl border border-[#262628] bg-[#141414]">
                {photo ? (
                  <Image
                    src={photo}
                    alt={person.name}
                    fill
                    sizes="110px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[#666666]">
                    ?
                  </div>
                )}
              </div>
              <p className="truncate text-xs font-medium text-white">
                {person.name}
              </p>
              <p className="truncate text-[11px] text-[#666666]">
                {person.character}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
