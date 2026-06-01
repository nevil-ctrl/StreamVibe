import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getShowDetail } from '@/services/media-detail.service';
import { getTvPlaybackSources } from '@/services/tmdb-videos.service';
import { getWatchEntry } from '@/services/watch-history.service';
import { ensureShowInDb } from '@/services/content.service';
import { fetchTMDB } from '@/services/tmdb';
import type { TMDBEpisode } from '@/types/media-detail';
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

async function findEpisodeMeta(
  showId: number,
  episodeId: string,
): Promise<{ season: number; episode: number; name: string } | null> {
  const show = await getShowDetail(showId).catch(() => null);
  if (!show?.seasons) return null;

  for (const season of show.seasons) {
    if (season.season_number < 1) continue;
    try {
      const detail = await fetchTMDB<{ episodes: TMDBEpisode[] }>(
        `/tv/${showId}/season/${season.season_number}?language=en-US`,
      );
      const found = detail.episodes?.find((ep) => String(ep.id) === episodeId);
      if (found) {
        return {
          season: season.season_number,
          episode: found.episode_number,
          name: found.name,
        };
      }
    } catch {
      continue;
    }
  }
  return null;
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

  await ensureShowInDb({
    id: show.id,
    name: show.name,
    poster_path: show.poster_path,
  });

  let season = sp.season ? Number(sp.season) : undefined;
  let episode = sp.episode ? Number(sp.episode) : undefined;
  let episodeName: string | undefined;
  const episodeId = sp.episodeId;

  if (episodeId && (season == null || episode == null)) {
    const meta = await findEpisodeMeta(showId, episodeId);
    if (meta) {
      season = meta.season;
      episode = meta.episode;
      episodeName = meta.name;
    }
  }

  const [sources, history] = await Promise.all([
    getTvPlaybackSources(showId, season, episode),
    getWatchEntry(session.user.id, { showId: id }),
  ]);

  const initialProgress =
    sp.t != null
      ? Number(sp.t)
      : history?.progress && history.progress > 0
        ? history.progress
        : 0;

  const subtitle =
    episodeName ??
    (season != null && episode != null
      ? `Сезон ${season}, эпизод ${episode}`
      : undefined);

  return (
    <WatchTvClient
      showId={id}
      title={show.name}
      subtitle={subtitle}
      sources={sources}
      initialProgress={Number.isFinite(initialProgress) ? initialProgress : 0}
      episodeId={episodeId}
    />
  );
}
