export interface Show {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  genre_ids: number[];
}

export interface ShowResponse {
  page: number;
  results: Show[];
  total_pages: number;
  total_results: number;
}
