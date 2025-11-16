
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('admin_session');
  const { pathname } = request.nextUrl;

  // If trying to access login page while already logged in, redirect to dashboard
  if (sessionCookie && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // If no session and trying to access any admin page (except login), redirect to login
  if (!sessionCookie && pathname.startsWith('/admin') && pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
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
  matcher: ['/admin/:path*'],
}
