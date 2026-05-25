export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

export const TMDB_ACCESS_TOKEN = process.env
  .NEXT_PUBLIC_TMDB_ACCESS_TOKEN as string;

export async function fetchTMDB<T>(url: string): Promise<T> {
  const res = await fetch(`${TMDB_BASE_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      accept: 'application/json',
    },
  });

  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    throw new Error(`TMDB error ${res.status}`);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`TMDB invalid response (not JSON)`);
  }

  const data = await res.json();

  return data as T;
}
