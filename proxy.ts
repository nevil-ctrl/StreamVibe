import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

// Пути которые не требуют auth проверки
const PUBLIC_PATHS = ['/', '/browse', '/search', '/support', '/subscriptions'];

const STATIC_EXTENSIONS =
  /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|map)$/i;

export async function proxy(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // 1. Статика — пропускаем без auth()
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

    // Если не приватный и не auth страница — пропускаем без auth()
    if (!isPrivate && !isAuthPage) {
      return NextResponse.next();
    }

    // 3. Только для приватных/auth страниц вызываем auth()
    const session = await auth();
    const user = session?.user ?? null;

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

    return NextResponse.next();
  } catch (error) {
    console.error('Proxy Middleware Error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
