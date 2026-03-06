import { type NextRequest, NextResponse } from 'next/server';

import { COOKIES } from '@/core/config/constants';
import { setApiSessionCookies } from '@/core/utils/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect customer routes - requires Shopify customer token
  const requiresCustomerToken =
    pathname.startsWith('/create') || pathname === '/account' || pathname.startsWith('/account/');

  if (requiresCustomerToken) {
    const token = request.cookies.get(COOKIES.shopifyToken)?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Set API session cookies when visiting /create routes
  // This allows browser flows to authenticate with AI and upload endpoints
  const isCreateRoute = pathname.startsWith('/create');
  const response = NextResponse.next();

  if (isCreateRoute) {
    await setApiSessionCookies(response, request);
  }

  return response;
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
