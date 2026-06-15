export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

function getToken() {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) throw new Error('TMDB_ACCESS_TOKEN is missing');
  return token;
}

export async function fetchTMDB<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(`${TMDB_BASE_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    return (await res.json()) as T;
  } catch {
    return null;
  }
}
