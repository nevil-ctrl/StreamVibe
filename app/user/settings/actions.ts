'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

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

export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Не авторизован');

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) throw new Error('Пользователь не найден');

  if (user.password) {
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return { success: false, message: 'Неверный текущий пароль' };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashed },
  });

  revalidatePath('/user/settings');
  return { success: true };
}
export async function updateAvatar(url: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Не авторизован');

  await prisma.user.update({
    where: { email: session.user.email },
    data: { image: url },
  });

  revalidatePath('/user/settings');
}
