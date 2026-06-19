'use server';

import { prisma, withRetry } from '@/lib/prisma';
import { generateVerificationToken } from '@/services/auth-token.service';
import { sendVerificationEmail } from '@/services/mail.service';

/**
 * Проверяет статус аккаунта пользователя по его email (для вывода дружественных ошибок).
 */
export async function checkAccountStatus(email: string) {
  try {
    const user = await withRetry(
      () =>
        prisma.user.findUnique({
          where: { email },
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
  try {
    const user = await withRetry(
      () =>
        prisma.user.findUnique({
          where: { email },
        }),
      3,
    );

    if (!user) {
      return { success: false, message: 'Пользователь не найден' };
    }

    if (user.emailVerified) {
      return { success: false, message: 'Почта уже подтверждена' };
    }

    const verificationToken = await generateVerificationToken(email);
    const emailResult = await sendVerificationEmail(email, verificationToken.token);

    if (!emailResult.success) {
      return { success: false, message: 'Не удалось отправить письмо. Попробуйте позже.' };
    }

    return { success: true, message: 'Письмо с подтверждением отправлено!' };
  } catch (error) {
    console.error('Ошибка при повторной отправке письма подтверждения:', error);
    return { success: false, message: 'Произошла непредвиденная ошибка.' };
  }
}
