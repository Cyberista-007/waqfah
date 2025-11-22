import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession();

  // Protect all /admin routes except for the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) {
      // User is not logged in, redirect to login page.
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // If user is logged in and tries to access login page, redirect to dashboard
  if (pathname === '/admin/login' && session) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
