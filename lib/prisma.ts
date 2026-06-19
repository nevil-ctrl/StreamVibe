import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, type PoolConfig } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function normalizeDatabaseUrl(url: string): string {
  return url.replace(/@localhost\b/gi, '@127.0.0.1');
}

function resolveSsl(connectionString: string): PoolConfig['ssl'] {
  if (process.env.DATABASE_SSL === 'false') return false;

  const explicitSsl =
    process.env.DATABASE_SSL === 'true' ||
    /sslmode=(require|verify-full|verify-ca|prefer)/i.test(connectionString);

  const hostedDb =
    /\.neon\.tech|\.supabase\.|amazonaws\.com|railway\.app|render\.com|\.vercel-storage\.com/i.test(
      connectionString,
    );

  if (!explicitSsl && !hostedDb) return false;

  return {
    rejectUnauthorized:
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
  };
}

function createPoolConfig(): PoolConfig {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const connectionString = normalizeDatabaseUrl(rawUrl);

  return {
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX) || 10,
    connectionTimeoutMillis:
      Number(process.env.DATABASE_CONNECT_TIMEOUT_MS) || 5000,
    idleTimeoutMillis: 30000,
    ssl: resolveSsl(connectionString),
  };
}

function createPrismaClient(): PrismaClient {
  const pool = new Pool(createPoolConfig());
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
