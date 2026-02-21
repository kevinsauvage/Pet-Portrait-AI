import config from '@/core/config';

export function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV === 'development') {
    return config.constants.domains.localhost;
  }
  return process.env.NEXT_PUBLIC_SITE_DOMAIN;
}

export function shouldUseSecureCookies(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getSecureCookieOptions(
  options: {
    maxAge?: number;
    expires?: Date;
    path?: string;
  } = {},
): {
  domain?: string;
  expires?: Date;
  httpOnly: boolean;
  maxAge?: number;
  path: string;
  sameSite: 'lax' | 'strict' | 'none';
  secure: boolean;
} {
  return {
    domain: getCookieDomain(),
    httpOnly: true,
    path: options.path || '/',
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    ...(options.maxAge && { maxAge: options.maxAge }),
    ...(options.expires && { expires: options.expires }),
  };
}

export function getStandardCookieOptions(
  options: {
    httpOnly?: boolean;
    maxAge?: number;
    expires?: Date;
    path?: string;
  } = {},
): {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path: string;
  sameSite: 'lax' | 'strict' | 'none';
  secure: boolean;
} {
  return {
    domain: getCookieDomain(),
    path: options.path || '/',
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    ...(options.httpOnly !== undefined && { httpOnly: options.httpOnly }),
    ...(options.maxAge && { maxAge: options.maxAge }),
    ...(options.expires && { expires: options.expires }),
  };
}
