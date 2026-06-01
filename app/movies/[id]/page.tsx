import { notFound } from 'next/navigation';
import DetailHero from '@/components/detail/DetailHero';
import DescriptionBlock from '@/components/detail/DescriptionBlock';
import CastCarousel from '@/components/detail/CastCarousel';
import ReviewsSection from '@/components/detail/ReviewsSection';
import MetadataSidebar from '@/components/detail/MetadataSidebar';
import {
  getMovieDetail,
  pickDirector,
  pickComposer,
} from '@/services/media-detail.service';
import { getLocalMovie } from '@/services/content.service';
import { getWatchEntry } from '@/services/watch-history.service';
import { isFavoriteEntry, isWatchlistEntry } from '@/lib/watch-constants';
import { auth } from '@/auth';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetail(Number(id));
    return { title: `${movie.title} | StreamVibe` };
  } catch {
    return { title: 'Movie | StreamVibe' };
  }
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;
  const movieId = Number(id);

  if (Number.isNaN(movieId)) notFound();

  const session = await auth();

  const [movie, local, watchEntry] = await Promise.all([
    getMovieDetail(movieId).catch(() => null),
    getLocalMovie(id).catch(() => null),
    session?.user?.id
      ? getWatchEntry(session.user.id, { movieId: id })
      : Promise.resolve(null),
  ]);

  if (!movie) notFound();

  const initialFavorited = isFavoriteEntry(watchEntry?.episodeId);
  const initialInWatchlist = isWatchlistEntry(watchEntry?.episodeId);

  const releaseYear = movie.release_date?.slice(0, 4) ?? null;
  const languages = movie.spoken_languages?.map((l) => l.english_name) ?? [];
  const director = pickDirector(movie.credits?.crew ?? []);
  const composer = pickComposer(movie.credits?.crew ?? []);

  return (
    <div className="pb-20">
      <DetailHero
        id={movie.id}
        title={movie.title}
        overview={movie.overview}
        backdropPath={movie.backdrop_path}
        posterPath={movie.poster_path}
        type="movie"
        initialFavorited={initialFavorited}
        initialInWatchlist={initialInWatchlist}
      />

      <div className="mx-auto grid max-w-[1600px] gap-8 px-6 py-10 md:px-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <DescriptionBlock overview={movie.overview} />
          <CastCarousel cast={movie.credits?.cast ?? []} />
          <ReviewsSection
            tmdbReviews={movie.reviews?.results ?? []}
            localComments={local?.comments}
          />
        </div>

        <MetadataSidebar
          releaseYear={releaseYear}
          languages={languages}
          rating={movie.vote_average}
          voteCount={movie.vote_count}
          genres={movie.genres ?? []}
          director={director}
          composer={composer}
          watchersCount={local?.watchersCount}
        />
      </div>
    </div>
  );
}
