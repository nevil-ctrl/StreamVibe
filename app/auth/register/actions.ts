'use server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Используем _error, чтобы ESLint не ругался на неиспользуемую переменную
export async function registerUser(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return { success: true };
  } catch (_error) {
    return {
      success: false,
      message: 'Ошибка регистрации: пользователь уже существует',
    };
  }
}
