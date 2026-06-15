# Admin Panel

## Access

- URL: `/admin/dashboard`
- Required role: `ADMIN` or `SUPERADMIN`
- Guard: `app/admin/layout.tsx` redirects unauthenticated/unauthorized users to `/`

API routes under `/api/admin/*` independently verify session + role (403 if forbidden).

## Sections

### Dashboard (`/admin/dashboard`)

- Real-time stats: users, revenue, page views, subscriptions, tickets
- Charts: registrations, views, revenue (last 30 days)
- Top movies/shows by watch count
- Data source: `GET /api/admin/stats`

### Users (`/admin/users`)

- Search and filter users
- Ban/unban with optional expiry
- Change roles (USER → ADMIN, etc.)
- Pagination via query params
- API: `/api/admin/users`, `/api/admin/users/[id]/ban`, `/api/admin/system/change-role`

### Tickets (`/admin/tickets`)

- Support tickets from `/support` form
- Status: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- Reply via `/api/support/reply`
- Export to PDF/XLSX from UI

### Broadcast Notifications (`/admin/notifications`)

- Send notifications to: all users, Premium, Standard, Basic
- Types: ADMIN_BROADCAST, PROMOTION, UPDATE, WARNING
- Creates rows in `Notification` table per target user
- API: `POST /api/admin/notifications`

### Analytics (`/admin/analytics`)

- Extended metrics and genre popularity
- Links to PostHog external dashboard

## Mobile

On screens `<768px`:

- Sidebar hidden by default; hamburger button (top-left) opens overlay
- Tables scroll horizontally (`overflow-x-auto`)
- Stats cards: 1–2 columns

## Sidebar Navigation

Defined in `components/layout/Sidebar.tsx` → `ADMIN_MENU`:

1. Дашборд
2. Пользователи
3. Тикеты
4. Рассылки
5. Аналитика

## Security Notes

- No edge `middleware.ts` — protection is server-side in layout + API
- Never expose admin APIs without role check
- Ban check runs on every credentials login in `auth.ts`
