const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

export async function fetchTMDB<T>(path: string): Promise<T> {
  const res = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    console.error('TMDB ERROR:', res.status);
    return {} as T;
  }

  return res.json();
}

export { TMDB_BASE_URL };
// export const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
