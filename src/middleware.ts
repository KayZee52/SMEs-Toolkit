
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This line is crucial to ensure the middleware runs in the Node.js environment,
// which is required for our database and authentication logic.
export const runtime = 'nodejs';

const SESSION_COOKIE_NAME = 'app_session';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  // If the user is trying to access the auth page but has a session cookie,
  // redirect them to the dashboard. The dashboard page will handle full validation.
  if (sessionCookie && pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user does not have a session cookie and is trying to access any page
  // other than the auth page, redirect them to the auth page.
  if (!sessionCookie && pathname !== '/auth') {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

// Define which paths the middleware should run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - mad-logo.png (the logo file)
     * - smes-toolkit.png
     * -favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|mad-logo.png|smes-toolkit.png|favicon.ico).*)',
  ],
};
