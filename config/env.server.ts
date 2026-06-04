function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export const serverEnv = {
  AUTH_SECRET: required('AUTH_SECRET', process.env.AUTH_SECRET),
  API_SECRET: required('API_SECRET', process.env.API_SECRET),
  DATABASE_URL: required('DATABASE_URL', process.env.DATABASE_URL),
  NEXTAUTH_URL: required('NEXTAUTH_URL', process.env.NEXTAUTH_URL),
  TMDB_ACCESS_TOKEN: required(
    'TMDB_ACCESS_TOKEN',
    process.env.TMDB_ACCESS_TOKEN,
  ),
};
