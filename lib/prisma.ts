import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, type PoolConfig } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  _pgPool?: Pool;
};

function normalizeDatabaseUrl(url: string): string {
  let normalized = url.replace(/@localhost\b/gi, '@127.0.0.1');

  // Neon pooler auto-switching disabled as the pooler endpoint is unreachable in this environment.
  /*
  if (/\.neon\.tech/i.test(normalized) && !/-pooler\./i.test(normalized)) {
    normalized = normalized.replace(
      /(@[^.]+)(\..*\.neon\.tech)/i,
      '$1-pooler$2',
    );
  }
  */

  return normalized;
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
      Number(process.env.DATABASE_CONNECT_TIMEOUT_MS) || 60000,
    idleTimeoutMillis: 60000,
    allowExitOnIdle: false,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5000,
    ssl: resolveSsl(connectionString),
  };
}

function createPrismaClient(): PrismaClient {
  const pool = new Pool(createPoolConfig());
  globalForPrisma._pgPool = pool;

  // Warm up the pool immediately so the first user request doesn't wait
  // for a cold Neon connection (saves 3-10s on first request).
  pool.query('SELECT 1').catch((err) => {
    console.warn('[prisma] Pool warmup query failed (will retry on demand):', err.message);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

/**
 * Retry wrapper for critical database operations.
 * Retries twice after delays if the first attempt fails with a
 * connection error, which is common with Neon cold-starts.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (retries <= 0) throw err;

    const msg = err instanceof Error ? err.message : '';
    const isConnectionError =
      msg.includes('timeout') ||
      msg.includes('Connection terminated') ||
      msg.includes('connection') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('getaddrinfo');

    if (!isConnectionError) throw err;

    console.warn(
      `[prisma] Connection error, retrying (${retries} left):`,
      msg,
    );
    // Exponential backoff: 2s, 4s, 6s
    const maxRetries = retries + (3 - retries); // original count
    const attempt = 4 - retries; // 1, 2, 3
    const delay = attempt * 2000;
    await new Promise((r) => setTimeout(r, delay));
    return withRetry(fn, retries - 1);
  }
}
