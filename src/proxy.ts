import { type NextRequest, NextResponse } from 'next/server';

import { COOKIES } from '@/core/config/constants';

/**
 * Proxy (formerly middleware) — thin network gatekeeper only.
 * Performs optimistic cookie presence check to guard /create/* routes.
 * Authoritative session validation happens in server components / DAL.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIES.shopifyToken)?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/create', '/create/:path*'],
};
