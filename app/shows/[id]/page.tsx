import { notFound } from 'next/navigation';
import DetailHero from '@/components/detail/DetailHero';
import DescriptionBlock from '@/components/detail/DescriptionBlock';
import CastCarousel from '@/components/detail/CastCarousel';
import ReviewsSection from '@/components/detail/ReviewsSection';
import MetadataSidebar from '@/components/detail/MetadataSidebar';
import SeasonsAccordion from '@/components/detail/SeasonsAccordion';
import {
  getShowDetail,
  pickDirector,
  pickComposer,
} from '@/services/media-detail.service';
import { getLocalShow } from '@/services/content.service';
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
    const show = await getShowDetail(Number(id));
    return { title: `${show.name} | StreamVibe` };
  } catch {
    return { title: 'Show | StreamVibe' };
  }
}

export default async function ShowPage({ params }: PageProps) {
  const { id } = await params;
  const showId = Number(id);

  if (Number.isNaN(showId)) notFound();

  const session = await auth();

  const [show, local, watchEntry] = await Promise.all([
    getShowDetail(showId).catch(() => null),
    getLocalShow(id).catch(() => null),
    session?.user?.id
      ? getWatchEntry(session.user.id, { showId: id })
      : Promise.resolve(null),
  ]);

  if (!show) notFound();

  const initialFavorited = isFavoriteEntry(watchEntry?.episodeId);
  const initialInWatchlist = isWatchlistEntry(watchEntry?.episodeId);

  const releaseYear = show.first_air_date?.slice(0, 4) ?? null;
  const languages = show.spoken_languages?.map((l) => l.english_name) ?? [];
  const director = pickDirector(show.credits?.crew ?? []);
  const composer = pickComposer(show.credits?.crew ?? []);

  return (
    <div className="pb-20">
      <DetailHero
        id={show.id}
        title={show.name}
        overview={show.overview}
        backdropPath={show.backdrop_path}
        posterPath={show.poster_path}
        type="tv"
        initialFavorited={initialFavorited}
        initialInWatchlist={initialInWatchlist}
      />

      <div className="mx-auto grid max-w-[1600px] gap-8 px-6 py-10 md:px-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <SeasonsAccordion
            showId={show.id}
            showName={show.name}
            posterPath={show.poster_path}
            seasons={show.seasons ?? []}
          />
          <DescriptionBlock overview={show.overview} />
          <CastCarousel cast={show.credits?.cast ?? []} />
          <ReviewsSection
            tmdbReviews={show.reviews?.results ?? []}
            localComments={local?.comments}
          />
        </div>

        <MetadataSidebar
          releaseYear={releaseYear}
          languages={languages}
          rating={show.vote_average}
          voteCount={show.vote_count}
          genres={show.genres ?? []}
          director={director}
          composer={composer}
          watchersCount={local?.watchersCount}
        />
      </div>
    </div>
  );
}
