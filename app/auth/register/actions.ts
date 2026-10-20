'use server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { normalizeEmail } from '@/lib/normalize-email';

export async function registerUser(_prevState: unknown, formData: FormData) {
  const rawEmail = formData.get('email');
  const rawPassword = formData.get('password');
  const rawName = formData.get('name');
  const email =
    typeof rawEmail === 'string' ? normalizeEmail(rawEmail) : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';
  const name = typeof rawName === 'string' ? rawName.trim() : '';

  if (!email || !password) {
    return { success: false, message: 'Заполните email и пароль' };
  }

  if (!name) {
    return { success: false, message: 'Укажите имя' };
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Пользователь с таким Email уже зарегистрирован',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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
      message: 'Не удалось создать аккаунт. Попробуйте позже.',
    };
  }
}
