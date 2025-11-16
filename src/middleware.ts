
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // This is a simple check, but it's enough for our purposes.
  // We check if the user is trying to access any page under /admin,
  // and if they don't have the cookie, we redirect them to the login page.
  const adminCookie = request.cookies.get('admin-auth');
  if (!adminCookie || adminCookie.value !== 'true') {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }


  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths under /admin/
   * except for the ones starting with:
   * - admin/login (the login page)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: '/admin/:path((?!login|_next/static|_next/image|favicon.ico).*)',
}
