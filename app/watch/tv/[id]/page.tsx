import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getShowDetail } from '@/services/media-detail.service';
import WatchTvClient from './WatchTvClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    season?: string;
    episode?: string;
  }>;
}

export default async function WatchTvPage({ params, searchParams }: PageProps) {
  const session = await auth();
  const { id } = await params;
  const sp = await searchParams;

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/watch/tv/${id}`);
  }

  const showId = Number(id);
  if (Number.isNaN(showId)) notFound();

  const show = await getShowDetail(showId).catch(() => null);
  if (!show) notFound();

  const season = sp.season ? Number(sp.season) : 1;
  const episode = sp.episode ? Number(sp.episode) : 1;

  return (
    <WatchTvClient
      showId={id}
      title={show.name}
      season={season}
      episode={episode}
      totalSeasons={show.number_of_seasons ?? 1}
      imdbId={(show as any).external_ids?.imdb_id ?? null}
    />
  );
}
