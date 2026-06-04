import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Загружаем переменные окружения из .env файла
config();

const prisma = new PrismaClient();

async function main() {
  console.log('Подключение к БД...');

  const usersData = Array.from({ length: 20 }).map((_, i) => ({
    name: `Test User ${i + 1}`,
    email: `testuser${i + 1}@example.com`,
    role: 'USER',
    isBanned: false,
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
  }));

  await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true,
  });

  console.log('Успешно добавлено 20 пользователей!');
}

main()
  .catch((e) => {
    console.error('Ошибка при сидинге:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
