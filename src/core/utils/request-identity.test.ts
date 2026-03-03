import { getClientContext } from './request-identity';

import { describe, expect, it } from 'vitest';

describe('getClientContext', () => {
  function makeHeaders(entries: Record<string, string>): Headers {
    return new Headers(entries);
  }

  it('extracts IP from x-forwarded-for header', () => {
    const headers = makeHeaders({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    const ctx = getClientContext(headers);
    expect(ctx.ip).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const headers = makeHeaders({ 'x-real-ip': '9.9.9.9' });
    const ctx = getClientContext(headers);
    expect(ctx.ip).toBe('9.9.9.9');
  });

  it('uses fallback IP when no IP headers are present', () => {
    const headers = makeHeaders({});
    const ctx = getClientContext(headers, 'fallback-ip');
    expect(ctx.ip).toBe('fallback-ip');
  });

  it('uses "anonymous" as default fallback IP', () => {
    const headers = makeHeaders({});
    const ctx = getClientContext(headers);
    expect(ctx.ip).toBe('anonymous');
  });

  it('extracts user-agent header', () => {
    const headers = makeHeaders({ 'user-agent': 'TestBrowser/1.0' });
    const ctx = getClientContext(headers);
    expect(ctx.ua).toBe('TestBrowser/1.0');
  });

  it('uses "unknown" as default ua when user-agent is absent', () => {
    const headers = makeHeaders({});
    const ctx = getClientContext(headers);
    expect(ctx.ua).toBe('unknown');
  });

  it('builds identifier as ip:ua', () => {
    const headers = makeHeaders({ 'x-real-ip': '1.1.1.1', 'user-agent': 'TestAgent' });
    const ctx = getClientContext(headers);
    expect(ctx.identifier).toBe('1.1.1.1:TestAgent');
  });
});
