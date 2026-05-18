export const env = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  API_URL: process.env.NEXT_PUBLIC_API_URL,

  JWT_SECRET: process.env.JWT_SECRET,
  API_SECRET: process.env.API_SECRET,

  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,

  DATABASE_URL: process.env.DATABASE_URL,

  S3_URL: process.env.NEXT_PUBLIC_S3_URL,
  S3_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET: process.env.S3_SECRET_KEY,

  GA_ID: process.env.NEXT_PUBLIC_GA_ID,
};
