import { isArtworkUrlHostnameAllowed } from '@/domains/printful/allowed-artwork-url';

import { describe, expect, it } from 'vitest';

describe('isArtworkUrlHostnameAllowed', () => {
  it('allows utfs.io and subdomains over HTTPS', () => {
    expect(isArtworkUrlHostnameAllowed('https://utfs.io/f/abc')).toBe(true);
    expect(isArtworkUrlHostnameAllowed('https://x.utfs.io/f/abc')).toBe(true);
  });

  it('allows ufs.sh app subdomains over HTTPS', () => {
    expect(isArtworkUrlHostnameAllowed('https://i5xe50sg8q.ufs.sh/f/abc')).toBe(true);
  });

  it('rejects non-HTTPS', () => {
    expect(isArtworkUrlHostnameAllowed('http://utfs.io/f/abc')).toBe(false);
  });

  it('rejects arbitrary hosts', () => {
    expect(isArtworkUrlHostnameAllowed('https://evil.example.com/a.png')).toBe(false);
  });
});
