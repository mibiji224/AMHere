import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We use session_userid as the primary check for being "logged in"
  const userId = request.cookies.get('session_userid')?.value;
  const role = request.cookies.get('session_role')?.value;
  const { pathname } = request.nextUrl;

  // Allow login pages
  if (pathname === '/login' || pathname === '/admin/login') {
    // If already logged in, redirect to appropriate portal
    if (userId) {
      const target = role === 'ADMIN' ? '/admin/employees' : '/portal';
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes - require authentication
  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access for admin pages
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access for portal pages
  if (pathname.startsWith('/portal') && role !== 'EMPLOYEE') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};