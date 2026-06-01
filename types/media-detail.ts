export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBReview {
  id: string;
  author: string;
  content: string;
  created_at: string;
  author_details?: {
    rating: number | null;
    avatar_path: string | null;
    username?: string;
  };
}

export interface TMDBSeasonSummary {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  overview: string;
  air_date: string;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  runtime: number | null;
  air_date: string;
}

export interface TMDBSeasonDetail {
  id: number;
  name: string;
  season_number: number;
  episodes: TMDBEpisode[];
}

export interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number | null;
  genres: TMDBGenre[];
  spoken_languages: { english_name: string; iso_639_1: string }[];
  credits: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  reviews: {
    results: TMDBReview[];
  };
}

export interface ShowDetail {
  id: number;
  name: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  number_of_seasons: number;
  genres: TMDBGenre[];
  spoken_languages: { english_name: string; iso_639_1: string }[];
  seasons: TMDBSeasonSummary[];
  credits: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  reviews: {
    results: TMDBReview[];
  };
}

export interface LocalComment {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    role: 'USER' | 'ADMIN';
  };
}

export interface LocalMediaData {
  comments: LocalComment[];
  watchersCount: number;
}
