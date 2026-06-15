# 🚀 StreamVibe — Local Development Setup

Полная инструкция по запуску проекта локально: база данных PostgreSQL, Prisma, Stripe Webhooks и запуск Next.js.

---

# 📋 Requirements

Перед началом убедитесь, что установлены:

- **Node.js** `v18+`
- **Docker Desktop**
- **Git**
- **Stripe CLI** _(stripe.exe уже находится в корне проекта и добавлен в `.gitignore`)_

---

# ⚙️ 1. Environment Setup

Создайте `.env` файл в корне проекта:

```bash
cp .env.example .env
```

Заполните необходимые переменные окружения:

- Stripe API Keys
- Database URL
- TMDB API Key
- Resend API Key
- Auth Secret
- OAuth Providers (если используются)

Пример:

```env
DATABASE_URL="postgresql://admin:password@localhost:5433/streamvibe"

NEXTAUTH_SECRET=your_secret

STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx

TMDB_API_KEY=xxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxx
```

---

# 🐘 2. Database Setup (PostgreSQL + Prisma)

## Запуск PostgreSQL через Docker

Если используется `docker-compose.yml`, выполните:

```bash
docker-compose up -d
```

Проверить запущенные контейнеры:

```bash
docker ps
```

> PostgreSQL по умолчанию работает на порту `5433`.

---

## Prisma Migration

Создайте таблицы в базе данных:

```bash
npx prisma migrate dev
```

---

## Prisma Client Generation

Сгенерируйте Prisma Client:

```bash
npx prisma generate
```

---

## Prisma Studio (Optional)

Запуск визуальной панели управления БД:

```bash
npx prisma studio
```

Prisma Studio будет доступна:

```txt
http://localhost:5555
```

---

# 💳 3. Stripe Webhooks Setup

Для локального тестирования оплаты необходимо запустить Stripe Webhook Listener.

## Авторизация Stripe CLI

Выполняется **один раз**.

### Windows (Git Bash)

```bash
./stripe login
```

Откройте ссылку из терминала и подтвердите авторизацию в браузере.

---

## Запуск Webhook Listener

После авторизации выполните:

```bash
./stripe listen --forward-to localhost:3000/api/stripe/webhook
```

> ⚠️ Не закрывайте терминал. Он должен работать во время тестирования оплаты.

---

## Обновление `.env`

После запуска `stripe listen`

```txt
Your webhook signing secret is:

whsec_xxxxxxxxxxxxxxxxxxxxx
```

Скопируйте ключ и вставьте в `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

# ▶️ 4. Start Development Server

Откройте **новый терминал** и запустите Next.js:

```bash
npm run dev
```

Приложение будет доступно:

```txt
http://localhost:3000
```

---

# 🔧 Что было исправлено

- Добавлены новые источники плеера для `WatchMovieClient` и страницы просмотра фильма:
  - `voidboost`
  - `moviesapi`
- Сохранена работа существующих провайдеров:
  - `superembed`
  - `kinobox`
  - `vidsrc`
- Упрощено и унифицировано использование провайдеров между экраном детали фильма и экраном воспроизведения.

Почему это важно:
- Для фильма `Michael` основной плеер раньше мог зависать из-за проблем с конкретным iframe-источником.
- Новые провайдеры дают более стабильные fallback-опции и быстрее загружаются.

---

# 🧪 5. Payment Testing

1. Откройте страницу подписок.
2. Нажмите **«Оформить подписку»**.
3. Вы будете перенаправлены на тестовую страницу Stripe.
4. Используйте тестовую карту:

```txt
4242 4242 4242 4242
```

Любые значения:

- Expiration Date → в будущем
- CVC → любой
- ZIP Code → любой

---

## Successful Payment Check

После оплаты:

- Stripe вернёт пользователя в приложение
- В терминале `stripe listen` появится событие:

```txt
checkout.session.completed
```

Со статусом:

```txt
200 OK
```

---

# ✅ Features Included

- PostgreSQL Database
- Prisma ORM + Migrations
- Stripe Payments
- Stripe Webhooks
- Subscription System
- Notification System
- NextAuth Authentication
- TMDB Integration

---

# 🛠 Useful Commands

### Start Database

```bash
docker-compose up -d
```

### Stop Database

```bash
docker-compose down
```

### Run Prisma Migration

```bash
npx prisma migrate dev
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Open Prisma Studio

```bash
npx prisma studio
```

## Stripe (Local Testing)

```Login to Stripe CLI

./stripe login

Start Webhook Listener

    ./stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Run Development Server

```bash
npm run dev
```
