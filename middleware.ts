import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge route protection: restrict routes by role stored in cookies
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets and root
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/' ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // Simple session guard: require token
  const token = req.cookies.get('token')?.value;
  const roleCookie = req.cookies.get('role')?.value; // expected: 'admin', 'company', 'peerhost', 'renter'

  if (!token) {
    // Redirect to home/login page when not authenticated
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Route guards by role
  if (pathname.startsWith('/sysadmin')) {
    if (roleCookie !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (pathname.startsWith('/company')) {
    if (roleCookie !== 'company' && roleCookie !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (pathname.startsWith('/peerhost')) {
    if (roleCookie !== 'peerhost' && roleCookie !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (pathname.startsWith('/renter')) {
    if (roleCookie !== 'renter' && roleCookie !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/sysadmin/:path*', '/company/:path*', '/peerhost/:path*', '/renter/:path*'],
};
