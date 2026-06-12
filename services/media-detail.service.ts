import { fetchTMDB } from '@/services/tmdb';
import type {
  MovieDetail,
  ShowDetail,
  TMDBSeasonDetail,
} from '@/types/media-detail';

export async function getMovieDetail(id: number): Promise<MovieDetail> {
  return fetchTMDB<MovieDetail>(
    `/movie/${id}?append_to_response=credits,reviews,videos,external_ids&language=en-US`,
  );
}

export async function getShowDetail(id: number): Promise<ShowDetail> {
  return fetchTMDB<ShowDetail>(
    `/tv/${id}?append_to_response=credits,reviews,external_ids&language=en-US`,
  );
}

export async function getSeasonEpisodes(
  showId: number,
  seasonNumber: number,
): Promise<TMDBSeasonDetail> {
  return fetchTMDB<TMDBSeasonDetail>(
    `/tv/${showId}/season/${seasonNumber}?language=en-US`,
  );
}

export function pickDirector(crew: MovieDetail['credits']['crew']) {
  return crew.find((c) => c.job === 'Director');
}

export function pickComposer(crew: MovieDetail['credits']['crew']) {
  return (
    crew.find((c) => c.job === 'Original Music Composer') ??
    crew.find((c) => c.department === 'Sound' && c.job.includes('Music'))
  );
}
