import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('session_role')?.value;
  const pathname = request.nextUrl.pathname;

  // 1. Protect Admin Routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Protect Employee Routes
  if (pathname.startsWith('/portal')) {
    if (role !== 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Redirect Logged-in Users away from Login Page
  if (pathname === '/login') {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/', request.url));
    if (role === 'EMPLOYEE') return NextResponse.redirect(new URL('/portal', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/portal/:path*', '/login'],
};