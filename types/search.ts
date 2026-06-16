import type { Movie, MovieResponse } from '@/types/movie';
import type { MovieSortBy } from '@/lib/search-constants';

export interface SearchMoviesParams {
  query?: string;
  genreId?: number;
  sortBy?: MovieSortBy;
  page?: number;
  year?: number;
}

export type { Movie, MovieResponse };
