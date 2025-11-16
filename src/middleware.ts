
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/firebase/server-init'; // Assuming you have a way to check auth server-side

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We are checking if the user is authenticated.
  // For this simple case, we will check for a session cookie.
  // In a real app, you would use a more robust method like verifying a JWT.
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    // If no session and they are trying to access an admin page, redirect to login.
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // If they are authenticated, let them proceed.
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths under /admin/ except for:
   * - API routes
   * - /_next/static (static files)
   * - /_next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - The login page itself to avoid a redirect loop
   */
  matcher: ['/admin/:path*'],
}
