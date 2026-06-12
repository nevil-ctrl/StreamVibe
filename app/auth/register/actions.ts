'use server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateVerificationToken } from '@/services/auth-token.service';
import { sendVerificationEmail } from '@/services/mail.service';

// Используем _error, чтобы ESLint не ругался на неиспользуемую переменную
export async function registerUser(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = (formData.get('name') as string)?.trim();

  if (!name) {
    return { success: false, message: 'Укажите имя' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: null, // Почта изначально не подтверждена
      },
    });

    // Создаем токен подтверждения и отправляем email
    const verificationToken = await generateVerificationToken(user.email);
    const emailResult = await sendVerificationEmail(user.email, verificationToken.token);

    if (!emailResult.success) {
      return {
        success: true,
        message: 'Вы успешно зарегистрировались, но не удалось отправить письмо для подтверждения почты. Пожалуйста, обратитесь в поддержку или запросите повторную отправку при входе.',
      };
    }

    return { success: true };
  } catch (_error) {
    console.error('Ошибка регистрации:', _error);
    return {
      success: false,
      message: 'Ошибка регистрации: пользователь уже существует',
    };
  }
}

