import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

/**
 * Создает новый токен подтверждения почты и удаляет старые для указанного email.
 */
export async function generateVerificationToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Ссылка живет 24 часа

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
}

/**
 * Проверяет токен подтверждения и активирует аккаунт пользователя.
 */
export async function verifyEmailToken(token: string) {
  const existingToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!existingToken) {
    return { success: false, message: 'Ссылка недействительна или уже использована.' };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    await prisma.verificationToken.delete({
      where: { token },
    });
    return { success: false, message: 'Срок действия ссылки истек. Запросите новую.' };
  }

  // Активируем аккаунт
  await prisma.user.update({
    where: { email: existingToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Удаляем использованный токен
  await prisma.verificationToken.delete({
    where: { token },
  });

  return { success: true };
}

/**
 * Создает 6-значный код для сброса пароля.
 */
export async function generatePasswordResetToken(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Код действителен 1 час

  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token: code,
      expiresAt,
    },
  });

  return resetToken;
}
