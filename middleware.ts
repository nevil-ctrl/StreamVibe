import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  const isPrivatePage =
    request.nextUrl.pathname.startsWith('/user') ||
    request.nextUrl.pathname.startsWith('/admin');

  if (!token && isPrivatePage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }

  return NextResponse.next();
}
