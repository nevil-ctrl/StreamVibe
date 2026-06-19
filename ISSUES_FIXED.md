# Исправленные ошибки

## ✅ Завершено

### 1. UploadThing FetchError при загрузке аватара
**Файлы:** `app/api/uploadthing/core.ts`, `app/user/settings/SettingsClient.tsx`

**Изменения:**
- Добавлена обработка ошибок в middleware авторизации
- Добавлена валидация размера и типа файла перед загрузкой
- Добавлены try-catch блоки в `onClientUploadComplete` и `onUploadError`
- Добавлено логирование ошибок для отладки

---

### 2. Проверка подписки при клике Play
**Файл:** `app/actions/watch.actions.ts`

**Изменения:**
- Добавлена функция `fetchUserHasActiveSubscription()` перед редиректом на плеер
- Если подписка неактивна → редирект на `/subscriptions`
- Применено для обоих: `startWatchingMovie()` и `startWatchingShow()`

---

### 3. Исправлена логика уведомлений при оплате
**Файл:** `app/api/stripe/webhook/route.ts`

**Изменения:**
- ✅ Добавлена проверка существования пользователя перед созданием уведомления
- ✅ Уведомление отправляется ТОЛЬКО тому пользователю, который оплатил (по userId из metadata)
- ✅ Добавлена валидация `userId` и `plan` из metadata
- ✅ Добавлены try-catch блоки вокруг операций в БД
- ✅ Добавлено логирование всех этапов: успехи и ошибки
- ✅ Исправлена обработка `invoice.payment_failed` и `customer.subscription.deleted` событий

---

## ⏳ Осталось сделать

### 1. Оптимизация database connections (КРИТИЧНО)
**Файл:** `lib/prisma.ts`

**Проблема:** 
- Connection timeout к Neon при холодном старте
- Недостаточно агрессивный retry механизм
- Малое значение `connectionTimeoutMillis`

**Что нужно:**
```typescript
// Увеличить timeout с 30s до 60s
connectionTimeoutMillis: 60000,  // было 30000

// Увеличить retry попытки с 1 на 2-3
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,  // было 1
): Promise<T>

// Увеличить задержку между попытками
await new Promise((r) => setTimeout(r, 2000));  // было 1000
```

---

### 2. Оптимизировать запросы к БД
**Файлы:** 
- `app/movies/[id]/page.tsx` - использовать `.catch()` с fallback
- `services/subscription.ts` - добавить select для меньшего размера ответа
- `lib/subscription.ts` - применить `withRetry` для критичных запросов

**Что нужно:**
```typescript
// В subscription.ts добавить withRetry
export async function fetchUserHasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const subscription = await withRetry(
      () =>
        prisma.subscription.findUnique({
          where: { userId },
          select: { status: true, expiresAt: true },  // ← важно!
        }),
      3,  // 3 попытки вместо 2
    );
    return hasActiveSubscription(subscription);
  } catch (error) {
    console.error('[Subscription Query Error]', error);
    return false;  // fallback: нет подписки
  }
}
```

---

### 3. Добавить fallback при timeout запросов
**Файлы:**
- `app/watch/movie/[id]/page.tsx`
- `app/watch/tv/[id]/page.tsx`

**Что нужно:**
- Увеличить timeout для `Promise.all()` запросов
- Добавить обработку "graceful degradation" для некритичных запросов

---

### 4. Проверить стандартную подписку
**Файл:** `lib/subscription.ts` или новый код

**Проблема:** 
- Новые пользователи без подписки вообще не могут смотреть
- Должна быть FREE/BASIC подписка по умолчанию

**Что нужно:**
```typescript
// При создании пользователя автоматически создать BASIC подписку
// Или изменить logic: 
// - BASIC план = лучше качество, платный
// - или BASIC = бесплатный с ограничениями
```

---

### 5. Протестировать все исправления

**Чек-лист:**
- [ ] Загрузить аватар (проверить что работает без FetchError)
- [ ] Попробовать смотреть фильм БЕЗ подписки (должен редирект на /subscriptions)
- [ ] Оформить подписку (проверить что уведомление приходит только тебе)
- [ ] Проверить плеер открывается с премиум подпиской
- [ ] Проверить уведомления на странице профиля
- [ ] Проверить логи в консоли на ошибки БД

---

## 📋 Ошибки которые могут быть в консоли

### Database Connection Timeout
```
Error: Connection terminated due to connection timeout
```
**Решение:** Увеличить `connectionTimeoutMillis` в `lib/prisma.ts`

### FetchError в UploadThing
```
FetchError: Something went wrong. Please contact UploadThing
```
**Решение:** ✅ Исправлено - добавлена обработка ошибок и валидация

### Не приходят уведомления
**Решение:** ✅ Исправлено - уведомления создаются с правильным userId

### Плеер не открывается с премиумом
**Решение:** ✅ Исправлено - добавлена проверка подписки в `startWatchingMovie()`

---

## 🚀 Приоритет исправлений

1. **СРОЧНО:** Оптимизировать DB connections (timeout, retry)
2. **ВАЖНО:** Протестировать все изменения
3. **НУЖНО:** Разобраться с default подпиской для новых пользователей
4. **МОЖНО:** Добавить логирование для отладки

