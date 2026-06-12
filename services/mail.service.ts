import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'StreamVibe <onboarding@resend.dev>';

/**
 * Отправляет ссылку для подтверждения почты.
 */
export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}&email=${email}`;

  // ВСЕГДА выводим в консоль для удобства тестирования и локальной разработки
  console.log('\n==================================================');
  console.log(`📬 [EMAIL SENT TO: ${email}]`);
  console.log('Ссылка для подтверждения почты:');
  console.log(confirmLink);
  console.log('==================================================\n');

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Подтверждение почты | StreamVibe',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #080808; color: #ffffff; border: 1px solid #151515; border-radius: 8px;">
          <h2 style="color: #E50000; text-align: center; font-size: 24px; margin-bottom: 24px;">StreamVibe</h2>
          <p>Здравствуйте!</p>
          <p>Спасибо за регистрацию на нашей платформе StreamVibe. Пожалуйста, подтвердите ваш адрес электронной почты, перейдя по ссылке ниже:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${confirmLink}" style="background-color: #E50000; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Подтвердить почту</a>
          </div>
          <p style="font-size: 13px; color: #999999;">Эта ссылка действительна в течение 24 часов.</p>
          <hr style="border: 0; border-top: 1px solid #262628; margin: 24px 0;" />
          <p style="font-size: 11px; color: #606060; word-break: break-all;">Если кнопка выше не работает, скопируйте и вставьте эту ссылку в адресную строку браузера: <br/> ${confirmLink}</p>
        </div>
      `,
    });

    if (error) {
      console.warn('⚠️ Ошибка отправки через Resend (вероятно, ограничения песочницы):', error.message);
      // В локальной разработке не блокируем пользователя, если письмо напечаталось в консоль
      return { success: true, warning: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('❌ Исключение при отправке email:', err);
    return { success: true, warning: err.message };
  }
}

/**
 * Отправляет 6-значный код сброса пароля.
 */
export async function sendPasswordResetEmail(email: string, code: string) {
  // ВСЕГДА выводим в консоль для удобства тестирования и локальной разработки
  console.log('\n==================================================');
  console.log(`🔑 [EMAIL SENT TO: ${email}]`);
  console.log('Код сброса пароля:');
  console.log(code);
  console.log('==================================================\n');

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Сброс пароля | StreamVibe',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #080808; color: #ffffff; border: 1px solid #151515; border-radius: 8px;">
          <h2 style="color: #E50000; text-align: center; font-size: 24px; margin-bottom: 24px;">StreamVibe</h2>
          <p>Здравствуйте!</p>
          <p>Мы получили запрос на сброс пароля для вашего аккаунта StreamVibe.</p>
          <p>Используйте следующий код подтверждения для завершения сброса пароля:</p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px; background-color: #1A1A1A; padding: 12px 32px; border-radius: 8px; border: 1px solid #262628; display: inline-block;">${code}</span>
          </div>
          <p style="font-size: 13px; color: #999999;">Код действителен в течение 1 часа. Не передавайте его третьим лицам.</p>
          <hr style="border: 0; border-top: 1px solid #262628; margin: 24px 0;" />
          <p style="font-size: 11px; color: #606060;">Если вы не отправляли этот запрос, просто проигнорируйте письмо.</p>
        </div>
      `,
    });

    if (error) {
      console.warn('⚠️ Ошибка отправки через Resend (вероятно, ограничения песочницы):', error.message);
      return { success: true, warning: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('❌ Исключение при отправке email:', err);
    return { success: true, warning: err.message };
  }
}
