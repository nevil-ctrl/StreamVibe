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

### `lib/constants.ts`

---

> Если видишь ошибку `"notification" не существует в типе PrismaClient` —
> это значит забыл запустить `npx prisma generate`.
