# 🔔 Система уведомлений StreamVibe

## Что было сделано

Полноценная система уведомлений с доставкой через Stripe Webhook, отображением в шапке (колокольчик) и отдельной страницей в профиле.

---

## Архитектура

```
Stripe Webhook
      ↓
checkout.session.completed  →  prisma.notification.create()
invoice.payment_failed      →  prisma.notification.create()
customer.subscription.deleted → prisma.notification.create()
      ↓
PostgreSQL (таблица Notification)
      ↓
GET /api/notifications  ←  колокольчик в Navbar (polling каждые 30 сек)
                        ←  страница /user/notifications
```

---

## Файлы и что делает каждый

### `lib/notifications.ts` — хелпер создания уведомлений

```ts
createNotification({ userId, type, title, message });
```

Вызывай из любого места где нужно отправить уведомление пользователю.
Типы: `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `SUBSCRIPTION_ACTIVATED`,
`SUBSCRIPTION_EXPIRED`, `SUBSCRIPTION_CANCELLED`, `ADMIN_MESSAGE`, `INFO`

### `app/api/notifications/route.ts` — REST API

| Метод                  | Что делает                                           |
| ---------------------- | ---------------------------------------------------- |
| `GET`                  | Возвращает список уведомлений + кол-во непрочитанных |
| `PATCH`                | Отмечает все как прочитанные                         |
| `DELETE { id }`        | Удаляет одно уведомление                             |
| `DELETE { all: true }` | Очищает все уведомления пользователя                 |

### `app/api/notifications/admin/route.ts` — отправка от админа

POST-запрос с телом `{ userId, type, title, message }`.
Доступен только пользователям с ролью `ADMIN`.
Готов к использованию когда будешь делать админку.

### `app/api/stripe/webhook/route.ts` — Stripe Webhook

Обрабатывает три события:

- `checkout.session.completed` → создаёт Payment + Subscription + уведомление об успешной оплате
- `invoice.payment_failed` → помечает подписку EXPIRED + уведомление об ошибке
- `customer.subscription.deleted` → помечает подписку CANCELLED + уведомление об отмене

### `components/layout/Navbar.tsx` — колокольчик в шапке

Компонент `NotificationBell`:

- Загружает уведомления при монтировании
- Обновляет каждые 30 секунд (polling)
- Показывает бейдж с числом непрочитанных
- При открытии отмечает все как прочитанные (PATCH)
- Можно удалить каждое уведомление отдельно (иконка корзины при hover)

### `app/user/notifications/page.tsx` — страница уведомлений в профиле

- Полный список всех уведомлений
- Режим выбора нескольких (`Выбрать`) → удаление выбранных
- Закрепление уведомлений (иконка булавки при hover) — закреплённые всегда сверху
- Кнопка "Очистить всё"
- Кнопка обновления

### `lib/constants.ts`

Добавлен пункт меню `Уведомления` с иконкой `Bell` и путём `/user/notifications`.

---

## Prisma схема (модель уже была в schema.prisma)

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String   // тип уведомления
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId, isRead])
}
```

---

## Как добавить уведомление из своего кода

```ts
import { createNotification } from '@/lib/notifications';

// Например, после любого важного события:
await createNotification({
  userId: 'user_id_здесь',
  type: 'ADMIN_MESSAGE',
  title: 'Важное сообщение',
  message: 'Текст уведомления который увидит пользователь.',
});
```

---

## Как отправить уведомление из будущей админки

```ts
// POST /api/notifications/admin
fetch('/api/notifications/admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'cuid_пользователя',
    type: 'ADMIN_MESSAGE',
    title: 'Ответ поддержки',
    message: 'Ваш тикет #123 был рассмотрен...',
  }),
});
```

---

## Локальная разработка — Stripe

Stripe не может достучаться до `localhost` напрямую.
Нужен Stripe CLI который форвардит события:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

CLI выдаст `whsec_...` — это твой локальный webhook secret.
Прописать в `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

> ⚠️ На проде в Stripe Dashboard нужен отдельный webhook secret —
> он отличается от локального!

---

## Команды которые нужно запустить после изменений в Prisma

```bash
npx prisma generate   # обновить TypeScript типы клиента
npx prisma db push    # применить изменения схемы к БД (dev)
# или
npx prisma migrate dev --name название_миграции  # создать миграцию (prod)
```

> Если видишь ошибку `"notification" не существует в типе PrismaClient` —
> это значит забыл запустить `npx prisma generate`.
