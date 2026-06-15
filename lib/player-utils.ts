/** Allowed iframe origins for postMessage handlers. */
export const PLAYER_MESSAGE_ORIGINS = [
  'https://multiembed.mov',
  'https://www.multiembed.mov',
  'https://kinobox.tv',
  'https://www.kinobox.tv',
  'https://vidsrc.to',
  'https://www.vidsrc.to',
];

export function isAllowedPlayerOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return PLAYER_MESSAGE_ORIGINS.some((allowed) => {
      const allowedHost = new URL(allowed).hostname;
      return host === allowedHost || host.endsWith(`.${allowedHost}`);
    });
  } catch {
    return false;
  }
}

export function enterFullscreen(el: HTMLElement): void {
  if (el.requestFullscreen) {
    void el.requestFullscreen();
  } else if (
    'webkitRequestFullscreen' in el &&
    typeof (el as HTMLElement & { webkitRequestFullscreen: () => void })
      .webkitRequestFullscreen === 'function'
  ) {
    (el as HTMLElement & { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
  } else if (
    'mozRequestFullScreen' in el &&
    typeof (el as HTMLElement & { mozRequestFullScreen: () => void })
      .mozRequestFullScreen === 'function'
  ) {
    (el as HTMLElement & { mozRequestFullScreen: () => void }).mozRequestFullScreen();
  }
}

export function exitFullscreen(): void {
  if (document.exitFullscreen) {
    void document.exitFullscreen();
  } else if (
    'webkitExitFullscreen' in document &&
    typeof (document as Document & { webkitExitFullscreen: () => void })
      .webkitExitFullscreen === 'function'
  ) {
    (document as Document & { webkitExitFullscreen: () => void }).webkitExitFullscreen();
  } else if (
    'mozCancelFullScreen' in document &&
    typeof (document as Document & { mozCancelFullScreen: () => void })
      .mozCancelFullScreen === 'function'
  ) {
    (document as Document & { mozCancelFullScreen: () => void }).mozCancelFullScreen();
  }
}

type DebouncedFn<T extends unknown[]> = ((...args: T) => void) & {
  cancel: () => void;
};

export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delayMs: number,
): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

export interface PlayerProgressMessage {
  type?: string;
  event?: string;
  currentTime?: number;
  duration?: number;
  progress?: number;
}

export function parsePlayerMessage(data: unknown): PlayerProgressMessage | null {
  try {
    const parsed =
      typeof data === 'string' ? (JSON.parse(data) as PlayerProgressMessage) : data;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as PlayerProgressMessage;
  } catch {
    return null;
  }
}

export function extractProgressFromMessage(
  msg: PlayerProgressMessage,
): { currentTime: number; duration: number } | null {
  const currentTime = msg.currentTime ?? msg.progress;
  if (typeof currentTime !== 'number' || !Number.isFinite(currentTime)) return null;
  const duration = typeof msg.duration === 'number' && msg.duration > 0 ? msg.duration : 0;
  return { currentTime, duration };
}

/** Encode season/episode alongside TMDB episode id for resume links. */
export function encodePlaybackEpisodeId(
  season: number,
  episode: number,
  episodeTmdbId?: string | null,
): string {
  const base = `s${season}e${episode}`;
  if (episodeTmdbId) return `${base}:${episodeTmdbId}`;
  return base;
}

export function parsePlaybackEpisodeId(episodeId: string | null | undefined): {
  season: number | null;
  episode: number | null;
  episodeTmdbId: string | null;
} {
  if (!episodeId) return { season: null, episode: null, episodeTmdbId: null };

  const bracket = episodeId.match(/^\[([^\]]*)\](.*)$/);
  const rest = bracket ? bracket[2] : episodeId;

  const match = rest.match(/^s(\d+)e(\d+)(?::(.+))?$/i);
  if (match) {
    return {
      season: Number(match[1]),
      episode: Number(match[2]),
      episodeTmdbId: match[3]?.trim() || null,
    };
  }

  return { season: null, episode: null, episodeTmdbId: rest.trim() || null };
}
