import { type NextRequest, NextResponse } from 'next/server';

import { COOKIES } from '@/core/config/constants';
import {
  createAdminUnauthorizedResponse,
  isAdminAuthorized,
} from '@/core/utils/admin-auth';

/**
 * Proxy — runs on every request to protect routes
 * Protects:
 * - /create/* routes: Requires Shopify customer authentication
 * - /admin/* routes: Requires admin authentication (Basic Auth or Bearer token)
 * - All other routes: Pass through
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAdminAuthorized(request.headers)) {
      return createAdminUnauthorizedResponse();
    }
    return NextResponse.next();
  }

  // Protect create routes - requires Shopify customer token
  if (pathname.startsWith('/create')) {
    const token = request.cookies.get(COOKIES.shopifyToken)?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow all other routes to pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
