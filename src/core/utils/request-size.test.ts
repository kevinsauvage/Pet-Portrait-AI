import type { NextRequest } from 'next/server';

import { enforceRequestSizeLimit, getRequestSizeLimit } from './request-size';

import { describe, expect, it } from 'vitest';

function makeRequest(contentLength: string | null): NextRequest {
  const headers = new Headers();
  if (contentLength !== null) {
    headers.set('content-length', contentLength);
  }
  return { headers } as unknown as NextRequest;
}

describe('getRequestSizeLimit', () => {
  it('returns 256KB for ai scope', () => {
    expect(getRequestSizeLimit('ai')).toBe(256 * 1024);
  });

  it('returns 64MB for upload scope', () => {
    expect(getRequestSizeLimit('upload')).toBe(64 * 1024 * 1024);
  });
});

describe('enforceRequestSizeLimit', () => {
  it('returns null when content-length header is absent', () => {
    const req = makeRequest(null);
    const result = enforceRequestSizeLimit(req, { scope: 'ai' });
    expect(result).toBeNull();
  });

  it('returns null when content-length is not a valid number', () => {
    const req = makeRequest('not-a-number');
    const result = enforceRequestSizeLimit(req, { scope: 'ai' });
    expect(result).toBeNull();
  });

  it('returns null when request size is within the limit', () => {
    const req = makeRequest('1000');
    const result = enforceRequestSizeLimit(req, { scope: 'ai' });
    expect(result).toBeNull();
  });

  it('returns null when request size equals the limit exactly', () => {
    const limit = getRequestSizeLimit('ai').toString();
    const req = makeRequest(limit);
    const result = enforceRequestSizeLimit(req, { scope: 'ai' });
    expect(result).toBeNull();
  });

  it('returns error response when request size exceeds the limit', async () => {
    const overLimit = (getRequestSizeLimit('ai') + 1).toString();
    const req = makeRequest(overLimit);
    const result = enforceRequestSizeLimit(req, { scope: 'ai' });
    expect(result).not.toBeNull();
    expect(result?.status).toBe(413);
    const body = await result?.json();
    expect(body.error).toBe('Payload too large');
  });

  it('uses custom status when provided', async () => {
    const overLimit = (getRequestSizeLimit('upload') + 1).toString();
    const req = makeRequest(overLimit);
    const result = enforceRequestSizeLimit(req, { scope: 'upload', status: 400 });
    expect(result?.status).toBe(400);
  });

  it('uses custom message when provided', async () => {
    const overLimit = (getRequestSizeLimit('ai') + 1).toString();
    const req = makeRequest(overLimit);
    const result = enforceRequestSizeLimit(req, { scope: 'ai', message: 'Too large!' });
    const body = await result?.json();
    expect(body.message).toBe('Too large!');
  });

  it('enforces upload scope limit', async () => {
    const overLimit = (getRequestSizeLimit('upload') + 1).toString();
    const req = makeRequest(overLimit);
    const result = enforceRequestSizeLimit(req, { scope: 'upload' });
    expect(result).not.toBeNull();
    expect(result?.status).toBe(413);
  });
});
