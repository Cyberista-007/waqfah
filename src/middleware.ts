
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Admin authentication is removed. Middleware now does nothing.
export function middleware(request: NextRequest) {
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
