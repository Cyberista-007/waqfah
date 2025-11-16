
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminCookie = request.cookies.get('admin-auth');
  
  // If the user is trying to access an admin page and doesn't have the cookie, redirect to login.
  if (!adminCookie || adminCookie.value !== 'true') {
    const loginUrl = new URL('/admin/login', request.url);
    // Add a 'from' query parameter to redirect back after successful login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the user has the cookie and is trying to access the login page, redirect them to the dashboard.
  if (pathname === '/admin/login' && adminCookie && adminCookie.value === 'true') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths under /admin/
   * except for the login page itself and internal Next.js assets.
   * - /admin/login: The login page, which should always be accessible.
   * - /_next/static: Static files.
   * - /_next/image: Image optimization files.
   * - favicon.ico: Favicon file.
   */
  matcher: [
    '/admin/:path((?!login|_next/static|_next/image|favicon.ico).*)',
    // The pattern below is a negative lookahead that matches any path starting with /admin/
    // that is NOT /admin/login. This is a more concise way of writing it.
    // '/admin/((?!login).*)'
  ],
}
