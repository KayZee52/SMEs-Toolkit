
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/actions/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // If the user is trying to access the auth page but is already logged in,
  // redirect them to the dashboard.
  if (session && pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user is not logged in and is trying to access any page other
  // than the auth page, redirect them to the auth page.
  if (!session && pathname !== '/auth') {
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
     * -favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|mad-logo.png|smes-toolkit.png|favicon.ico).*)',
  ],
};
