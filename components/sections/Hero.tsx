import Image from 'next/image';
import Link from 'next/link';
import { getPopularMovies } from '@/services/movies.service';
import { TMDB_IMAGE_URL } from '@/config/env';

type Movie = { poster_path: string; title: string };

function PosterRow({
  items,
  direction,
}: {
  items: Movie[];
  direction: 'left' | 'right';
}) {
  return (
    <div
      className={`flex gap-3 w-max ${direction === 'right' ? 'animate-scroll-right' : 'animate-scroll-left'}`}>
      {[...items, ...items, ...items, ...items, ...items, ...items].map(
        (movie, i) => (
          <div
            key={i}
            className="shrink-0 w-[160px] h-[210px] rounded-xl overflow-hidden">
            <Image
              src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
              alt={movie.title}
              width={400}
              height={755}
              className="object-cover w-full h-full"
            />
          </div>
        ),
      )}
    </div>
  );
}

export default async function Hero() {
  const data = await getPopularMovies();
  const movies = data.results;

  const row1 = movies.slice(0, 10);
  const row2 = movies.slice(10, 20);
  const row3 = movies.slice(0, 10);
  const row4 = movies.slice(10, 20);

  return (
    <section className="relative w-full h-[981px] overflow-hidden">
      <div className="absolute inset-0 flex flex-col gap-4 pt-[80px]">
        <PosterRow items={row1} direction="right" />
        <PosterRow items={row2} direction="left" />
        <PosterRow items={row3} direction="right" />
        <PosterRow items={row4} direction="left" />
      </div>

      <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#141414] to-transparent" />
      <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#141414] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#141414] to-transparent" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="gap-6 absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <div className=" inset-0 flex items-center justify-center pointer-events-none">
          <Image
            src="/svg/banner_1/hz.svg"
            alt="StreamVibe"
            width={480}
            height={480}
            className="opacity-290"
          />
        </div>

        <div className="absolute mt-[400px] bottom-4 left-0 right-0 flex flex-col items-center text-center px-9 z-10">
          <h1 className="text-5xl font-bold text-white mb-4">
            The Best Streaming Experience
          </h1>
          <p className="text-[#B3B3B3] max-w-2xl mb-6 text-base leading-relaxed">
            StreamVibe is the best streaming experience for watching your
            favorite movies and shows on demand, anytime, anywhere. With
            StreamVibe, you can enjoy a wide variety of content, including the
            latest blockbusters, classic movies, popular TV shows, and more. You
            can also create your own watchlists, so you can easily find the
            content you want to watch.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 bg-[#E50000] hover:bg-[#cc0000] transition-colors text-white px-8 py-3 rounded-lg font-semibold text-base">
            <Image
              src="/svg/banner_1/pluse.svg"
              alt="play"
              width={22}
              height={22}
            />
            Start Watching Now
          </Link>
        </div>
      </div>
    </section>
  );
}
