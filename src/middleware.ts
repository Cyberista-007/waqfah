
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/actions';

export function middleware(request: NextRequest) {
    const session = request.cookies.get(SESSION_COOKIE_NAME);

    // If no session cookie, redirect to login page
    if (!session) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // If there is a session, let them proceed
    return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths under /admin/ except for:
   * - API routes
   * - /_next/static (static files)
   * - /_next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - /admin/login (the login page itself)
   */
   matcher: [
    '/admin/dashboard',
    '/admin/lectures/:path*',
    '/admin/series/:path*',
    '/admin/books/:path*',
    '/admin/comments/:path*',
    '/admin/users/:path*',
    '/admin/qa/:path*',
    '/admin/schedule/:path*',
    '/admin/topics/:path*',
  ],
}
