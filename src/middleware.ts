
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminCookie = request.cookies.get('admin-auth');
  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  if (isAdminPage && !isLoginPage && (!adminCookie || adminCookie.value !== 'true')) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && adminCookie && adminCookie.value === 'true') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
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
