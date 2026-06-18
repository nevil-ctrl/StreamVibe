# PROJECT_ANALYSIS.md — StreamVibe

> Полный технический разбор экзаменационного проекта **StreamVibe** для подготовки к защите.  
> Стек: Next.js 16 + React 19 + TypeScript + Prisma + PostgreSQL + Stripe + TMDB.

---

## 1. ОБЩИЙ ОБЗОР ПРОЕКТА

### Назначение и цель

**StreamVibe** — веб-приложение в стиле Netflix для просмотра фильмов и сериалов. Пользователь может:

- просматривать каталог контента (данные из **The Movie Database — TMDB**);
- смотреть фильмы/сериалы через **iframe-плееры** сторонних embed-сервисов;
- регистрироваться, входить (email/password + Google OAuth);
- оформлять **подписку через Stripe** (Basic / Standard / Premium);
- вести **историю просмотра**, избранное, watchlist;
- оставлять **отзывы** (локально в PostgreSQL);
- обращаться в **поддержку** (тикеты);
- получать **in-app уведомления**;
- управлять профилем, cookie consent, локалью (RU/EN).

Администраторы (`ADMIN`, `SUPERADMIN`) имеют панель `/admin`: статистика, пользователи, тикеты, рассылки, аналитика.

### Технологический стек

| Категория | Технологии |
|-----------|------------|
| **Framework** | Next.js 16.2.6 (App Router), React 19.2.4 |
| **Язык** | TypeScript 5 |
| **Стили** | Tailwind CSS v4, tailwindcss-animate, tailwind-merge |
| **БД** | PostgreSQL 15 (Docker), Prisma 7.8 + `@prisma/adapter-pg` + `pg` |
| **Auth** | NextAuth v5 (Auth.js), `@auth/prisma-adapter`, bcryptjs |
| **Платежи** | Stripe 22.x |
| **Email** | Resend |
| **Аналитика** | PostHog (posthog-js + posthog-node), PageView в PostgreSQL |
| **Загрузка файлов** | UploadThing |
| **Контент** | TMDB REST API |
| **Валидация** | Zod 4 |
| **UI** | lucide-react, @icons-pack/react-simple-icons |
| **Экспорт отчётов (admin)** | jspdf, jspdf-autotable, xlsx |
| **DevOps** | Docker Compose, cross-env, dotenv-cli |

### Тип архитектуры

**Монолитное full-stack приложение** на Next.js:

- фронтенд и бэкенд в одном репозитории;
- API — Route Handlers в `app/api/**/route.ts`;
- бизнес-логика — `services/*.ts` + Server Actions в `app/actions/`;
- БД — один PostgreSQL через Prisma.

Это **не** монорепо и **не** микросервисы. Внешние сервисы (TMDB, Stripe, Resend, PostHog, embed-плееры) подключаются как интеграции.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   TMDB API  │────▶│   services/  │────▶│   Prisma    │
└─────────────┘     └──────────────┘     └─────────────┘
                            │                    │
                            ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  app/pages   │◀────│  PostgreSQL │
                    └──────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ components/  │
                    └──────────────┘
