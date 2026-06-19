import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/auth/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      password: true,
      createdAt: true,
    },
  });

  if (!user) redirect('/auth/login');

  return (
    <SettingsClient
      user={{
        id: user.id,
        name: user.name ?? '',
        email: user.email,
        phone: user.phone ?? '',
        image: user.image ?? null,
        hasPassword: !!user.password,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
}
