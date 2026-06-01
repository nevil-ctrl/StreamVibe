/** Маркеры в поле episodeId (схема Prisma не меняется). */
export type WatchMarker = 'FAVORITE' | 'WATCHLIST';

export interface EpisodeMeta {
  markers: WatchMarker[];
  episodeTmdbId: string | null;
}

const LEGACY_FAVORITE = 'FAVORITE';
const LEGACY_WATCHLIST = 'WATCHLIST';

export function parseEpisodeMeta(
  episodeId: string | null | undefined,
): EpisodeMeta {
  if (!episodeId) return { markers: [], episodeTmdbId: null };

  const bracket = episodeId.match(/^\[([^\]]*)\](.*)$/);
  if (bracket) {
    const markers = bracket[1]
      .split(',')
      .map((m) => m.trim())
      .filter(
        (m): m is WatchMarker => m === 'FAVORITE' || m === 'WATCHLIST',
      );
    const episodeTmdbId = bracket[2]?.trim() || null;
    return { markers, episodeTmdbId };
  }

  if (episodeId === LEGACY_FAVORITE) {
    return { markers: ['FAVORITE'], episodeTmdbId: null };
  }
  if (episodeId.startsWith(`${LEGACY_FAVORITE}:`)) {
    const rest = episodeId.slice(LEGACY_FAVORITE.length + 1);
    if (rest === LEGACY_WATCHLIST) {
      return { markers: ['FAVORITE', 'WATCHLIST'], episodeTmdbId: null };
    }
    if (rest.startsWith(`${LEGACY_WATCHLIST}:`)) {
      return {
        markers: ['FAVORITE', 'WATCHLIST'],
        episodeTmdbId: rest.slice(LEGACY_WATCHLIST.length + 1) || null,
      };
    }
    return { markers: ['FAVORITE'], episodeTmdbId: rest || null };
  }

  if (episodeId === LEGACY_WATCHLIST) {
    return { markers: ['WATCHLIST'], episodeTmdbId: null };
  }
  if (episodeId.startsWith(`${LEGACY_WATCHLIST}:`)) {
    return {
      markers: ['WATCHLIST'],
      episodeTmdbId: episodeId.slice(LEGACY_WATCHLIST.length + 1) || null,
    };
  }

  return { markers: [], episodeTmdbId: episodeId };
}

export function encodeEpisodeMeta(meta: EpisodeMeta): string | null {
  const markers = [...new Set(meta.markers)];
  const episodeTmdbId = meta.episodeTmdbId?.trim() || null;

  if (markers.length === 0 && !episodeTmdbId) return null;
  if (markers.length === 0) return episodeTmdbId;

  return `[${markers.join(',')}]${episodeTmdbId ?? ''}`;
}

export function hasMarker(
  episodeId: string | null | undefined,
  marker: WatchMarker,
): boolean {
  return parseEpisodeMeta(episodeId).markers.includes(marker);
}

export function isFavoriteEntry(episodeId: string | null | undefined): boolean {
  return hasMarker(episodeId, 'FAVORITE');
}

export function isWatchlistEntry(episodeId: string | null | undefined): boolean {
  return hasMarker(episodeId, 'WATCHLIST');
}

export function toggleMarkerInMeta(
  meta: EpisodeMeta,
  marker: WatchMarker,
  enabled: boolean,
): EpisodeMeta {
  const markers = new Set(meta.markers);
  if (enabled) markers.add(marker);
  else markers.delete(marker);
  return { markers: [...markers], episodeTmdbId: meta.episodeTmdbId };
}

/** Убирает маркеры, оставляет id эпизода (для воспроизведения). */
export function episodeIdForPlayback(
  episodeId: string | null | undefined,
): string | null {
  return parseEpisodeMeta(episodeId).episodeTmdbId;
}

/** Сохраняет только маркеры «отложенного» списка при старте просмотра. */
export function episodeIdOnPlayStart(
  episodeId: string | null | undefined,
  newEpisodeTmdbId?: string | null,
): string | null {
  const meta = parseEpisodeMeta(episodeId);
  const kept = meta.markers.filter((m) => m === 'WATCHLIST');
  const episodeTmdbId = newEpisodeTmdbId ?? meta.episodeTmdbId;
  return encodeEpisodeMeta({ markers: kept, episodeTmdbId });
}

/** @deprecated используйте parseEpisodeMeta */
export const FAVORITE_EPISODE_ID = LEGACY_FAVORITE;

/** @deprecated */
export function stripFavoriteMarker(
  episodeId: string | null | undefined,
): string | null {
  return episodeIdForPlayback(episodeId);
}

/** @deprecated */
export function withFavoriteMarker(episodeId: string | null | undefined): string {
  const meta = parseEpisodeMeta(episodeId);
  return (
    encodeEpisodeMeta(toggleMarkerInMeta(meta, 'FAVORITE', true)) ??
    LEGACY_FAVORITE
  );
}

export const DEMO_STREAM_URL =
  process.env.DEMO_STREAM_URL ??
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
