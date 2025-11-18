
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware is currently disabled to remove password protection from admin panel.
// To re-enable, uncomment the code inside the middleware function and the config.
export function middleware(request: NextRequest) {
  // The admin panel now uses Firebase Auth, so this middleware is no longer needed.
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
  // matcher: ['/admin/(?!login)(:path*)'],
}
