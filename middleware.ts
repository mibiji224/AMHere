import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  // We use session_userid as the primary check for being "logged in"
  const userId = request.cookies.get('session_userid')?.value;
  const role = request.cookies.get('session_role')?.value;
  const { pathname } = request.nextUrl;

  // 1. If trying to access Admin pages
  if (pathname.startsWith('/admin')) {
    // Allow the admin login page itself
    if (pathname === '/admin/login') return NextResponse.next();

    // Block if not an Admin or not logged in
    if (!userId || role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. If trying to access Employee Portal
  if (pathname.startsWith('/portal')) {
    if (!userId || role !== 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. If already logged in, don't show the login pages
  if (pathname === '/login' || pathname === '/admin/login') {
    if (userId) {
      const target = role === 'ADMIN' ? '/admin/employees' : '/portal';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Ensure we match all relevant paths
  matcher: ['/admin/:path*', '/portal/:path*', '/login'],
};