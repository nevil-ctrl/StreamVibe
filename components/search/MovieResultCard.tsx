import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { TMDB_IMAGE_URL } from '@/lib/tmdb';
import type { Movie } from '@/types/movie';

interface MovieResultCardProps {
  movie: Movie;
}

export default function MovieResultCard({ movie }: MovieResultCardProps) {
  const year = movie.release_date?.slice(0, 4);

  return (
    <Link href={`/movies/${movie.id}`} className="group block">
      <article
        className="relative overflow-hidden rounded-xl border border-[#262628] bg-[#1A1A1A] transition-colors hover:border-[#E50000]"
        style={{ aspectRatio: '2/3' }}>
        {movie.poster_path ? (
          <Image
            src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[#999999]">
            {movie.title}
          </div>
        )}

        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div>
            <p className="text-sm font-medium leading-tight text-white">
              {movie.title}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-[#BFBFBF]">
              {year && <span>{year}</span>}
              <span className="flex items-center gap-0.5 text-[#E50000]">
                <Star size={12} fill="currentColor" />
                {movie.vote_average?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
