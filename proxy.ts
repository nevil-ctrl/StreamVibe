import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });

    const isAuthPage = pathname.startsWith('/auth');
    const isPrivate =
      pathname.startsWith('/user') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/watch');
    const isAdminPage = pathname.startsWith('/admin');
    const isBannedPage = pathname.startsWith('/banned');

    if (!token && isPrivate) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (token && isAuthPage) {
      return NextResponse.redirect(new URL('/browse', req.url));
    }

    if (token?.isBanned && !isBannedPage) {
      return NextResponse.redirect(new URL('/banned', req.url));
    }

    if (isAdminPage) {
      // Если токена нет или роли нет — отправляем на главную
      if (!token || !token.role) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      const currentRole = String(token.role).toUpperCase();
      const hasAdminAccess =
        currentRole === 'ADMIN' || currentRole === 'SUPERADMIN';

      if (!hasAdminAccess) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Proxy Middleware Error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
