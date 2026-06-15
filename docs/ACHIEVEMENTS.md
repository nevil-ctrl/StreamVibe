# Achievements (Badges)

## Overview

Achievements are **computed badges** shown on the user profile (`/user/profile`). They are not stored in the database — calculated at render time from watch stats and support ticket count.

## Implementation

**File:** `app/user/profile/page.tsx` → `getBadges()`

**Data sources:**

- `getUserWatchStats(userId)` from `services/watch-history.service.ts`
- `user.tickets.length` from Prisma include

## Badge List

| Badge | Emoji | Condition |
|-------|-------|-----------|
| Первый просмотр | 🎬 | `totalWatched >= 1` |
| Марафонщик | 🔥 | `completed >= 5` |
| Киноман | 🏆 | `completed >= 20` |
| Коллекционер | ❤️ | `favorites >= 10` |
| Планировщик | 📋 | `watchlist >= 5` |
| Активный | 💬 | `ticketsCount >= 1` |

## Stats Definitions

From `getUserWatchStats`:

- **totalWatched** — entries in watch history
- **completed** — `isFinished === true` or progress ≥ 90%
- **favorites** — entries with `FAVORITE` marker in `episodeId`
- **watchlist** — entries with `WATCHLIST` marker

## UI

Badges render in a flex-wrap grid with emoji, label, and description tooltip. Section hidden when `badges.length === 0`.

## Future Extensions

To persist badges or add new ones:

1. Add condition in `getBadges()`
2. Optionally create `Achievement` Prisma model for unlock timestamps
3. Trigger notification on unlock via `prisma.notification.create`
