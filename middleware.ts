import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Просто проверяем куку сессии, не обращаясь к базе данных!
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isPrivatePage =
    request.nextUrl.pathname.startsWith('/user') ||
    request.nextUrl.pathname.startsWith('/admin');

  if (!sessionToken && isPrivatePage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (sessionToken && isAuthPage) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }

  return NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo).*)'],
};
