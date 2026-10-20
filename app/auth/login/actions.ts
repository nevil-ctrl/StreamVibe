'use server';

import { prisma, withRetry } from '@/lib/prisma';
import { generateVerificationToken } from '@/services/auth-token.service';
import { sendVerificationEmail } from '@/services/mail.service';
import { normalizeEmail } from '@/lib/normalize-email';

/**
 * Проверяет статус аккаунта пользователя по его email (для вывода дружественных ошибок).
 */
export async function checkAccountStatus(email: string) {
  const normalizedEmail = normalizeEmail(email);

  try {
    const user = await withRetry(
      () =>
        prisma.user.findFirst({
          where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
          select: {
            id: true,
            emailVerified: true,
            isBanned: true,
            banExpiresAt: true,
          },
        }),
      3,
    );

    if (!user) {
      return { exists: false };
    }

    const isBanActive = user.isBanned && (!user.banExpiresAt || user.banExpiresAt > new Date());

    return {
      exists: true,
      emailVerified: !!user.emailVerified,
      isBanned: isBanActive,
    };
  } catch (error) {
    console.error('Ошибка проверки статуса аккаунта:', error);
    return { error: 'Не удалось проверить статус аккаунта' };
  }
}

/**
 * Отправляет повторную ссылку для подтверждения почты.
 */
export async function resendVerificationLink(email: string) {
  const normalizedEmail = normalizeEmail(email);

  try {
    const user = await withRetry(
      () =>
        prisma.user.findFirst({
          where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
        }),
      3,
    );

    if (!user) {
      return { success: false, message: 'Пользователь не найден' };
    }

    if (user.emailVerified) {
      return { success: false, message: 'Почта уже подтверждена' };
    }

    const verificationToken = await generateVerificationToken(user.email);
    const emailResult = await sendVerificationEmail(
      user.email,
      verificationToken.token,
    );

    if (!emailResult.success) {
      return { success: false, message: 'Не удалось отправить письмо. Попробуйте позже.' };
    }

    return { success: true, message: 'Письмо с подтверждением отправлено!' };
  } catch (error) {
    console.error('Ошибка при повторной отправке письма подтверждения:', error);
    return { success: false, message: 'Произошла непредвиденная ошибка.' };
  }
}
