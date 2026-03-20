import { getClientContext } from './request-identity';

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('getClientContext', () => {
  function makeHeaders(entries: Record<string, string>): Headers {
    return new Headers(entries);
  }

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('ignores proxy IP headers without VERCEL or TRUST_FORWARDED_IP_HEADERS', () => {
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('TRUST_FORWARDED_IP_HEADERS', '');
    const headers = makeHeaders({ 'x-forwarded-for': '1.2.3.4', 'x-real-ip': '9.9.9.9' });
    const ctx = getClientContext(headers);
    expect(ctx.ip).toBe('anonymous');
  });

  it('extracts IP from x-forwarded-for on Vercel', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('TRUST_FORWARDED_IP_HEADERS', '');
    const headers = makeHeaders({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    const ctx = getClientContext(headers);
    expect(ctx.ip).toBe('1.2.3.4');
  });

  it('extracts IP from x-forwarded-for when TRUST_FORWARDED_IP_HEADERS=true', () => {
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('TRUST_FORWARDED_IP_HEADERS', 'true');
    const headers = makeHeaders({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    const ctx = getClientContext(headers);
    expect(ctx.ip).toBe('1.2.3.4');
  });

  it('prefers cf-connecting-ip only when TRUST_FORWARDED_IP_HEADERS=true', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('TRUST_FORWARDED_IP_HEADERS', 'true');
    const headers = makeHeaders({
      'cf-connecting-ip': '10.0.0.1',
      'x-forwarded-for': '1.2.3.4',
    });
    const ctx = getClientContext(headers);
    expect(ctx.ip).toBe('10.0.0.1');
  });

  it('does not use cf-connecting-ip on Vercel without explicit trust', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('TRUST_FORWARDED_IP_HEADERS', '');
    const headers = makeHeaders({
      'cf-connecting-ip': '10.0.0.1',
      'x-forwarded-for': '1.2.3.4',
    });
    const ctx = getClientContext(headers);
    expect(ctx.ip).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent (trusted)', () => {
    vi.stubEnv('VERCEL', '1');
    const headers = makeHeaders({ 'x-real-ip': '9.9.9.9' });
    const ctx = getClientContext(headers);
    expect(ctx.ip).toBe('9.9.9.9');
  });

  it('uses fallback IP when trusted but no IP headers are present', () => {
    vi.stubEnv('VERCEL', '1');
    const headers = makeHeaders({});
    const ctx = getClientContext(headers, 'fallback-ip');
    expect(ctx.ip).toBe('fallback-ip');
  });

  it('uses "anonymous" as default fallback IP', () => {
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('TRUST_FORWARDED_IP_HEADERS', '');
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
    vi.stubEnv('VERCEL', '1');
    const headers = makeHeaders({ 'x-real-ip': '1.1.1.1', 'user-agent': 'TestAgent' });
    const ctx = getClientContext(headers);
    expect(ctx.identifier).toBe('1.1.1.1:TestAgent');
  });
});
