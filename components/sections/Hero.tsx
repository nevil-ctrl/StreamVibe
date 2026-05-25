import Image from 'next/image';
import Link from 'next/link';
import { getPopularMovies } from '@/services/movies.service';
import { TMDB_IMAGE_URL } from '@/lib/tmdb';
import { Play } from 'lucide-react';
type Movie = {
  poster_path: string;
  title: string;
};

function PosterRow({
  items,
  direction,
}: {
  items: Movie[];
  direction: 'left' | 'right';
}) {
  return (
    <div
      className={`flex w-max gap-5 ${
        direction === 'right' ? 'animate-scroll-right' : 'animate-scroll-left'
      }`}>
      {[...items, ...items, ...items, ...items].map((movie, i) => (
        <div
          key={i}
          className="relative shrink-0 overflow-hidden rounded-[14px]
w-[200px] h-[230px]">
          <Image
            src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
            alt={movie.title}
            fill
            className="object-cover"
            priority={i < 10}
          />
        </div>
      ))}
    </div>
  );
}

export default async function Hero() {
  const data = await getPopularMovies();

  const movies = data?.results ?? [];

  if (!movies.length) {
    return <div className="text-white">No movies loaded</div>;
  }

  const row1 = movies.slice(0, 10);
  const row2 = movies.slice(10, 20);
  const row3 = movies.slice(0, 10);
  const row4 = movies.slice(10, 20);
  return (
    <section className="relative min-h-screen pt-[80px] overflow-hidden">
      <div className="absolute inset-0 flex flex-col gap-5 overflow-hidden">
        <PosterRow items={row1} direction="right" />
        <PosterRow items={row2} direction="left" />
        <PosterRow items={row3} direction="right" />
        <PosterRow items={row4} direction="left" />
      </div>
      <div className="absolute inset-0 bg-black/20 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50 z-[2]" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-[var(--black-06)]/80 via-[var(--black-06)]/10 to-[var(--black-06)]/85" />

      <div className="absolute left-0 top-0 z-[2] h-full w-[180px] bg-gradient-to-r from-[var(--black-06)] to-transparent" />

      <div className="absolute right-0 top-0 z-[2] h-full w-[180px] bg-gradient-to-l from-[var(--black-06)] to-transparent" />

      <div className="absolute bottom-0 left-0 z-[3] h-[220px] w-full bg-gradient-to-t from-[var(--black-06)]/95 via-[var(--black-06)]/70 to-transparent" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center gap-[131px]">
        <div className="relative flex items-center justify-center mt-40   brightness-150">
          <Link href="/browse" className="relative block">
            <Image
              src="/svg/banner_1/hz.svg"
              alt="hero-logo"
              width={470}
              height={470}
              className="brightness-150"
            />

            <Image
              src="/svg/banner_1/pluse.svg"
              alt="plus"
              width={180}
              height={180}
              className="absolute top-1/2 left-[54%] -translate-x-1/2 -translate-y-1/2 animate-pulse z-20 opacity-90"
            />
          </Link>
        </div>

        <div className="flex flex-col items-center gap-[24px]">
          <h1 className="max-w-[1000px] text-white text-center text-[58px] font-bold leading-[150%]">
            The Best Streaming Experience
          </h1>
          <p className="max-w-[1100px] text-center text-[18px] font-normal leading-[150%] text-[var(--grey-60)]">
            StreamVibe is the best streaming experience for watching your
            favorite movies and shows on demand, anytime, anywhere. With
            StreamVibe, you can enjoy a wide variety of content, including the
            latest blockbusters, classic movies, popular TV shows, and more. You
            can also create your own watchlists, so you can easily find the
            content you want to watch.
          </p>

          <div className="relative z-10">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#E50000] px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#FF0000]">
              <Play size={20} fill="white" />
              Start Watching Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
