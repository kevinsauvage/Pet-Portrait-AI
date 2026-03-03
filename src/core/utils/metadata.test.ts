import { generateMetadata, getBaseUrl } from './metadata';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('getBaseUrl', () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl;
  });

  it('returns NEXT_PUBLIC_BASE_URL without trailing slash', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com/';
    expect(getBaseUrl()).toBe('https://example.com');
  });

  it('returns NEXT_PUBLIC_BASE_URL as-is when no trailing slash', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    expect(getBaseUrl()).toBe('https://example.com');
  });

  it('falls back to siteMetadata.siteUrl when env var is not set', () => {
    process.env.NEXT_PUBLIC_BASE_URL = '';
    // siteMetadata.siteUrl defaults to 'https://petportraitai.com' or NEXT_PUBLIC_BASE_URL
    // With empty string, it should fall back to siteMetadata
    const url = getBaseUrl();
    expect(typeof url).toBe('string');
    expect(url.startsWith('http')).toBe(true);
  });
});

describe('generateMetadata', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
  });

  it('returns metadata with title and description', () => {
    const meta = generateMetadata({ title: 'My Page', description: 'A description' });
    expect(meta.title).toBe('My Page');
    expect(meta.description).toBe('A description');
  });

  it('truncates long descriptions to 160 chars', () => {
    const longDesc = 'a'.repeat(200);
    const meta = generateMetadata({ title: 'T', description: longDesc });
    expect((meta.description as string).length).toBeLessThanOrEqual(160);
    expect(meta.description).toMatch(/\.\.\.$/);
  });

  it('does not truncate descriptions at or under 160 chars', () => {
    const shortDesc = 'a'.repeat(160);
    const meta = generateMetadata({ title: 'T', description: shortDesc });
    expect(meta.description).toBe(shortDesc);
  });

  it('sets noindex robots when noindex is true', () => {
    const meta = generateMetadata({ title: 'T', description: 'd', noindex: true });
    const robots = meta.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });

  it('sets index robots by default', () => {
    const meta = generateMetadata({ title: 'T', description: 'd' });
    const robots = meta.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it('includes canonical URL when url is provided', () => {
    const meta = generateMetadata({ title: 'T', description: 'd', url: '/shop' });
    expect(meta.alternates?.canonical).toContain('/shop');
  });

  it('sets openGraph type to website by default', () => {
    const meta = generateMetadata({ title: 'T', description: 'd' });
    const og = meta.openGraph as { type: string };
    expect(og.type).toBe('website');
  });

  it('allows custom openGraph type', () => {
    const meta = generateMetadata({ title: 'T', description: 'd', type: 'article' });
    const og = meta.openGraph as { type: string };
    expect(og.type).toBe('article');
  });
});