```

---

### ❓ ВОЗМОЖНЫЕ ВОПРОСЫ НА ЭКЗАМЕНЕ

**1. Что делает StreamVibe?**  
Стриминговая платформа: каталог из TMDB, просмотр через embed-плееры, auth, подписки Stripe, история просмотра, админка.

**2. Почему монолит, а не микросервисы?**  
Экзаменационный проект: один Next.js обрабатывает UI, API и SSR; проще деплой и меньше инфраструктуры.

**3. Откуда берётся контент фильмов?**  
Метаданные — TMDB API. Полные фильмы — сторонние embed-провайдеры (superembed, vidsrc и др.), не TMDB.

**4. Какая БД и почему PostgreSQL?**  
PostgreSQL — реляционная БД для пользователей, подписок, истории, тикетов; хорошо работает с Prisma и транзакциями.

**5. Чем Next.js App Router отличается от Pages Router?**  
Маршруты в `app/`, Server Components по умолчанию, layouts, Server Actions, Route Handlers вместо `pages/api`.

---

## 2. СТРУКТУРА ФАЙЛОВ И ПАПОК

### Дерево проекта

```
stream-vibe/
├── app/                          # Next.js App Router — страницы, API, actions
│   ├── layout.tsx                # Корневой layout (шрифт, Providers, Header/Footer)
│   ├── page.tsx                  # Главная (/)
│   ├── globals.css               # Tailwind v4 + CSS-переменные
│   ├── actions/                  # Server Actions (watch, review, locale)
│   ├── api/                      # REST API (26 route handlers)
│   ├── auth/                     # Login, register, verify-email, forgot-password
│   ├── admin/                    # Админ-панель (layout + role guard)
│   ├── user/                     # Личный кабинет (Sidebar layout)
│   ├── watch/                    # Fullscreen-плеер (movie/tv)
│   ├── movies/[id]/              # Страница фильма
│   ├── shows/[id]/               # Страница сериала
│   ├── browse/, search/          # Каталог и поиск
│   ├── subscriptions/            # Тарифы + Stripe checkout
│   ├── support/, privacy/, terms/
│   └── error.tsx, not-found.tsx
├── components/                   # React-компоненты
│   ├── layout/                   # Header, Footer, Navbar, Sidebar, контроллеры
│   ├── player/                   # PlayerViewport, VideoPlayer (legacy)
│   ├── detail/                   # DetailHero, Reviews, Seasons...
│   ├── sections/                 # Hero, Browse, Pricing, Categories
│   ├── admin/                    # AdminDashboard, AdminUsers...
│   ├── consent/                  # CookieConsent (GDPR)
│   ├── providers/                # PostHog, Analytics, Locale, Consent
│   ├── search/, ui/, user/
│   └── Providers.tsx             # Корневой композит провайдеров
├── services/                     # Бизнес-логика (TMDB, watch, review, mail...)
├── lib/                          # Утилиты: prisma, stripe, providers, consent, i18n
├── hooks/                        # useProviderManager, useWatchProgress
├── types/                        # TypeScript-типы (movie, show, api, next-auth...)
├── config/                       # env.ts, env.server.ts, env.public.ts
├── prisma/
│   ├── schema.prisma             # Схема БД
│   └── migrations/               # SQL-миграции
├── public/                       # Статика (svg, logo)
├── docs/                         # PLAYER.md, ADMIN.md, NOTIFICATIONS.md...
├── scripts/                      # make-admin.ts, seed-users.js
├── auth.ts                       # Конфиг NextAuth (корень проекта)
├── proxy.ts                      # Middleware-логика (⚠️ не подключена — см. раздел 10)
├── next.config.ts                # CSP, images
├── docker-compose.yaml           # PostgreSQL на порту 5433
├── package.json
└── .env.example
```

### Разделение фронтенда и бэкенда

| Слой | Где | Как работает |
|------|-----|--------------|
| **UI (Client)** | `components/`, `*Client.tsx` | `'use client'`, useState, fetch, hooks |
| **UI (Server)** | `app/**/page.tsx` | async Server Components, прямой вызов `services/` |
| **API** | `app/api/**/route.ts` | REST для клиентских fetch (Stripe, notifications, progress) |
| **Server Actions** | `app/actions/`, `app/auth/**/actions.ts` | `'use server'`, формы, redirect, revalidatePath |
| **Бизнес-логика** | `services/*.ts` | Prisma + TMDB, переиспользуется из pages и API |
| **БД** | `lib/prisma.ts` + `prisma/schema.prisma` | Singleton PrismaClient |

**Роутинг** — файловая система Next.js: `app/movies/[id]/page.tsx` → `/movies/123`.

**Конфиги:**
- `next.config.ts` — CSP, remote images (TMDB, Google, UploadThing);
- `tsconfig.json` — алиас `@/*` → корень проекта;
- `prisma.config.ts` — путь к schema и migrations;
- `auth.ts` — NextAuth providers и JWT callbacks.

---

### ❓ ВОЗМОЖНЫЕ ВОПРОСЫ НА ЭКЗАМЕНЕ

**1. За что отвечает папка `services/`?**  
Серверная бизнес-логика: запросы к TMDB, работа с Prisma (история, отзывы, поиск), отправка email.

**2. Где API-эндпоинты?**  
В `app/api/**/route.ts` — каждый файл экспортирует `GET`, `POST`, `PATCH` и т.д.

**3. Чем Server Action отличается от API route?**  
Server Action вызывается из форм/компонентов напрямую (`'use server'`), API route — через HTTP fetch.

**4. Где конфиг аутентификации?**  
`auth.ts` в корне + handler `app/api/auth/[...nextauth]/route.ts`.

**5. Зачем `proxy.ts`?**  
Задуман как middleware для защиты `/user`, `/admin`, `/watch` — но файл **не подключён** (нет `middleware.ts`).

---

## 3. ЗАВИСИМОСТИ И ОКРУЖЕНИЕ

### Production-зависимости (`package.json`)

| Пакет | Назначение в проекте |
|-------|---------------------|
| `next`, `react`, `react-dom` | Основной фреймворк и UI |
| `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg` | ORM + драйвер PostgreSQL |
| `next-auth`, `@auth/prisma-adapter` | Аутентификация, OAuth, JWT-сессии |
| `bcryptjs` | Хеширование паролей при регистрации |
| `stripe` | Checkout Sessions, webhooks |
| `resend` | Email: верификация, сброс пароля, support |
| `uploadthing`, `@uploadthing/react` | Загрузка аватаров |
| `posthog-js`, `posthog-node` | Продуктовая аналитика (client) |
| `zod` | Валидация body в API (support и др.) |
| `lucide-react` | Иконки |
| `@icons-pack/react-simple-icons` | SVG-иконки брендов |
| `tailwind-merge`, `tailwindcss-animate` | Утилиты Tailwind |
| `jspdf`, `jspdf-autotable`, `xlsx` | Экспорт отчётов в admin |
| `cross-env`, `dotenv` | Env в скриптах |
| `tailwindcss` | Стили (v4) |

### Dev-зависимости

| Пакет | Назначение |
|-------|------------|
| `typescript`, `@types/*` | Типизация |
| `eslint`, `eslint-config-next` | Линтинг |
| `prettier` | Форматирование |
| `@tailwindcss/postcss`, `tailwindcss` | Сборка CSS |
| `dotenv-cli` | Загрузка `.env` в prisma-скриптах |

### Скрипты npm

| Скрипт | Команда | Зачем |
|--------|---------|-------|
| `postinstall` | `prisma generate` | Генерация Prisma Client после `npm install` |
| `dev` | `next dev` (+ ipv4first) | Локальная разработка |
| `build` | `next build` | Production-сборка |
| `start` | `next start` | Запуск prod-сервера |
| `lint` | `next lint` | ESLint |
| `db:push` | `dotenv -e .env -- prisma db push` | Синхронизация schema → БД |
| `db:gen` | `dotenv -e .env -- prisma generate` | Генерация клиента |
| `db:studio` | `dotenv -e .env -- prisma studio` | GUI для БД (порт 5555) |

### Переменные окружения (`.env.example`)

| Переменная | Где используется | Зачем |
|------------|------------------|-------|
| `NEXT_PUBLIC_APP_URL` | Stripe checkout success/cancel URLs | Базовый URL приложения |
| `NEXT_PUBLIC_API_URL` | `config/env.ts` | URL API (задекларирован) |
| `NEXTAUTH_URL` | NextAuth, mail links | Callback URL auth |
| `AUTH_SECRET` | NextAuth JWT | Подпись сессии |
| `JWT_SECRET`, `API_SECRET` | `config/env.server.ts` | Серверные секреты (валидация) |
| `DATABASE_URL` | Prisma, `lib/prisma.ts` | PostgreSQL connection string |
| `NEXT_PUBLIC_S3_URL`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | `config/env.ts` | **Задекларированы, в коде не используются** (аватары через UploadThing) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | `auth.ts` | Google OAuth |
| `NODE_TLS_REJECT_UNAUTHORIZED=0` | Node.js | Отключение проверки TLS (dev) |
| `TMDB_API_KEY`, `TMDB_ACCESS_TOKEN` | `services/tmdb.ts`, proxy `/api/tmdb` | Доступ к TMDB |
| `NEXT_PUBLIC_TMDB_*` | Клиент (если нужен) | Публичные ключи TMDB |
| `DEMO_STREAM_URL` | `lib/watch-constants.ts` | Demo MP4 для HTML5-плеера |
| `RESEND_API_KEY`, `SUPPORT_EMAIL` | `services/mail.service.ts`, support API | Email |
| `STRIPE_SECRET_KEY` | `lib/stripe.ts` | Серверные операции Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Клиент (если нужен) | Публичный ключ |
| `STRIPE_WEBHOOK_SECRET` | `app/api/stripe/webhook/route.ts` | Проверка подписи webhook |
| `UPLOADTHING_TOKEN` | UploadThing | Загрузка аватаров |
| `NEXT_PUBLIC_GA_ID` | `config/env.ts` | Google Analytics (опционально) |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | `PostHogProvider.tsx` | **Не в .env.example**, но нужны для PostHog |

### Запуск локально

```bash
docker-compose up -d          # PostgreSQL :5433
cp .env.example .env          # заполнить ключи
npx prisma migrate dev        # миграции
npm run dev                   # http://localhost:3000
./stripe listen --forward-to localhost:3000/api/stripe/webhook  # Stripe webhooks
```

---

### ❓ ВОЗМОЖНЫЕ ВОПРОСЫ НА ЭКЗАМЕНЕ

**1. Зачем `postinstall: prisma generate`?**  
Prisma Client генерируется из `schema.prisma` и должен быть актуален после каждого `npm install`.

**2. Почему PostgreSQL на порту 5433?**  
В `docker-compose.yaml` маппинг `5433:5432` — чтобы не конфликтовать с локальным PostgreSQL.

**3. Какие env обязательны для старта?**  
Минимум: `DATABASE_URL`, `AUTH_SECRET`, `TMDB_ACCESS_TOKEN`, ключи Stripe/Resend для соответствующих функций.

**4. Зачем cross-env NODE_OPTIONS=--dns-result-order=ipv4first?**  
Обход DNS-проблем Node.js при fetch к внешним API на Windows.

**5. Чем `db:push` отличается от `migrate dev`?**  
`db push` — быстрая синхронизация без истории миграций; `migrate dev` — версионированные SQL-файлы в `prisma/migrations/`.

---

## 4. АРХИТЕКТУРА И ЛОГИКА БЭКЕНДА

### Как устроен сервер

Next.js **не использует отдельный Express-сервер**. Бэкенд — это:

1. **Route Handlers** (`app/api/**/route.ts`) — REST API;
2. **Server Actions** (`'use server'`) — мутации с форм;
3. **Server Components** — прямой вызов `services/` и Prisma на сервере при рендере.

Точка входа auth: `auth.ts` → экспорт `{ handlers, auth, signIn, signOut }`.

Prisma singleton: `lib/prisma.ts` — один `PrismaClient` через `@prisma/adapter-pg` + `pg.Pool`, кеш в `global` для dev hot-reload.

### Middleware / защита маршрутов

Файл `proxy.ts` содержит логику middleware:
- редирект неавторизованных с `/user`, `/admin`, `/watch` → `/auth/login`;
- редирект авторизованных с `/auth/*` → `/browse`;
- бан → `/banned`;
- `/admin` только для `ADMIN` / `SUPERADMIN`.

**⚠️ Проблема:** нет файла `middleware.ts`, который экспортирует эту функцию — middleware **не активен**. Защита дублируется в layouts и отдельных pages (см. раздел 10).

### Аутентификация и авторизация

**Файл:** `auth.ts`

| Provider | Логика |
|----------|--------|
| **Google OAuth** | `AUTH_GOOGLE_ID/SECRET`, PrismaAdapter, `allowDangerousEmailAccountLinking` |
| **Credentials** | email + bcrypt password; ошибки `ACCOUNT_BANNED`, `EMAIL_NOT_VERIFIED` |

**Session strategy:** JWT (не database sessions для runtime, хотя таблица `Session` есть через adapter).

**JWT callback** (`auth.ts:91-124`): при первом входе пишет `id`, `role`, `isBanned`; каждые 5 минут обновляет из БД.

**Роли:** `USER`, `ADMIN`, `SUPERADMIN` (`types/role.ts`, enum в Prisma).

**Регистрация:**
- Server Action `app/auth/register/actions.ts` — основной путь: bcrypt → User → verification token → Resend email;
- API `POST /api/auth/register` — альтернативный путь **без** email verification (дубликат логики).

### Все API-эндпоинты

#### Аутентификация

| Метод | Путь | Auth | Body | Ответ | Логика |
|-------|------|------|------|-------|--------|
| POST | `/api/auth/register` | — | `{ email, password, name? }` | 201 / 400 | bcrypt, create User |
| GET, POST | `/api/auth/[...nextauth]` | — | NextAuth | session/callbacks | handlers из `auth.ts` |

#### Stripe

| Метод | Путь | Auth | Body | Ответ | Логика |
|-------|------|------|------|-------|--------|
| POST | `/api/stripe/checkout` | Session | `{ plan: BASIC\|STANDARD\|PREMIUM }` | `{ url }` | Stripe Checkout Session, metadata `{ userId, plan }` |
| POST | `/api/stripe/webhook` | Stripe signature | raw event | `{ received: true }` | `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted` |

#### Уведомления

| Метод | Путь | Auth | Body/Query | Ответ |
|-------|------|------|------------|-------|
| GET | `/api/notifications` | Session | — | `{ notifications[50], unreadCount }` |
| PATCH | `/api/notifications` | Session | — | mark all read |
| DELETE | `/api/notifications` | Session | `{ id }` или `{ all: true }` | delete |
| POST | `/api/notifications/admin` | ADMIN only | `{ userId, title, message, type? }` | single notification |
| GET, POST | `/api/admin/notifications` | ADMIN+ | broadcast params | mass send / recent |
| GET | `/api/alerts` | — | — | `{ alerts: [] }` **stub** |

#### Support

| Метод | Путь | Auth | Body | Ответ |
|-------|------|------|------|-------|
| GET | `/api/support` | Session | — | user tickets + replies |
| POST | `/api/support` | Session | `{ firstName, lastName, email, phone?, message }` (Zod) | create ticket + email admin |
| POST | `/api/support/reply` | Session | `{ ticketId, message, fromAdmin? }` | create reply |

#### Просмотр и метрики

| Метод | Путь | Auth | Body | Ответ |
|-------|------|------|------|-------|
| POST | `/api/watch/progress` | Session | `{ movieId\|showId, progressSeconds, durationSeconds, episodeId? }` | progress / consent skip |
| POST | `/api/metrics/pageview` | Optional | `{ path }` | PageView id или skipped |

#### TMDB / поиск

| Метод | Путь | Auth | Params | Ответ |
|-------|------|------|--------|-------|
| GET | `/api/tmdb` | — | `path` (TMDB path) | JSON proxy |
| GET | `/api/search/movies` | — | `q, genre, sort, page, year` | MovieResponse |
| GET | `/api/search/suggestions` | — | `q` | до 8 suggestions |
| GET | `/api/tv/[id]/info` | — | `id` | `{ number_of_seasons }` |
| GET | `/api/tv/[id]/season/[seasonNumber]` | — | `id, seasonNumber` | TMDBSeasonDetail |

#### Upload

| Метод | Путь | Auth | Логика |
|-------|------|------|--------|
| GET, POST | `/api/uploadthing` | Session (avatarUploader) | image ≤2MB, 1 file |

#### Admin

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/api/admin/stats` | ADMIN+ | dashboard stats, charts, top content |
| GET | `/api/admin/analytics` | ADMIN only (SUPERADMIN → 403 bug) | revenue, views, tickets |
| GET | `/api/admin/users` | ADMIN+ | paginated users + subscription |
| POST, DELETE | `/api/admin/users/[id]/ban` | ADMIN+ | ban/unban + AuditLog |
| PATCH | `/api/admin/users/[id]/role` | ADMIN only | change role |
| PATCH | `/api/admin/system/change-role` | SUPERADMIN only | change any role + AuditLog |
| GET | `/api/admin/tickets` | ADMIN+ | tickets list |
| POST | `/api/admin/tickets/[id]` | ADMIN+ | **stub** `{ success, id }` |
| PATCH | `/api/admin/tickets/[id]` | ADMIN+ | reply + status + notification + email |

### Бизнес-логика — где реализована

| Модуль | Файл | Ответственность |
|--------|------|-----------------|
| TMDB HTTP | `services/tmdb.ts` | `fetchTMDB<T>(path)` с Bearer token, cache 1h |
| Фильмы/сериалы | `services/movies.service.ts`, `shows.service.ts` | lists, popular, trending |
| Детали | `services/media-detail.service.ts` | movie/show/season detail |
| Поиск | `services/search.service.ts` | unified search + discover |
| Локальный контент | `services/content.service.ts` | ensureMovieInDb, comments, recordWatch |
| История | `services/watch-history.service.ts` | progress, favorites, watchlist, stats |
| Отзывы | `services/review.service.ts` | Comment CRUD |
| Email tokens | `services/auth-token.service.ts` | verification, password reset |
| Email send | `services/mail.service.ts` | Resend + console fallback |
| Уведомления | `lib/notifications.ts` | `createNotification()` helper |
| Consent | `lib/consent/server.ts` | gate для watch history и pageviews |

### Server Actions (ключевые)

| Файл | Actions |
|------|---------|
| `app/actions/watch.actions.ts` | `startWatchingMovie`, `startWatchingShow`, `toggleFavoriteMedia`, `toggleWatchlistMedia` |
| `app/actions/review.actions.ts` | create/update/delete review |
| `app/auth/login/actions.ts` | login via signIn |
| `app/auth/register/actions.ts` | registerUser |
| `app/user/settings/actions.ts` | update profile |

---

### ❓ ВОЗМОЖНЫЕ ВОПРОСЫ НА ЭКЗАМЕНЕ

**1. Как проверяется auth в API route?**  
`const session = await auth()` из `auth.ts`; при отсутствии — `401` или `403`.

**2. Почему JWT, а не database session?**  
В `auth.ts:18`: `session: { strategy: 'jwt' }` — меньше запросов к БД на каждый request; role обновляется в jwt callback раз в 5 мин.

**3. Что делает webhook Stripe?**  
На `checkout.session.completed` создаёт Payment, upsert Subscription, Notification; на failed/deleted — меняет status подписки.

**4. Где gate для cookie consent на сервере?**  
`lib/consent/server.ts` → `canRecordWatchHistory()` в watch actions и `/api/watch/progress`.

**5. Зачем прокси `/api/tmdb`?**  
Скрывает Bearer token TMDB от клиента; клиент передаёт только `path`.

---

## 5. ФРОНТЕНД — АРХИТЕКТУРА И КОМПОНЕНТЫ

### Структура компонентов

| Группа | Примеры | Роль |
|--------|---------|------|
| **layout/** | Header, Navbar, Sidebar, FooterController | Chrome приложения, условная видимость |
| **sections/** | Hero, BrowsePage, PricingSection | Landing и каталог |
| **detail/** | DetailHero, ReviewsSection, SeasonsAccordion | Страницы `/movies/[id]`, `/shows/[id]` |
| **player/** | PlayerViewport, PlayerSkeleton | Fullscreen `/watch/*` |
| **admin/** | AdminDashboard, AdminUsers | Админ UI + fetch к `/api/admin/*` |
| **consent/** | CookieConsent | GDPR баннер |
| **providers/** | PostHogProvider, AnalyticsTracker | Analytics, pageviews |

### Layout-система

```
app/layout.tsx
├── Providers (Locale → Session → Consent → PostHog)
├── HeaderController  — скрыт на /admin, /user, /watch, /auth
├── MainWrapper
└── FooterController  — скрыт на /admin, /user, /auth

app/user/layout.tsx   → Sidebar + SessionProvider(session)
app/admin/layout.tsx  → Sidebar admin + role redirect
app/watch/layout.tsx  → .hide-layout (fullscreen)
```

### Стейт-менеджмент

**Глобального store (Redux/Zustand) нет.**

| Паттерн | Где |
|---------|-----|
| React Context | `LocaleProvider`, `ConsentProvider`, NextAuth `SessionProvider` |
| useState/useCallback | Формы, плеер, admin tables, subscriptions |
| URL state | searchParams (season/episode, Stripe success) |
| Server state | Server Components fetch + `revalidatePath` после actions |
| Singleton | `consentManager` (`lib/consent/consent-manager.ts`) |

### Роутинг

App Router — файловая маршрутизация:

| URL | Файл |
|-----|------|
| `/` | `app/page.tsx` |
| `/movies/[id]` | `app/movies/[id]/page.tsx` |
| `/watch/movie/[id]` | `app/watch/movie/[id]/page.tsx` |
| `/user/profile` | `app/user/profile/page.tsx` |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` |
| `/subscriptions` | `app/subscriptions/page.tsx` |

Dynamic segments: `[id]`, `[seasonNumber]`. Query: `?t=`, `?season=&episode=`, `?success=true`.

### Взаимодействие с бэкендом

| Способ | Пример |
|--------|--------|
| **Прямой вызов services** | Server page: `getMovieDetail(id)` |
| **Server Actions** | `startWatchingMovie()` → redirect `/watch/...` |
| **fetch → API** | `useWatchProgress` → POST `/api/watch/progress` |
| **fetch → API** | SubscriptionsClient → POST `/api/stripe/checkout` |
| **fetch → API** | SearchPage → `/api/search/movies` |
| **NextAuth** | `signIn()`, `signOut()`, `useSession()` |

### UI и стили

- **Tailwind CSS v4** — `@import "tailwindcss"` в `app/globals.css`;
- **Design tokens:** `--red-45` (#E50000), `--black-06` (#0F0F0F);
- **Шрифт:** Manrope (latin + cyrillic);
- **Иконки:** lucide-react;
- **Тёмная Netflix-like тема:** `bg-[#0F0F0F]`, акцент `#E50000`;
- **i18n:** `lib/i18n/` — RU/EN через Context + cookie locale.

---

### ❓ ВОЗМОЖНЫЕ ВОПРОСЫ НА ЭКЗАМЕНЕ

**1. Server vs Client Component — когда что?**  
Server — fetch данных, auth, SEO; Client — интерактив (плеер, формы, hooks). Директива `'use client'`.

**2. Почему нет Redux?**  
Состояние локальное или server-driven; Context для locale/consent/session достаточно.

**3. Как Navbar получает уведомления?**  
Polling `GET /api/notifications` каждые ~30 сек (см. `docs/NOTIFICATIONS.md`).

**4. Зачем два SessionProvider?**  
Root `Providers.tsx` + `user/layout.tsx` передаёт server session в sidebar-страницы.

**5. Как скрывается header на /watch?**  
`HeaderController` проверяет pathname + CSS `.hide-layout` в watch layout.

---

## 6. БАЗА ДАННЫХ И PRISMA

### Какая БД

**PostgreSQL 15** в Docker (`docker-compose.yaml`):
- user: `admin`, password: `password`, db: `streamvibe`, port: `5433`.

Prisma 7 с **driver adapter** (`@prisma/adapter-pg`) вместо встроенного binary engine — см. `lib/prisma.ts`.

### Полная схема моделей

#### User и Auth (NextAuth)

```prisma
User          — id, email, password, role, ban fields, relations
Account       — OAuth accounts (Google)
Session       — session tokens (adapter)
VerificationToken — email verification
PasswordResetToken — сброс пароля
```

#### Подписки и платежи

```prisma
Subscription  — userId (unique), plan, status, expiresAt
Payment       — userId, amount, currency, plan, status, providerId?
```

#### Контент (локальный кеш TMDB)

```prisma
Movie         — id (= TMDB id string), title, posterPath
Show          — id, name, posterPath
```

#### Пользовательская активность

```prisma
Favorite      — userId + movieId/showId (unique pairs)
Rating        — userId + movieId/showId + rating 1-10
WatchHistory  — progress, episodeId, isFinished
Comment       — отзывы пользователей
```

#### Support, Admin, Analytics

```prisma
SupportTicket, TicketReply
Notification
PageView      — path, duration, userAgent, statusCode
AuditLog      — admin actions (USER_BAN, SUB_MODIFY...)
```

### Enums

| Enum | Значения |
|------|----------|
| `Role` | USER, ADMIN, SUPERADMIN |
| `SubscriptionPlan` | BASIC, STANDARD, PREMIUM |
| `SubscriptionStatus` | ACTIVE, CANCELLED, EXPIRED |
| `PaymentStatus` | PENDING, SUCCESS, FAILED, REFUNDED |
| `TicketStatus` | OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| `AdminAction` | USER_BAN, USER_UNBAN, SUB_MODIFY, ... |

### Связи (с примерами из проекта)

| Тип | Пример | Код |
|-----|--------|-----|
| **One-to-one** | User ↔ Subscription | `userId @unique` в Subscription |
| **One-to-many** | User → WatchHistory[] | `user WatchHistory[]` |
| **One-to-many** | Movie → Comment[] | фильм может иметь много отзывов |
| **Many-to-many (через поля)** | User ↔ Movie через Favorite | `@@unique([userId, movieId])` |
| **Optional FK** | Favorite.movieId? / showId? | либо фильм, либо сериал |

**Хитрость:** избранное и watchlist **не отдельные таблицы** — маркеры `FAVORITE`/`WATCHLIST` кодируются в поле `WatchHistory.episodeId` через `lib/watch-constants.ts` (формат `[FAVORITE,WATCHLIST]episodeTmdbId`).

### Миграции

Папка `prisma/migrations/` — хронология:

| Миграция | Суть |
|----------|------|
| `20260526200147_init_streamvibe` | Начальная схема |
| `20260530112640_add_support_tickets` | Support |
| `20260530133427_add_notifications` | Notifications |
| `20260603164708_db_update` | Обновления |
| `20260604102556_add_new_features` | Новые фичи |
| `20260604112517_add_fields_to_pageview` | PageView fields |
| `20260604122254_update_schema_entities` | Финальные правки |

Команды:
```bash
npx prisma migrate dev    # dev: создать/применить миграцию
npx prisma generate       # сгенерировать client
npx prisma studio         # GUI
```

### Использование Prisma Client

**Единственная точка создания:** `lib/prisma.ts`.

Примеры:
- `auth.ts` — findUnique user при login;
- `services/watch-history.service.ts` — upsert WatchHistory;
- `app/api/stripe/webhook/route.ts` — payment + subscription + notification;
- `app/user/profile/page.tsx` — prisma.user.findUnique + stats.

---

### ❓ ВОЗМОЖНЫЕ ВОПРОСЫ НА ЭКЗАМЕНЕ

**1. Почему Movie.id — String, а не autoincrement?**  
ID = TMDB ID (например `"550"`), чтобы синхронизировать с внешним API без маппинга.

**2. Как хранится избранное без таблицы Favorite?**  
Через маркеры в `episodeId` + таблица Favorite в schema **тоже есть**, но основная логика в watch-history.service использует markers в episodeId.

**3. Что такое Prisma adapter-pg?**  
Prisma 7 использует JS-драйвер `pg` через адаптер вместо Rust query engine — см. `lib/prisma.ts:14-15`.

**4. Зачем @@index на частых полях?**  
Ускорение запросов: `[userId, isRead]` для notifications, `[userId]` для watch history.

**5. Как определяется «просмотр завершён»?**  
`isFinished = true` когда progress ≥ 90% duration — в `updateWatchProgress()`.

---

## 7. ВНЕШНИЕ СЕРВИСЫ И ИНТЕГРАЦИИ

### Stripe — полный поток оплаты

```
┌──────────────┐    POST /api/stripe/checkout     ┌─────────────┐
│ Subscriptions│ ────────────────────────────────▶│ Stripe API  │
│ Client.tsx   │    { plan: "STANDARD" }          │ Checkout    │
└──────────────┘                                  └──────┬──────┘
       ▲                                                  │
       │         redirect success_url                     │ user pays
       │    /subscriptions?success=true&plan=STANDARD     ▼
       │                                         ┌─────────────────┐
       │                                         │ Stripe Webhook  │
       │                                         │ checkout.session│
       │                                         │ .completed      │
       └─────────────────────────────────────────┴────────┬────────
                                                            │
                    POST /api/stripe/webhook ◀──────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │ prisma.payment.create       │
              │ prisma.subscription.upsert  │
              │ prisma.notification.create  │
              └─────────────────────────────┘
```

**Шаги:**

1. Пользователь на `/subscriptions` нажимает «Subscribe» (`SubscriptionsClient.tsx:163`).
2. `POST /api/stripe/checkout` с `{ plan }` — нужна session (`checkout/route.ts:15-19`).
3. Сервер создаёт Checkout Session: mode `subscription`, цена **$0.25/мес** (демо), metadata `{ userId, plan }` (`checkout/route.ts:29-55`).
4. Клиент редиректит на `data.url` (Stripe Hosted Checkout).
5. После оплаты Stripe шлёт webhook `checkout.session.completed`.
6. Webhook (`webhook/route.ts:29-75`):
   - создаёт `Payment` (status SUCCESS);
   - upsert `Subscription` (ACTIVE, expiresAt +1 month);
   - создаёт Notification `PAYMENT_SUCCESS`.
7. Пользователь возвращается на success_url с toast.

**Другие события webhook:**
- `invoice.payment_failed` → subscription EXPIRED + notification;
- `customer.subscription.deleted` → CANCELLED + notification.

**Локальная отладка:** `./stripe listen --forward-to localhost:3000/api/stripe/webhook` (README.md).

**Конфиг:** `lib/stripe.ts` — API version `2026-05-27.dahlia`.

### TMDB (The Movie Database)

| Файл | Роль |
|------|------|
| `services/tmdb.ts` | `fetchTMDB<T>()` — Bearer auth, revalidate 3600s |
| `services/movies.service.ts`, `shows.service.ts` | Lists, detail |
| `lib/tmdb-images.ts` | URL постеров `image.tmdb.org/t/p/w500` |
| `app/api/tmdb/route.ts` | Server proxy для клиента |

TMDB даёт **метаданные и трейлеры**, не полные фильмы.

### Resend (Email)

`services/mail.service.ts`:
- verification email (ссылка в console + Resend);
- password reset (6-digit code);
- support replies (`app/api/admin/tickets/[id]/route.ts`).

Fallback: при ошибке Resend возвращает `{ success: true }` и пишет в console — для dev.

### PostHog (Analytics)

- `components/providers/PostHogProvider.tsx` — init на клиенте;
- `components/providers/AnalyticsTracker.tsx` — pageviews в БД (consent-gated);
- `components/providers/MediaViewTracker.tsx` — event `movie_view`;
- `lib/consent/analytics.ts` — sync consent с PostHog opt-in/out.

**Правило:** PostHog только client-side, не в SSR.

### UploadThing

- `app/api/uploadthing/core.ts` — `avatarUploader`: image ≤2MB;
- `app/user/settings/SettingsClient.tsx` — загрузка аватара;
- `lib/uploadthing.ts` — typed `useUploadThing` helper.

### S3 / MinIO

Переменные в `.env.example` и `config/env.ts`, но **прямого использования AWS SDK в коде нет** — storage через UploadThing (`utfs.io`).

### Плееры (видео)

#### A. Основной путь — iframe embed (`/watch/*`)

| Файл | Роль |
|------|------|
| `lib/providers.ts` | 5 провайдеров: superembed, vidsrc, vidsrcme, 2embed, videasy |
| `hooks/useProviderManager.ts` | Failover, timeout 15s, postMessage progress |
| `components/player/PlayerViewport.tsx` | iframe UI + touch overlay |
| `app/watch/movie/[id]/WatchMovieClient.tsx` | Fullscreen movie |
| `app/watch/tv/[id]/WatchTvClient.tsx` | Fullscreen TV |

**Логика useProviderManager:**
1. Берёт провайдер по `priority`;
2. Строит URL через `getMovieUrl` / `getTvUrl`;
3. При timeout/error → следующий провайдер;
4. Слушает `window.postMessage` → `onProgress(currentTime, duration)`;
5. На touch — overlay «нажми Play» (`needsInteraction`).

**Сохранение прогресса:** `useWatchProgress` → debounce 5s → POST `/api/watch/progress`.

**Resume URLs:**
- Фильм: `/watch/movie/{id}?t={seconds}`
- Сериал: `/watch/tv/{id}?season=2&episode=5&episodeId=...`

#### B. Legacy — HTML5/YouTube (`VideoPlayer.tsx`)

- `services/tmdb-videos.service.ts` — YouTube trailer + demo MP4 (`DEMO_STREAM_URL`);
- `components/player/VideoPlayer.tsx` — кастомные controls, fullscreen;
- **Не импортируется** текущим watch flow (orphan component).

#### C. CSP для iframe

`next.config.ts:17-32` — на `/watch/*` ослабленный CSP (`frame-src *`), чтобы embed-плееры работали.

---

### ❓ ВОЗМОЖНЫЕ ВОПРОСЫ НА ЭКЗАМЕНЕ

**1. Почему Stripe webhook, а не только success_url?**  
success_url можно подделать; webhook с signature (`STRIPE_WEBHOOK_SECRET`) — надёжное подтверждение оплаты на сервере.

**2. Откуда берутся фильмы для просмотра?**  
Не из TMDB — из сторонних embed (multiembed.mov, vidsrc.to и др.) через iframe.

**3. Как работает failover плеера?**  
`useProviderManager`: 15s timeout или iframe onError → `tryNextProvider()` → следующий из `ALL_PROVIDERS`.

**4. Зачем postMessage?**  
Embed-плееры на другом origin шлют progress через `postMessage`; `player-utils.ts` парсит и фильтрует по whitelist origins.

**5. Почему demo цена $0.25?**  
Комментарий в `checkout/route.ts:6` — для демонстрации на экзамене, не production pricing.

---

## 8. TYPESCRIPT — ОСОБЕННОСТИ В ПРОЕКТЕ

### Ключевые типы и интерфейсы

| Файл | Типы |
|------|------|
| `types/role.ts` | `Role` const object + union type |
| `types/movie.ts`, `types/show.ts` | TMDB list items |
| `types/media-detail.ts` | `MovieDetail`, `ShowDetail`, `LocalComment` |
| `types/tmdb.ts` | `TMDBMediaItem`, paginated responses |
| `types/api.ts` | `ApiResponse<T>` |
| `types/search.ts` | `SearchMoviesParams` |
| `types/next-auth.d.ts` | Module augmentation для Session/JWT |
| `lib/providers.ts` | `Provider` interface |
| `services/tmdb-videos.service.ts` | Discriminated union `PlaybackSource` |
| `lib/consent/types.ts` | `ConsentCategory`, `ConsentPreferences` |
| `lib/watch-constants.ts` | `WatchMarker`, `EpisodeMeta` |

### Module augmentation (NextAuth)

```typescript
// types/next-auth.d.ts
declare module 'next-auth' {
  interface Session {
    user: { id: string; role: Role; isBanned: boolean; ... } & DefaultSession['user'];
  }
}
```

Позволяет типизировать `session.user.role` без `as any`.

### Дженерики

| Место | Пример |
|-------|--------|
| `services/tmdb.ts:6` | `fetchTMDB<T>(path: string): Promise<T>` |
| `types/api.ts:1` | `ApiResponse<T>` |
| `lib/uploadthing.ts` | `generateReactHelpers<OurFileRouter>()` |

Использование:
```typescript
const data = await fetchTMDB<MovieResponse>('/movie/popular');
```

### Discriminated unions

```typescript
// services/tmdb-videos.service.ts
export type PlaybackSource =
  | { kind: 'mp4'; url: string; label: string }
  | { kind: 'youtube'; key: string; label: string };
```

TypeScript сужает тип по `kind` в switch/if.

### Type guards

```typescript
// lib/watch-constants.ts:22-24
.filter((m): m is WatchMarker => m === 'FAVORITE' || m === 'WATCHLIST');
```

### Enum vs const

Prisma генерирует enums (`Role`, `SubscriptionPlan`). В TS-коде дублируется `types/role.ts` как const object для использования без import из `@prisma/client` на клиенте.

### Async params (Next.js 15+)

```typescript
// app/watch/movie/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}
```

Params/searchParams — Promise, нужен `await`.

---

### ❓ ВОЗМОЖНЫЕ ВОПРОСЫ НА ЭКЗАМЕНЕ

**1. Зачем module augmentation для next-auth?**  
Расширить стандартный тип Session кастомными полями (`role`, `isBanned`).

**2. Что даёт fetchTMDB<T>?**  
Type-safe ответ API: один generic-параметр для разных TMDB endpoints.

**3. Чем discriminated union лучше optional fields?**  
`kind: 'mp4'` гарантирует наличие `url`, `kind: 'youtube'` — `key`; меньше runtime ошибок.

**4. Что такое `m is WatchMarker`?**  
User-defined type guard — TypeScript понимает тип после filter.

**5. Зачем `as const` в Role?**  
Literals `'USER' | 'ADMIN' | 'SUPERADMIN'` вместо generic string.

---

## 9. ПОТОКИ ДАННЫХ — КАК ВСЁ СВЯЗАНО

### Общая схема

```
Пользователь (браузер)
        │
        ▼
┌───────────────────┐
│  React UI         │  Client Components / Server Components
│  (components/,    │
│   app/page.tsx)   │
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
Server Action   fetch /api/*
    │           │
    ▼           ▼
services/*.ts   app/api/**/route.ts
    │           │
    └─────┬─────┘
          ▼
    lib/prisma.ts ──▶ PostgreSQL
          │
          ▼
    External APIs (TMDB, Stripe, Resend, embed players)
