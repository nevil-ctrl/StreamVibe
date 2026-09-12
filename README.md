# 🎬 StreamVibe

StreamVibe — это современный стриминговый сервис и полноценный клон Netflix, построенный на базе Next.js, Prisma и Stripe. Проект включает в себя каталог фильмов, систему подписок, интеграцию с популярными видеоплеерами и адаптивный интерфейс для комфортного просмотра контента.

---

## 🚀 Основные возможности (Features)

- **Каталог фильмов и сериалов:** Интеграция с TMDB API для получения актуальной информации, постеров и рейтингов.
- **Мультипровайдерный плеер:** Поддержка нескольких источников воспроизведения (`voidboost`, `moviesapi`, `superembed`, `kinobox`, `vidsrc`) для максимальной стабильности.
- **Система подписок:** Полноценный цикл оплаты и управления тарифными планами через Stripe.
- **Авторизация:** Безопасный вход в систему с помощью NextAuth.js.
- **Уведомления:** Встроенная система email-оповещений на базе Resend.
- **Современный стек:** Next.js (App Router), Tailwind CSS, Prisma ORM и база данных PostgreSQL.

🌐 **Демо-версия проекта:** [stream-vibe-gstl.vercel.app](https://stream-vibe-gstl.vercel.app/)

---

## 📋 Требования для локального запуска

Перед началом убедитесь, что у вас установлены:
- **Node.js** версии `v18+`
- **Docker Desktop** (для запуска базы данных)
- **Git**
- **Stripe CLI** *(исполняемый файл `stripe.exe` уже находится в корне проекта)*

---

## ⚙️ Быстрый старт (Local Setup)

### 1. Окружение и переменные
Создайте файл `.env` в корне проекта и заполните его по примеру из `.env.example`:
```bash
cp .env.example .env
```

Пример заполнения конфигурации:
```env
DATABASE_URL="postgresql://admin:password@localhost:5433/streamvibe"
NEXTAUTH_SECRET=your_secret_key_here

STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx

TMDB_API_KEY=xxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxx
```

### 2. Запуск базы данных и миграции
Запустите контейнер с PostgreSQL и разверните структуру таблиц:
```bash
# Запуск контейнера в фоне
docker-compose up -d

# Создание таблиц и генерация Prisma Client
npx prisma migrate dev
npx prisma generate
```
*Панель управления базой данных (опционально): `npx prisma studio` (доступна на `http://localhost:5555`).*

### 3. Настройка Stripe Webhooks
Для корректной обработки тестовых платежей локально:
```bash
# 1. Авторизация в Stripe (выполняется один раз)
./stripe login

# 2. Запуск прослушивания вебхуков (не закрывайте этот терминал)
./stripe listen --forward-to localhost:3000/api/stripe/webhook
```
*Скопируйте полученный в терминале `whsec_...` и вставьте его в переменную `STRIPE_WEBHOOK_SECRET` в вашем `.env`.*

### 4. Запуск приложения
В новом окне терминала запустите сервер разработки Next.js:
```bash
npm run dev
```
Приложение будет доступно по адресу: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Тестирование оплаты (Stripe Test)

1. Перейдите на страницу тарифных планов и нажмите **«Оформить подписку»**.
2. На тестовой платежной форме Stripe используйте следующую карту:
   - **Номер:** `4242 4242 4242 4242`
   - **Срок действия / CVC / ZIP:** Любые корректные данные из будущего.
3. После успешной оплаты в терминале Stripe CLI должно отобразиться событие `checkout.session.completed` со статусом `200 OK`.

---

## 🛠 Полезные команды

| Команда | Описание |
| :--- | :--- |
| `docker-compose up -d` | Запуск базы данных PostgreSQL |
| `docker-compose down` | Остановка контейнера БД |
| `npx prisma migrate dev` | Применение новых миграций базы данных |
| `npx prisma studio` | Открытие веб-интерфейса для просмотра БД |
| `npm run dev` | Запуск локального сервера разработки |
