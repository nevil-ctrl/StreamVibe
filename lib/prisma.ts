import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const url = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString: url,
    ssl: false,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { Pool } from 'pg';

// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// // 1. Инициализируем пул подключений pg
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// // 2. Инициализируем адаптер для Prisma
// const adapter = new PrismaPg(pool);

// // 3. Создаем клиент с АДАПТЕРОМ (без 'datasources')
// const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma;
// }

// export { prisma };
