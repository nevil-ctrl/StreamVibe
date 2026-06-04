import { prisma } from '../lib/prisma';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log(
      'Использование: npx ts-node scripts/make-admin.ts ivnaparaolv@gmail.com',
    );
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log(`✅ ${user.email} теперь ADMIN`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
