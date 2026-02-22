import type { NextRequest, NextResponse } from 'next/server';

import { base64UrlDecode, base64UrlEncode } from '@/core/utils/base64';
import { getSecureCookieOptions } from '@/core/utils/cookie-security';
import { getClientContext } from '@/core/utils/request-identity';
import { safeEqual } from '@/core/utils/secure-compare';

type ApiSessionScope = 'ai' | 'upload';

const SESSION_TTL_SECONDS = 15 * 60;
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

async function serializeSession(payload: SessionPayload, secret: string): Promise<string> {
  const json = JSON.stringify(payload);
  const encoded = base64UrlEncode(json);
  const signature = await hmacSha256Hex(secret, encoded);
  return `${encoded}.${signature}`;
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

export async function issueApiSessionCookie(
  response: NextResponse,
  request: NextRequest,
  scope: ApiSessionScope,
): Promise<void> {
  const secret = getSecret(scope);
  if (!secret) return;

  const payload: SessionPayload = {
    v: SESSION_VERSION,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    fp: await sha256Hex(getClientContext(request.headers).identifier),
  };

  response.cookies.set(
    COOKIE_NAMES[scope],
    await serializeSession(payload, secret),
    getSecureCookieOptions({ maxAge: SESSION_TTL_SECONDS }),
  );
}

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

export function isSameOriginRequest(request: NextRequest): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite && !['same-origin', 'same-site'].includes(secFetchSite)) {
    return false;
  }

  const origin = request.headers.get('origin');
  if (!origin) return true;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!baseUrl) return true;

  try {
    const expectedOrigin = new URL(baseUrl).origin;
    return origin === expectedOrigin;
  } catch {
    return true;
  }
}
