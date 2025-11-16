import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow requests to /admin/login to proceed without checking the cookie
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // For all other /admin routes, check for the authentication cookie
  if (pathname.startsWith('/admin')) {
    const adminCookie = request.cookies.get('admin-auth');
    if (!adminCookie || adminCookie.value !== 'true') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
