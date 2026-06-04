export const env = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  API_URL: process.env.NEXT_PUBLIC_API_URL!,
  API_SECRET: process.env.API_SECRET!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  DATABASE_URL: process.env.DATABASE_URL!,
  S3_URL: process.env.NEXT_PUBLIC_S3_URL!,
  S3_KEY: process.env.S3_ACCESS_KEY!,
  S3_SECRET: process.env.S3_SECRET_KEY!,
  GA_ID: process.env.NEXT_PUBLIC_GA_ID!,
  POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
  TMDB_ACCESS_TOKEN:
    process.env.TMDB_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN!,
};
