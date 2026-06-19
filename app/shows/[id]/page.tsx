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
import { getUserReviewForMedia } from '@/services/review.service';
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

  const [show, local, watchEntry, userOwnReview] = await Promise.all([
    getShowDetail(showId).catch((e) => {
      console.error('TMDB error:', e);
      if (e instanceof Error && e.message.includes('status 404')) {
        return null;
      }
      throw e;
    }),
    getLocalShow(id).catch(() => null),
    session?.user?.id ? getWatchEntry(session.user.id, { showId: id }) : null,
    session?.user?.id
      ? getUserReviewForMedia(session.user.id, { showId: id })
      : null,
  ]);

  if (!show) notFound();

  const initialFavorited = isFavoriteEntry(watchEntry?.episodeId);
  const initialInWatchlist = isWatchlistEntry(watchEntry?.episodeId);

  const releaseYear = show.first_air_date?.slice(0, 4) ?? null;
  const languages = show.spoken_languages?.map((l) => l.english_name) ?? [];
  const director = pickDirector(show.credits?.crew ?? []);
  const composer = pickComposer(show.credits?.crew ?? []);

  // Переменная для сайдбара, чтобы не дублировать верстку
  const Sidebar = () => (
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
  );

  return (
    <div className="min-h-screen bg-[#141414] text-white pb-20">
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

      {/* Адаптивная трехколоночная сетка */}
      <div className="mx-auto grid max-w-[1600px] gap-6 md:gap-8 px-4 py-6 md:px-12 md:py-10 lg:grid-cols-3">
        {/* Левая часть (Аккордеон сезонов, описание, каст, комменты) */}
        <div className="flex flex-col gap-6 md:gap-8 lg:col-span-2">
          <SeasonsAccordion
            showId={show.id}
            showName={show.name}
            posterPath={show.poster_path}
            seasons={show.seasons ?? []}
          />

          <DescriptionBlock overview={show.overview} />

          {/* Сайдбар: виден на мобилках и планшетах, падает строго под описание */}
          <div className="block lg:hidden">
            <Sidebar />
          </div>

          <CastCarousel cast={show.credits?.cast ?? []} />

          <ReviewsSection
            tmdbReviews={show.reviews?.results ?? []}
            localComments={local?.comments}
            media={{
              type: 'tv',
              id: show.id,
              title: show.name,
              poster_path: show.poster_path,
            }}
            currentUserId={session?.user?.id}
            currentUserRole={session?.user?.role}
            userOwnReview={userOwnReview}
          />
        </div>

        {/* Правая часть: сайдбар только на десктопе */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
