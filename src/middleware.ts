import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware is currently disabled to remove password protection from admin panel.
// To re-enable, uncomment the code inside the middleware function and the config.
export function middleware(request: NextRequest) {
  // const sessionCookie = request.cookies.get('admin_session');
  // const { pathname } = request.nextUrl;

  // const onLoginPage = pathname.startsWith('/admin/login');

  // if (sessionCookie) {
  //   // If logged in and on the login page, redirect to dashboard
  //   if (onLoginPage) {
  //     return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  //   }
  // } else {
  //   // If not logged in and trying to access any admin page other than login, redirect to login
  //   if (pathname.startsWith('/admin/') && !onLoginPage) {
  //       return NextResponse.redirect(new URL('/admin/login', request.url));
  //   }
  // }

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
  // matcher: ['/admin/:path*'],
}
