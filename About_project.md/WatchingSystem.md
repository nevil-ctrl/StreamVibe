# Система просмотра, избранного и «Мой список»

## Маркеры в `episodeId` (без изменения Prisma)

| Маркер | Кнопка | Раздел |
|--------|--------|--------|
| `FAVORITE` | ♥ (ThumbsUp) | `/user/favorites` |
| `WATCHLIST` | + (Plus) | `/user/my-list` |

Формат: `[FAVORITE,WATCHLIST]{episodeTmdbId}` — оба маркера могут быть одновременно.

Legacy-значения `FAVORITE` / `WATCHLIST` поддерживаются для старых записей.

## «Мой список»

- Server action: `toggleWatchlistMedia`
- Сервис: `toggleWatchlist` в `watch-history.service.ts`
- Профиль: карточка «Мой список» → `/user/my-list`
- Боковое меню: пункт «Мой список»

При старте просмотра маркер `WATCHLIST` **сохраняется** (как в Netflix), пока пользователь не уберёт тайтл вручную.
