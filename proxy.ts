import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function proxy(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user ?? null;

    const { pathname } = req.nextUrl;

    const isAuthPage = pathname.startsWith('/auth');
    const isPrivate =
      pathname.startsWith('/user') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/watch');
    const isAdminPage = pathname.startsWith('/admin');
    const isBannedPage = pathname.startsWith('/banned');

    if (!user && isPrivate) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (user && isAuthPage) {
      return NextResponse.redirect(new URL('/browse', req.url));
    }

    if (user?.isBanned && !isBannedPage) {
      return NextResponse.redirect(new URL('/banned', req.url));
    }

    if (isAdminPage) {
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
