import { NextResponse } from 'next/server';

import { timingSafeEqual } from 'crypto';

const ADMIN_BASIC_USER = process.env.ADMIN_BASIC_USER?.trim();
const ADMIN_BASIC_PASSWORD = process.env.ADMIN_BASIC_PASSWORD?.trim();
const ADMIN_SECRET = process.env.ADMIN_SECRET?.trim();

const ADMIN_REALM = 'Admin';

function hasBasicAuth(): boolean {
  return Boolean(ADMIN_BASIC_USER && ADMIN_BASIC_PASSWORD);
}

function hasBearerAuth(): boolean {
  return Boolean(ADMIN_SECRET);
}

export function isAdminAuthConfigured(): boolean {
  return hasBasicAuth() || hasBearerAuth();
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function parseBasicAuth(authHeader: string): { user: string; pass: string } | null {
  const token = authHeader.replace(/^Basic\s+/i, '').trim();
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) return null;
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);
    return { user, pass };
  } catch {
    return null;
  }
}

export function isAdminAuthorized(headers: Headers): boolean {
  if (!isAdminAuthConfigured()) {
    return process.env.NODE_ENV !== 'production';
  }

  const authHeader = headers.get('authorization');
  if (!authHeader) return false;

  if (hasBearerAuth() && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    return ADMIN_SECRET ? safeEqual(token, ADMIN_SECRET) : false;
  }

  if (hasBasicAuth() && authHeader.toLowerCase().startsWith('basic ')) {
    const creds = parseBasicAuth(authHeader);
    if (!creds || !ADMIN_BASIC_USER || !ADMIN_BASIC_PASSWORD) return false;
    return safeEqual(creds.user, ADMIN_BASIC_USER) && safeEqual(creds.pass, ADMIN_BASIC_PASSWORD);
  }

  return false;
}

export function createAdminUnauthorizedResponse(): NextResponse {
  const headers = new Headers();
  if (hasBasicAuth()) {
    headers.set('WWW-Authenticate', `Basic realm="${ADMIN_REALM}"`);
  }
  return new NextResponse('Unauthorized', { status: 401, headers });
}

export function createAdminMisconfiguredResponse(): NextResponse {
  return new NextResponse('Admin auth not configured', { status: 503 });
}
