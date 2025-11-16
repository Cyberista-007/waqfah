import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For all /admin routes, check for the authentication cookie
  if (pathname.startsWith('/admin')) {
    const adminCookie = request.cookies.get('admin-auth');
    if (!adminCookie || adminCookie.value !== 'true') {
      // Redirect to login page if not authenticated
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all admin routes except for the login page itself
   * and Next.js internal paths.
   */
  matcher: ['/admin/:path*'],
}
