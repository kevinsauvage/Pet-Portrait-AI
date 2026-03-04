import type { NextRequest } from 'next/server';

import { createErrorResponse, HTTP_STATUS } from '@/core/utils/api-responses';
import { getClientContext } from '@/core/utils/request-identity';

import { timingSafeEqual } from 'crypto';

/**
 * Timing-safe string comparison using Node.js crypto.timingSafeEqual
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// ============================================================================
// API Authentication (Header-based)
// ============================================================================

/**
 * Checks if an API authentication environment variable is configured
 */
export function isApiAuthConfigured(envVar: string): boolean {
  return Boolean(process.env[envVar]?.trim());
}

/**
 * Validates API authorization via Authorization header or X-API-Key header
 */
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

// ============================================================================
// API Session Management (Cookie-based)
// ============================================================================

type ApiSessionScope = 'ai' | 'upload';

const SESSION_VERSION = 1;

const COOKIE_NAMES: Record<ApiSessionScope, string> = {
  ai: 'pp_ai_session',
  upload: 'pp_upload_session',
};

const SECRET_ENV: Record<ApiSessionScope, 'AI_API_SECRET' | 'UPLOADTHING_API_SECRET'> = {
  ai: 'AI_API_SECRET',
  upload: 'UPLOADTHING_API_SECRET',
};

type SessionPayload = {
  v: number;
  exp: number;
  fp: string;
};

const encoder = new TextEncoder();

function getSecret(scope: ApiSessionScope): string | undefined {
  return process.env[SECRET_ENV[scope]]?.trim();
}

function getSubtleCrypto(): SubtleCrypto {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto API is not available in this runtime.');
  }
  return globalThis.crypto.subtle;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(value: string): Promise<string> {
  const subtle = getSubtleCrypto();
  const digest = await subtle.digest('SHA-256', encoder.encode(value));
  return toHex(digest);
}

async function hmacSha256Hex(secret: string, value: string): Promise<string> {
  const subtle = getSubtleCrypto();
  const key = await subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await subtle.sign('HMAC', key, encoder.encode(value));
  return toHex(signature);
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const withPadding = `${padded}${'='.repeat(padLength)}`;
  return Buffer.from(withPadding, 'base64').toString('utf8');
}

async function parseSession(value: string, secret: string): Promise<SessionPayload | null> {
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) return null;
  const expected = await hmacSha256Hex(secret, encoded);
  if (!safeEqual(signature, expected)) return null;

  try {
    const json = base64UrlDecode(encoded);
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.v !== SESSION_VERSION) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Validates an API session cookie
 */
export async function isApiSessionValid(
  request: NextRequest,
  scope: ApiSessionScope,
): Promise<boolean> {
  const secret = getSecret(scope);
  if (!secret) return true;

  const cookie = request.cookies.get(COOKIE_NAMES[scope])?.value;
  if (!cookie) return false;

  const payload = await parseSession(cookie, secret);
  if (!payload) return false;
  if (Date.now() > payload.exp) return false;

  const fingerprint = await sha256Hex(getClientContext(request.headers).identifier);
  return safeEqual(payload.fp, fingerprint);
}

/**
 * Checks if a request is from the same origin
 */
export function isSameOriginRequest(request: NextRequest): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site');
  // If sec-fetch-site indicates cross-origin, block it
  if (secFetchSite === 'cross-site') {
    return false;
  }
  // If sec-fetch-site is same-origin or same-site, allow it
  if (secFetchSite && ['same-origin', 'same-site'].includes(secFetchSite)) {
    return true;
  }

  const origin = request.headers.get('origin');
  // No origin header usually means same-origin request
  if (!origin) return true;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  // If baseUrl is not configured, be lenient (allow the request)
  if (!baseUrl) return true;

  try {
    const expectedOrigin = new URL(baseUrl).origin;
    const requestOrigin = new URL(origin).origin;
    return requestOrigin === expectedOrigin;
  } catch {
    // If URL parsing fails, be lenient (allow the request)
    return true;
  }
}

// ============================================================================
// API Protection (Combined header + session auth)
// ============================================================================

type ProtectionScope = 'ai' | 'upload';
type ProtectionSecret = 'AI_API_SECRET' | 'UPLOADTHING_API_SECRET';

type ProtectionOptions = {
  secretEnv: ProtectionSecret;
  scope: ProtectionScope;
};

/**
 * Requires API protection via header auth or session cookie
 * Returns an error response if unauthorized, null if authorized
 */
export async function requireApiProtection(
  request: NextRequest,
  { secretEnv, scope }: ProtectionOptions,
) {
  if (!isApiAuthConfigured(secretEnv)) return null;

  const headerAuthorized = isApiAuthorized(request.headers, secretEnv);
  if (headerAuthorized) return null;

  if (!isSameOriginRequest(request)) {
    return createErrorResponse('Forbidden: Request must be from same origin', {
      status: HTTP_STATUS.FORBIDDEN,
      message:
        'Cross-origin requests require Authorization header. Ensure NEXT_PUBLIC_BASE_URL matches your domain.',
    });
  }

  if (!(await isApiSessionValid(request, scope))) {
    return createErrorResponse('Unauthorized: Session expired or invalid', {
      status: HTTP_STATUS.UNAUTHORIZED,
      message: 'Please refresh the page or visit /create to obtain a new session cookie.',
    });
  }

  return null;
}
