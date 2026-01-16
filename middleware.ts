import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Check if user has the cookie
  const isAdmin = request.cookies.get('admin_session');
  
  // 2. Define protected routes (The Dashboard)
  const isDashboard = request.nextUrl.pathname === '/';

  // 3. If trying to access Dashboard WITHOUT cookie -> Redirect to Login
  if (isDashboard && !isAdmin) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Only run this check on the homepage
export const config = {
  matcher: ['/'],
};