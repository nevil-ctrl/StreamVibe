import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Пути которые не требуют auth проверки
const PUBLIC_PATHS = ['/', '/browse', '/search', '/support', '/subscriptions'];

const STATIC_EXTENSIONS =
  /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|map)$/i;

export default async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // 1. Статика — пропускаем без проверки токена
    if (STATIC_EXTENSIONS.test(pathname)) {
      return NextResponse.next();
    }

    // 2. Публичные пути без авторизации — пропускаем
    const isPrivate =
      pathname.startsWith('/user') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/watch');

    const isAuthPage = pathname.startsWith('/auth');
    const isBannedPage = pathname.startsWith('/banned');

    // Если не приватный и не auth страница — пропускаем
    if (!isPrivate && !isAuthPage) {
      return NextResponse.next();
    }

    // 3. Используем getToken вместо auth(), чтобы избежать ошибки Prisma в Edge runtime
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const user = token ?? null;

    if (!user && isPrivate) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (user && isAuthPage) {
      return NextResponse.redirect(new URL('/browse', req.url));
    }

    if (user?.isBanned && !isBannedPage) {
      return NextResponse.redirect(new URL('/banned', req.url));
    }

    if (pathname.startsWith('/admin')) {
      if (!user?.role) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      const role = String(user.role).toUpperCase();
      if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // 4. Проверка подписки для /watch
    if (pathname.startsWith('/watch')) {
      const role = String(user?.role).toUpperCase();
      const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';
      const hasSubscription = (user as any)?.hasActiveSubscription === true;

      if (!isAdmin && !hasSubscription) {
        return NextResponse.redirect(new URL('/subscriptions', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware Error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