```

### User Flow 1: Регистрация и вход

```
1. /auth/register → RegisterForm
2. registerUser (Server Action) → prisma.user.create
3. generateVerificationToken → sendVerificationEmail (Resend + console)
4. /auth/verify-email?token=... → emailVerified = now()
5. /auth/login → signIn('credentials') → auth.ts authorize → JWT session
6. session.user.role доступен в components через useSession()
```

### User Flow 2: Просмотр фильма

```
1. /movies/550 → getMovieDetail(550) [TMDB + local DB]
2. DetailHero "Play" → startWatchingMovie (Server Action)
   → ensureMovieInDb + recordMovieWatch (if consent)
   → redirect /watch/movie/550
3. WatchMoviePage: auth() guard → WatchMovieClient
4. useProviderManager → iframe superembed/vidsrc/...
5. postMessage progress → useWatchProgress → POST /api/watch/progress
6. canRecordWatchHistory() → updateWatchProgress → WatchHistory table
7. Resume: /watch/movie/550?t=120
```

### User Flow 3: Подписка Stripe

```
1. /subscriptions → auth + prisma.subscription
2. Click plan → fetch POST /api/stripe/checkout { plan }
3. Redirect Stripe Hosted Checkout
4. Pay → webhook checkout.session.completed
5. DB: Payment + Subscription + Notification
6. Redirect /subscriptions?success=true → UI toast
7. Navbar notifications poll → новое PAYMENT_SUCCESS
```

### User Flow 4: Admin ban user

```
1. /admin/users → AdminUsers → GET /api/admin/users
2. Ban button → POST /api/admin/users/[id]/ban { reason }
3. prisma.user.update isBanned=true
4. prisma.auditLog.create action=USER_BAN
5. При следующем login: authorize throws ACCOUNT_BANNED
```

### Передача данных между слоями

| Данные | Откуда → Куда |
|--------|---------------|
| TMDB metadata | TMDB API → services → Server Component props |
| Session | auth.ts JWT → Server pages / API routes |
| Watch progress | iframe postMessage → hook → API → Prisma |
| Consent | Cookie → server.ts → gate API/actions |
| i18n | Cookie locale → getLocale() → LocaleProvider |

---

### ❓ ВОЗМОЖНЫЕ ВОПРОСЫ НА ЭКЗАМЕНЕ

**1. Опишите путь данных при сохранении прогресса.**  
iframe postMessage → useProviderManager.onProgress → useWatchProgress (debounce 5s) → POST /api/watch/progress → canRecordWatchHistory → watch-history.service → Prisma.

**2. Когда данные идут через Server Action, а когда через API?**  
Actions — form mutations (start watch, toggle favorite); API — client polling, Stripe, progress debounce.

**3. Как TMDB связан с локальной БД?**  
При первом watch/favorite вызывается `ensureMovieInDb` — upsert Movie/Show с TMDB id.

**4. Как cookie consent влияет на поток?**  
Без functional/personalization consent — watch history не пишется (actions и API возвращают saved: false).

**5. Как admin broadcast доходит до user?**  
POST /api/admin/notifications → prisma.notification.createMany → Navbar GET /api/notifications.

---

## 10. ЧТО НЕ РАБОТАЕТ / НЕ ДОДЕЛАНО

### Критичные проблемы

| # | Проблема | Файл | Последствие |
|---|----------|------|-------------|
| 1 | **`proxy.ts` не подключён как middleware** | `proxy.ts` (нет `middleware.ts`) | Глобальная защита `/user`, `/watch`, ban redirect **не работает** на уровне middleware; частично компенсируется проверками в pages/layouts |
| 2 | **Страница `/banned` не существует** | `proxy.ts:47` редирект | При бане — 404 (если middleware когда-нибудь включат) |
| 3 | **`/api/admin/analytics` блокирует SUPERADMIN** | `analytics/route.ts:13-14` | SUPERADMIN получает 403 (явный баг — двойная проверка role) |

### Заглушки и незавершённый функционал

| # | Что | Где |
|---|-----|-----|
| 4 | `/api/alerts` возвращает `{ alerts: [] }` | `app/api/alerts/route.ts` — legacy stub |
| 5 | `POST /api/admin/tickets/[id]` — stub без логики | `admin/tickets/[id]/route.ts:6-19` |
| 6 | `VideoPlayer.tsx`, `PlayerSection.tsx` — **не импортируются** нигде | orphan/legacy компоненты |
| 7 | **Yearly billing** в UI (`SubscriptionsClient`) не передаётся в Stripe | checkout всегда `interval: 'month'` |
| 8 | **S3 env** объявлены, но не используются | avatars через UploadThing |
| 9 | **`Payment.providerId`** в schema не заполняется webhook'ом | нет связи payment ↔ Stripe session id |
| 10 | **Дублирование регистрации**: API `/api/auth/register` не шлёт verification email | vs Server Action в `register/actions.ts` |
| 11 | **`RU_PROVIDERS` пуст** — все провайдеры multi/en | `lib/providers.ts:74-75` |
| 12 | **docs/PLAYER.md устарел** — упоминает kinobox, timeout 8s | код: 5 провайдеров, timeout 15s |

### Что может упасть при запуске

| Условие | Почему |
|---------|--------|
| Нет `DATABASE_URL` | Prisma не подключится |
| Нет `AUTH_SECRET` | NextAuth ошибка |
| Нет `TMDB_ACCESS_TOKEN` | Пустой каталог, 500 на detail pages |
| PostgreSQL не запущен | `docker-compose up -d` не выполнен |
| Stripe webhook secret неверный | Оплата пройдёт, но Subscription не создастся в БД |
| Resend не настроен | Регистрация работает (console.log link), email может не дойти |
| PostHog keys отсутствуют | Ошибка init PostHog на клиенте |
| Embed-провайдеры недоступны | Плеер переключается между источниками; если все fail — чёрный экран |

### Чего не хватает для production

- [ ] Подключить `middleware.ts` (экспорт из `proxy.ts`)
- [ ] Страница `/banned`
- [ ] Реальные цены Stripe + yearly plans
- [ ] Связь Stripe Customer ID ↔ User
- [ ] Сохранение `providerId` в Payment
- [ ] Rate limiting на API
- [ ] E2E тests
- [ ] Удалить дублирующий `/api/auth/register` или синхронизировать с verification flow
- [ ] PostHog keys в `.env.example`
- [ ] Проверка активной подписки перед `/watch` (сейчас только auth)
- [ ] HTTPS, secure cookies, убрать `NODE_TLS_REJECT_UNAUTHORIZED=0`

### Рабочие части (для демо на экзамене)

✅ Каталог TMDB, search, detail pages  
✅ Fullscreen player с failover  
✅ Auth (credentials + Google), email verification  
✅ Stripe checkout + webhook (с stripe listen)  
✅ Watch history, favorites, watchlist  
✅ Notifications, support tickets  
✅ Admin dashboard, users, ban, broadcasts  
✅ Cookie consent GDPR  
✅ i18n RU/EN  
✅ Achievements badges на profile  

---

### ❓ ВОЗМОЖНЫЕ ВОПРОСЫ НА ЭКЗАМЕНЕ

**1. Почему middleware не работает?**  
Логика в `proxy.ts`, но Next.js требует файл `middleware.ts` с export default — его нет.

**2. Какие заглушки есть в API?**  
`/api/alerts`, `POST /api/admin/tickets/[id]`.

**3. Проверяется ли подписка перед просмотром?**  
Нет — `/watch/*` проверяет только auth (`watch/movie/[id]/page.tsx:17-19`), не Subscription.status.

**4. Что будет без Stripe webhook?**  
Пользователь вернётся с success_url, но Subscription в БД не создастся.

**5. Какие known bugs стоит упомянуть на защите?**  
SUPERADMIN blocked from analytics; middleware не подключён; yearly billing — UI only.

---

## БЫСТРАЯ ШПАРГАЛКА ДЛЯ ЭКЗАМЕНА

### Ключевые файлы «наизусть»

| Тема | Файл |
|------|------|
| Auth config | `auth.ts` |
| Prisma schema | `prisma/schema.prisma` |
| Prisma client | `lib/prisma.ts` |
| Stripe checkout | `app/api/stripe/checkout/route.ts` |
| Stripe webhook | `app/api/stripe/webhook/route.ts` |
| Player providers | `lib/providers.ts` |
| Player hook | `hooks/useProviderManager.ts` |
| Watch progress | `hooks/useWatchProgress.ts` + `app/api/watch/progress/route.ts` |
| TMDB fetch | `services/tmdb.ts` |
| Consent gate | `lib/consent/server.ts` |
| Root layout | `app/layout.tsx` |

### Команды для демо

```bash
docker-compose up -d
npm run dev
./stripe listen --forward-to localhost:3000/api/stripe/webhook
npx prisma studio
```

### Тестовая карта Stripe

`4242 4242 4242 4242` — любая дата/CVC/ZIP.

---

*Документ сгенерирован на основе анализа кодовой базы StreamVibe. Актуально на: июнь 2026.*
