
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('admin_session');
  const { pathname } = request.nextUrl;

  const onLoginPage = pathname === '/admin/login';

  if (sessionCookie) {
    // If logged in and on the login page, redirect to dashboard
    if (onLoginPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  } else {
    // If not logged in and not on the login page, redirect to login
    if (!onLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths under /admin/ except for:
   * - API routes
   * - /_next/static (static files)
   * - /_next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: '/admin/:path*',
}
