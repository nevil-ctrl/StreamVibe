'use server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function registerUser(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = (formData.get('name') as string)?.trim();

  if (!email || !password) {
    return { success: false, message: 'Заполните email и пароль' };
  }

  if (!name) {
    return { success: false, message: 'Укажите имя' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    return { success: true };
  } catch (_error) {
    console.error('Ошибка регистрации:', _error);
    return {
      success: false,
      message: 'Ошибка регистрации: пользователь уже существует',
    };
  }
}
