export interface Provider {
  id: string;
  label: string;
  lang: 'ru' | 'en' | 'multi';
  priority: number;
  getMovieUrl: (tmdbId: string, imdbId?: string | null) => string;
  getTvUrl: (
    tmdbId: string,
    s: number,
    e: number,
    imdbId?: string | null,
  ) => string;
}

export const PROVIDERS: Provider[] = [
  {
    id: 'superembed',
    label: 'Плеер 1',
    lang: 'multi',
    priority: 1,
    getMovieUrl: (tmdbId) =>
      `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTvUrl: (tmdbId, s, e) =>
      `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: 'kinobox',
    label: 'Плеер 2',
    lang: 'ru',
    priority: 2,
    getMovieUrl: (tmdbId, imdbId) =>
      `https://kinobox.tv/embed/vod?${imdbId ? `imdb=${imdbId}` : `tmdb=${tmdbId}`}`,
    getTvUrl: (tmdbId, s, e, imdbId) =>
      `https://kinobox.tv/embed/vod?${imdbId ? `imdb=${imdbId}` : `tmdb=${tmdbId}`}&s=${s}&e=${e}`,
  },
  {
    id: 'vidsrc',
    label: 'Плеер 3',
    lang: 'en',
    priority: 3,
    getMovieUrl: (tmdbId, imdbId) =>
      `https://vidsrc.to/embed/movie/${imdbId || tmdbId}`,
    getTvUrl: (tmdbId, s, e, imdbId) =>
      `https://vidsrc.to/embed/tv/${imdbId || tmdbId}/${s}/${e}`,
  },
  {
    id: 'voidboost',
    label: 'Плеер 4',
    lang: 'multi',
    priority: 4,
    getMovieUrl: (tmdbId) => `https://voidboost.tv/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s, e) => `https://voidboost.tv/embed/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'moviesapi',
    label: 'Плеер 5',
    lang: 'multi',
    priority: 5,
    getMovieUrl: (tmdbId) => `https://moviesapi.club/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s, e) => `https://moviesapi.club/tv/${tmdbId}-${s}-${e}`,
  },
];

export const ALL_PROVIDERS = [...PROVIDERS].sort(
  (a, b) => a.priority - b.priority,
);
export const RU_PROVIDERS = PROVIDERS.filter((p) => p.lang === 'ru');
export const EN_PROVIDERS = PROVIDERS.filter((p) => p.lang !== 'ru');
