# Media Player Architecture

## Active Playback Path

```
/movies/[id] or /shows/[id]
    → DetailHero "Play Now"
    → startWatchingMovie/Show (server action)
    → /watch/movie/[id] or /watch/tv/[id]?season=&episode=
    → WatchMovieClient / WatchTvClient
    → useProviderManager
    → iframe (third-party embed)
```

## Providers

Defined in `lib/providers.ts`:

| ID | Label | Lang |
|----|-------|------|
| superembed | Плеer 1 | multi |
| kinobox | Плеer 2 | ru |
| vidsrc | Плеer 3 | en |

Sorted by `priority`. Manual switch via tabs in watch UI.

## useProviderManager

**File:** `hooks/useProviderManager.ts`

| Feature | Behavior |
|---------|----------|
| Fallback | On 8s timeout or iframe error → next provider |
| Skeleton | `PlayerSkeleton` until iframe loads |
| Autoplay | Touch devices show play overlay (`needsInteraction`) |
| postMessage | Listens for progress from allowed origins |
| Cleanup | Clears timeouts/listeners on unmount |

## Watch Progress

**Client-only** via `hooks/useWatchProgress.ts`:

- Debounced 5s POST to `/api/watch/progress`
- Gated by cookie consent (`canRecordWatchHistory`)
- Never called during SSR

## Resume Playback

| Media | URL format |
|-------|------------|
| Movie | `/watch/movie/{id}?t={seconds}` |
| TV | `/watch/tv/{id}?season=2&episode=5&episodeId={tmdbEpId}` |

Episode encoding: `s{season}e{episode}:{tmdbEpisodeId}` in `lib/player-utils.ts`.

## CSP

`next.config.ts` allows iframe sources for kinobox, multiembed, vidsrc on `/watch/*` routes.

## Legacy Components (Unused)

- `components/player/VideoPlayer.tsx` — HTML5 + iframe hybrid
- `components/detail/PlayerSection.tsx` — inline expandable player

Not imported by current watch flow. Kept for backward compatibility.
