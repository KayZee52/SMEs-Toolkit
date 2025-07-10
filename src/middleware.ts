
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('app_session');
  const { pathname } = request.nextUrl;

  // Define routes that are public (accessible without login)
  const publicPaths = ['/auth'];

  // If trying to access a protected route without a session, redirect to login
  if (!sessionCookie && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // If logged in, and trying to access the auth page, redirect to dashboard
  if (sessionCookie && pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|mad-logo.png|smes-toolkit.png).*)',
  ],
}
