import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import appConfig from '@/core/config';
import { DEFAULTS } from '@/core/config/constants';
import {
  createAdminMisconfiguredResponse,
  createAdminUnauthorizedResponse,
  isAdminAuthConfigured,
  isAdminAuthorized,
} from '@/core/utils/admin-auth';
import { getStandardCookieOptions } from '@/core/utils/cookie-security';
import { setDelegateTokenAction } from '@/infra/shopify/actions';

async function proxy(request: NextRequest) {
  const { nextUrl, cookies, headers, url } = request;
  const { searchParams, pathname } = nextUrl;

  const isAdminRoute = pathname.startsWith(appConfig.routes.admin);
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  if (isAdminRoute || isAdminApiRoute) {
    if (!isAdminAuthConfigured() && process.env.NODE_ENV === 'production') {
      return createAdminMisconfiguredResponse();
    }

    if (!isAdminAuthorized(headers)) {
      return createAdminUnauthorizedResponse();
    }

    if (isAdminApiRoute) {
      return NextResponse.next();
    }
  }

  const response = NextResponse.next();

  const userIp = headers.get('x-forwarded-for')?.split(',')[0] || DEFAULTS.ip;

  const cookieOptions = getStandardCookieOptions({ httpOnly: false });
  response.cookies.set(appConfig.cookies.userIp, userIp, cookieOptions);
  response.cookies.set(appConfig.cookies.url, url, cookieOptions);
  response.cookies.set(appConfig.cookies.searchParams, searchParams.toString(), cookieOptions);

  try {
    await setDelegateTokenAction();
  } catch (error) {
    console.error(
      '[Middleware] delegate token failed:',
      error instanceof Error ? error.message : String(error),
    );
  }

  const cookieShopify = cookies.get(appConfig.cookies.shopifyToken);

  if (!cookieShopify && pathname.startsWith(appConfig.routes.account)) {
    return NextResponse.redirect(new URL(appConfig.routes.login, url));
  }

  if (
    cookieShopify &&
    (pathname.startsWith(appConfig.routes.login) || pathname.startsWith(appConfig.routes.register))
  ) {
    return NextResponse.redirect(new URL(appConfig.routes.account, url));
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
