import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getShowDetail } from '@/services/media-detail.service';
import { parsePlaybackEpisodeId } from '@/lib/player-utils';
import { parseEpisodeMeta } from '@/lib/watch-constants';
import { hasWatchAccess } from '@/lib/subscription';
import WatchTvClient from './WatchTvClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    season?: string;
    episode?: string;
    episodeId?: string;
    t?: string;
  }>;
}

export default async function WatchTvPage({ params, searchParams }: PageProps) {
  const session = await auth();
  const { id } = await params;
  const sp = await searchParams;

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/watch/tv/${id}`);
  }

  if (!(await hasWatchAccess(session.user.id, session.user.role))) {
    redirect('/subscriptions?required=watch');
  }

  const showId = Number(id);
  if (Number.isNaN(showId)) notFound();

  const show = await getShowDetail(showId).catch(() => null);
  if (!show) notFound();

  const parsedEpisode = parsePlaybackEpisodeId(
    sp.episodeId
      ? (parseEpisodeMeta(sp.episodeId).episodeTmdbId ?? sp.episodeId)
      : undefined,
  );

  const season = sp.season ? Number(sp.season) : (parsedEpisode.season ?? 1);
  const episode = sp.episode
    ? Number(sp.episode)
    : (parsedEpisode.episode ?? 1);

  const safeSeason = Number.isFinite(season) && season > 0 ? season : 1;
  const safeEpisode = Number.isFinite(episode) && episode > 0 ? episode : 1;

  const showRecord = show as {
    external_ids?: { imdb_id?: string | null };
  };
  const imdbId = showRecord.external_ids?.imdb_id ?? null;

  return (
    <WatchTvClient
      showId={id}
      title={show.name}
      season={safeSeason}
      episode={safeEpisode}
      imdbId={imdbId}
      episodeTmdbId={parsedEpisode.episodeTmdbId}
    />
  );
}
