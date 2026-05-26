const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const ACCESS_TOKEN =
  process.env.TMDB_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

export async function fetchTMDB<T>(path: string): Promise<T> {
  if (!ACCESS_TOKEN) {
    throw new Error('TMDB_ACCESS_TOKEN is not defined in environment');
  }

  // path может быть как '/movie/popular', так и полным URL — обрабатываем оба
  const url = path.startsWith('http') ? path : `${TMDB_BASE_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error(
      `TMDB HTTP error: ${res.status} ${res.statusText} for ${url}`,
    );
    throw new Error(`TMDB request failed with status ${res.status}`);
  }

  const text = await res.text();

  if (!text || text.trim() === '') {
    throw new Error(`TMDB returned empty response for ${url}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error('TMDB non-JSON response:', text.slice(0, 300));
    throw new Error('TMDB invalid response (not JSON)');
  }
}

export { TMDB_BASE_URL };
