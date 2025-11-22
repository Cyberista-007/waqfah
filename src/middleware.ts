import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

const secret = process.env.SESSION_SECRET;
const secretKey = new TextEncoder().encode(secret);

async function getSessionPayloadFromCookie(req: NextRequest) {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;
    try {
        const { payload } = await jwtVerify(sessionCookie, secretKey, { algorithms: ['HS256'] });
        return payload;
    } catch (e) {
        return null;
    }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionPayloadFromCookie(request);

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
