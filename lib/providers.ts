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

// Провайдеры проверены: 17 июня 2026
// ❌ Удалены мёртвые: kinobox.tv (404), voidboost.tv (SSL/сертификат), moviesapi.club (DNS не существует)
// ✅ Добавлены рабочие: vidsrc.me, 2embed.cc, videasy.net
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
    id: 'vidsrc',
    label: 'Плеер 2',
    lang: 'en',
    priority: 2,
    getMovieUrl: (tmdbId, imdbId) =>
      `https://vidsrc.to/embed/movie/${imdbId || tmdbId}`,
    getTvUrl: (tmdbId, s, e, imdbId) =>
      `https://vidsrc.to/embed/tv/${imdbId || tmdbId}/${s}/${e}`,
  },
  {
    id: 'vidsrcme',
    label: 'Плеер 3',
    lang: 'en',
    priority: 3,
    getMovieUrl: (tmdbId) =>
      `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
    getTvUrl: (tmdbId, s, e) =>
      `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}`,
  },
  {
    id: '2embed',
    label: 'Плеер 4',
    lang: 'multi',
    priority: 4,
    getMovieUrl: (tmdbId) =>
      `https://www.2embed.cc/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s, e) =>
      `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`,
  },
  {
    id: 'videasy',
    label: 'Плеер 5',
    lang: 'multi',
    priority: 5,
    getMovieUrl: (tmdbId) =>
      `https://player.videasy.net/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s, e) =>
      `https://player.videasy.net/tv/${tmdbId}/${s}/${e}`,
  },
];

export const ALL_PROVIDERS = [...PROVIDERS].sort(
  (a, b) => a.priority - b.priority,
);
export const RU_PROVIDERS = PROVIDERS.filter((p) => p.lang === 'ru');
export const EN_PROVIDERS = PROVIDERS.filter((p) => p.lang !== 'ru');
