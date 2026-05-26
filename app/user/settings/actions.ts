'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Не авторизован');

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  await prisma.user.update({
    where: { email: session.user.email },
    data: { name, email },
  });

  revalidatePath('/user/settings');
  return { success: true };
}
