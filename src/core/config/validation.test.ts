import { validateSiteMetadata } from './validation';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('validateSiteMetadata', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns warnings when optional site metadata is missing', () => {
    delete process.env.NEXT_PUBLIC_SITE_NAME;
    delete process.env.NEXT_PUBLIC_SITE_EMAIL;

    const warnings = validateSiteMetadata();

    expect(warnings).toEqual([
      expect.stringContaining('NEXT_PUBLIC_SITE_NAME is not set'),
      expect.stringContaining('NEXT_PUBLIC_SITE_EMAIL is not set'),
    ]);
  });

  it('returns an empty array when optional site metadata is present', () => {
    process.env.NEXT_PUBLIC_SITE_NAME = 'My Site';
    process.env.NEXT_PUBLIC_SITE_EMAIL = 'test@example.com';

    const warnings = validateSiteMetadata();

    expect(warnings).toHaveLength(0);
  });
});
