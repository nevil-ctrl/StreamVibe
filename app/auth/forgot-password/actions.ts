'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generatePasswordResetToken } from '@/services/auth-token.service';
import { sendPasswordResetEmail } from '@/services/mail.service';

/**
 * Запрос сброса пароля: генерирует 6-значный код и отправляет на почту.
 */
export async function requestPasswordReset(email: string) {
  if (!email) {
    return { success: false, message: 'Укажите email адрес.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Для безопасности не раскрываем, зарегистрирован ли email
      return { success: true, message: 'Если этот email зарегистрирован, на него отправлен код сброса.' };
    }

    if (!user.password) {
      return { success: false, message: 'Этот аккаунт зарегистрирован через Google. Используйте вход через Google.' };
    }

    const resetToken = await generatePasswordResetToken(email);
    const emailResult = await sendPasswordResetEmail(email, resetToken.token);

    if (!emailResult.success) {
      return { success: false, message: 'Не удалось отправить письмо с кодом. Попробуйте позже.' };
    }

    return { success: true, message: 'Код подтверждения отправлен на вашу почту.' };
  } catch (error) {
    console.error('Ошибка запроса сброса пароля:', error);
    return { success: false, message: 'Произошла ошибка при отправке запроса.' };
  }
}

/**
 * Сброс пароля с использованием 6-значного кода.
 */
export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string,
) {
  if (!email || !code || !newPassword) {
    return { success: false, message: 'Заполните все обязательные поля.' };
  }

  try {
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: code },
    });

    if (!resetRecord || resetRecord.email !== email) {
      return { success: false, message: 'Неверный код сброса пароля.' };
    }

    const hasExpired = new Date(resetRecord.expiresAt) < new Date();
    if (hasExpired) {
      await prisma.passwordResetToken.delete({
        where: { token: code },
      });
      return { success: false, message: 'Срок действия кода истек. Запросите новый.' };
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль пользователя
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Удаляем использованный токен сброса
    await prisma.passwordResetToken.delete({
      where: { token: code },
    });

    return { success: true, message: 'Пароль успешно изменен! Теперь вы можете войти.' };
  } catch (error) {
    console.error('Ошибка сброса пароля по коду:', error);
    return { success: false, message: 'Не удалось сбросить пароль. Попробуйте еще раз.' };
  }
}
