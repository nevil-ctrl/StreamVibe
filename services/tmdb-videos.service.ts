import { fetchTMDB } from '@/services/tmdb';
import { DEMO_STREAM_URL } from '@/lib/watch-constants';

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

interface TMDBVideosResponse {
  results: TMDBVideo[];
}

export type PlaybackSource =
  | { kind: 'mp4'; url: string; label: string }
  | { kind: 'youtube'; key: string; label: string };

function pickBestVideo(videos: TMDBVideo[]): TMDBVideo | null {
  const preferred = videos.filter(
    (v) =>
      v.site === 'YouTube' &&
      (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip'),
  );
  return (
    preferred.find((v) => v.official) ??
    preferred[0] ??
    videos.find((v) => v.site === 'YouTube') ??
    null
  );
}

export async function getMoviePlaybackSources(
  movieId: number,
): Promise<PlaybackSource[]> {
  const data = await fetchTMDB<TMDBVideosResponse>(
    `/movie/${movieId}/videos?language=en-US`,
  );
  const picked = pickBestVideo(data.results ?? []);
  const sources: PlaybackSource[] = [
    {
      kind: 'mp4',
      url: DEMO_STREAM_URL,
      label: 'Демо-поток (полный плеер)',
    },
  ];
  if (picked) {
    sources.unshift({
      kind: 'youtube',
      key: picked.key,
      label: picked.name || 'Трейлер',
    });
  }
  return sources;
}

export async function getTvPlaybackSources(
  showId: number,
  season?: number,
  episode?: number,
): Promise<PlaybackSource[]> {
  if (season != null && episode != null) {
    try {
      const data = await fetchTMDB<TMDBVideosResponse>(
        `/tv/${showId}/season/${season}/episode/${episode}/videos?language=en-US`,
      );
      const picked = pickBestVideo(data.results ?? []);
      const sources: PlaybackSource[] = [
        {
          kind: 'mp4',
          url: DEMO_STREAM_URL,
          label: 'Демо-поток (полный плеер)',
        },
      ];
      if (picked) {
        sources.unshift({
          kind: 'youtube',
          key: picked.key,
          label: picked.name || 'Трейлер эпизода',
        });
      }
      return sources;
    } catch {
      /* fallback to show-level */
    }
  }

  const data = await fetchTMDB<TMDBVideosResponse>(
    `/tv/${showId}/videos?language=en-US`,
  );
  const picked = pickBestVideo(data.results ?? []);
  const sources: PlaybackSource[] = [
    {
      kind: 'mp4',
      url: DEMO_STREAM_URL,
      label: 'Демо-поток (полный плеер)',
    },
  ];
  if (picked) {
    sources.unshift({
      kind: 'youtube',
      key: picked.key,
      label: picked.name || 'Трейлер',
    });
  }
  return sources;
}
