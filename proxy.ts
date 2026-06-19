import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const STATIC_EXTENSIONS =
  /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|map)$/i;

export async function proxy(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    if (STATIC_EXTENSIONS.test(pathname)) {
      return NextResponse.next();
    }

    const isPrivate =
      pathname.startsWith('/user') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/watch');

    const isAuthPage = pathname.startsWith('/auth');
    const isBannedPage = pathname.startsWith('/banned');

    if (!isPrivate && !isAuthPage) {
      return NextResponse.next();
    }

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

    if (pathname.startsWith('/watch')) {
      const role = String(user?.role).toUpperCase();
      const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';
      const hasSubscription = token?.hasActiveSubscription === true;

      if (!isAdmin && !hasSubscription) {
        return NextResponse.redirect(new URL('/subscriptions', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Proxy Error:', error);
    const { pathname } = req.nextUrl;
    const isPrivate =
      pathname.startsWith('/user') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/watch');

    if (isPrivate) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
