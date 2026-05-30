import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: session.user.id,
  type: 'PAYMENT_SUCCESS',
  title: 'Оплата прошла успешно',
  message: `Подписка ${plan} активирована до ${expiresAt.toLocaleDateString('ru-RU')}.`,
});
