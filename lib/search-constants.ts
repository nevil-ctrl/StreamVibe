export const MOVIE_SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'По популярности' },
  { value: 'vote_average.desc', label: 'По рейтингу' },
  { value: 'release_date.desc', label: 'Сначала новые' },
  { value: 'release_date.asc', label: 'Сначала старые' },
] as const;

export type MovieSortBy = (typeof MOVIE_SORT_OPTIONS)[number]['value'];

export const DEFAULT_MOVIE_SORT: MovieSortBy = 'popularity.desc';
