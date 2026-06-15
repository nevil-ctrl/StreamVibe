# StreamVibe Architecture

## Overview

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

## Major Modules

### Authentication — `auth.ts`

| Files | Purpose |
|-------|---------|
| `auth.ts` | NextAuth v5 config (Google + Credentials) |
| `app/auth/login/` | Login page + server actions |
| `app/auth/register/` | Registration + email verification |
| `app/api/auth/[...nextauth]/` | Auth route handler |

**Dependencies:** `@/lib/prisma`, `@auth/prisma-adapter`, bcryptjs

**Flow:**
```
Login form → signIn() → JWT session → session.user.role
Admin layout checks role === ADMIN | SUPERADMIN
```

---

### Content & TMDB — `services/`, `lib/tmdb.ts`

| Files | Purpose |
|-------|---------|
| `services/movies.service.ts` | Movie lists, popular, trending |
| `services/shows.service.ts` | TV show lists |
| `services/media-detail.service.ts` | Movie/show detail pages |
| `services/content.service.ts` | DB sync (ensureMovieInDb), watch recording |
| `lib/tmdb.ts` | TMDB fetch helper |
| `lib/tmdb-images.ts` | Poster/backdrop URL builders |

**Data flow:**
```
page.tsx → getMovieDetail(id) → TMDB + optional DB cache → DetailHero
```

---

### Watch History — `services/watch-history.service.ts`

| Files | Purpose |
|-------|---------|
| `services/watch-history.service.ts` | Favorites, watchlist, progress, stats |
| `app/api/watch/progress/route.ts` | POST progress (consent-gated) |
| `app/actions/watch.actions.ts` | startWatchingMovie/Show, toggles |
| `lib/watch-constants.ts` | Episode ID encoding (markers + playback) |

**Flow:**
```
Play click → recordMovieWatch → redirect /watch/*
iframe postMessage → useWatchProgress → POST /api/watch/progress
```

---

### Media Player — `hooks/`, `app/watch/`

| Files | Purpose |
|-------|---------|
| `hooks/useProviderManager.ts` | Provider selection, fallback, iframe lifecycle |
| `hooks/useWatchProgress.ts` | Debounced progress save (client-only) |
| `lib/providers.ts` | Embed URL builders (superembed, kinobox, vidsrc) |
| `lib/player-utils.ts` | Fullscreen, debounce, postMessage parsing |
| `app/watch/movie/[id]/` | Movie player page |
| `app/watch/tv/[id]/` | TV player page |
| `components/player/PlayerViewport.tsx` | Shared iframe UI |

See [docs/PLAYER.md](docs/PLAYER.md).

---

### Subscriptions — Stripe

| Files | Purpose |
|-------|---------|
| `app/subscriptions/` | Pricing UI |
| `app/api/stripe/checkout/` | Checkout session |
| `app/api/stripe/webhook/` | Payment events → DB + notifications |

---

### Notifications

| Files | Purpose |
|-------|---------|
| `app/api/notifications/route.ts` | User CRUD |
| `app/api/admin/notifications/route.ts` | Admin broadcast |
| `components/layout/Navbar.tsx` | Bell dropdown |
| `app/user/notifications/` | Full notifications page |

See [docs/NOTIFICATIONS.md](docs/NOTIFICATIONS.md).

---

### Admin Panel — `app/admin/`

| Route | Component | API |
|-------|-----------|-----|
| `/admin/dashboard` | AdminDashboard | `/api/admin/stats` |
| `/admin/users` | AdminUsers | `/api/admin/users` |
| `/admin/tickets` | AdminTickets | `/api/admin/tickets` |
| `/admin/notifications` | AdminNotifications | `/api/admin/notifications` |
| `/admin/analytics` | page | `/api/admin/analytics` |

Protected by `app/admin/layout.tsx` (session + role).

See [docs/ADMIN.md](docs/ADMIN.md).

---

### Analytics — PostHog

| Files | Purpose |
|-------|---------|
| `components/providers/PostHogProvider.tsx` | Client init |
| `lib/consent/analytics.ts` | Consent-gated events |
| `components/providers/AnalyticsTracker.tsx` | Page views |

**Rule:** PostHog only on client, never in SSR page components.

---

### Support

| Files | Purpose |
|-------|---------|
| `app/support/page.tsx` | Public contact form + FAQ |
| `app/api/support/route.ts` | Ticket creation |
| `app/user/support/` | User ticket history |

---

### User Profile & Achievements

| Files | Purpose |
|-------|---------|
| `app/user/profile/page.tsx` | Dashboard, badges, stats |
| `app/user/favorites/` | Favorites grid |
| `app/user/my-list/` | Watchlist |
| `app/user/watched/` | In-progress |
| `app/user/history/` | Completed |

See [docs/ACHIEVEMENTS.md](docs/ACHIEVEMENTS.md).

---

## Layout System

```
app/layout.tsx
├── HeaderController (hidden: /admin, /user, /watch, /auth)
├── MainWrapper
└── FooterController (hidden: /admin, /user, /auth)

app/watch/layout.tsx → .hide-layout (fullscreen player)
app/admin/layout.tsx → Sidebar + main
```

## Prisma Singleton

Only `lib/prisma.ts` creates `PrismaClient`. Uses pg adapter + global cache in development.

## Consent

`lib/consent/server.ts` gates watch history and analytics based on user cookie consent.
