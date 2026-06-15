# Notifications System

## Overview

StreamVibe has two notification channels:

1. **In-app notifications** — stored in PostgreSQL `Notification` table
2. **Navbar bell** — live dropdown polling `/api/notifications`

## User Notifications

### API — `/api/notifications`

| Method | Action |
|--------|--------|
| `GET` | List last 50 notifications + unread count |
| `PATCH` | Mark all as read |
| `DELETE` | Delete one (`{ id }`) or all (`{ all: true }`) |

Requires authenticated session.

### UI Locations

- **Navbar bell** — `components/layout/Navbar.tsx` → `NotificationBell`
- **Profile dashboard** — last 4 unread preview
- **Full page** — `/user/notifications`

### Notification Types

Created automatically or by admin:

| Type | Source |
|------|--------|
| `PAYMENT_SUCCESS` | Stripe webhook |
| `PAYMENT_FAILED` | Stripe webhook |
| `SUBSCRIPTION_CANCELLED` | Stripe webhook |
| `ADMIN_BROADCAST` | Admin panel |
| `PROMOTION` | Admin panel |
| `UPDATE` | Admin panel |
| `WARNING` | Admin panel |

Icons rendered in `NotificationBell` → `NotifIcon()`.

## Admin Broadcasts

**Page:** `/admin/notifications`  
**API:** `POST /api/admin/notifications`

```json
{
  "title": "string",
  "message": "string",
  "target": "all | premium | standard | basic",
  "type": "ADMIN_BROADCAST | PROMOTION | UPDATE | WARNING"
}
```

Creates one `Notification` row per matching user.

## Polling

Navbar polls every 30 seconds when user is logged in. Interval cleaned up on unmount.

## Bug Fix (June 2026)

Navbar previously called `/api/alerts` (stub returning empty array). Fixed to use `/api/notifications`.

## Database Schema

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(...)
}
```
