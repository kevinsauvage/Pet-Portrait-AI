import { safeEqual } from '@/core/utils/secure-compare';

export function isApiAuthConfigured(envVar: string): boolean {
  return Boolean(process.env[envVar]?.trim());
}

export function isApiAuthorized(headers: Headers, envVar: string): boolean {
  const secret = process.env[envVar]?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const authHeader = headers.get('authorization');
  const apiKeyHeader = headers.get('x-api-key');
  const headerValue = authHeader ?? apiKeyHeader;
  if (!headerValue) return false;

  const token = headerValue.toLowerCase().startsWith('bearer ')
    ? headerValue.replace(/^Bearer\s+/i, '').trim()
    : headerValue.trim();

  return safeEqual(token, secret);
}
