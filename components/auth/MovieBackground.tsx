'use client';

import Image from 'next/image';
import { TMDB_IMAGE_URL } from '@/lib/tmdb';

type Movie = {
  poster_path: string;
  title: string;
};

interface MovieBackgroundProps {
  movies: Movie[];
}

function PosterRow({
  items,
  direction,
}: {
  items: Movie[];
  direction: 'left' | 'right';
}) {
  return (
    <div
      className={`flex w-max gap-4 ${
        direction === 'right' ? 'animate-scroll-right' : 'animate-scroll-left'
      }`}
      style={{ willChange: 'transform' }}>
      {[...items, ...items, ...items].map((movie, i) => (
        <div
          key={i}
          className="relative shrink-0 overflow-hidden rounded-xl w-[180px] h-[260px] bg-(--black-15) border border-(--black-20) shadow-md">
          {movie.poster_path && (
            <Image
              src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
              alt={movie.title || 'Movie Poster'}
              fill
              sizes="180px"
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority={i < 6}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MovieBackground({ movies }: MovieBackgroundProps) {
  if (!movies || !movies.length) return null;

  const row1 = movies.slice(0, 10);
  const row2 = movies.slice(10, 20);
  const row3 = movies.slice(0, 10);
  const row4 = movies.slice(10, 20);

  return (
    <div className="absolute inset-0 z-0 flex flex-col gap-4 opacity-25 pointer-events-none select-none scale-105 overflow-hidden">
      <PosterRow items={row1} direction="right" />
      <PosterRow items={row2} direction="left" />
      <PosterRow items={row3} direction="right" />
      <PosterRow items={row4} direction="left" />
    </div>
  );
}
