export interface TMDBMovieShort {
  poster_path: string | null;
  title: string;
  [key: string]: unknown;
}

export interface TMDBMediaItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

export interface TMDBCategory {
  id: string | number;
  name: string;
  items: TMDBMediaItem[];
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
