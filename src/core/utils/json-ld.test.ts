import {
  type OrganizationJsonLd,
  SCHEMA_ORG_CONTEXT,
  serializeJsonLd,
} from './json-ld';

import { describe, expect, it } from 'vitest';

describe('serializeJsonLd', () => {
  it('escapes angle brackets and ampersands for script embedding', () => {
    const payload: OrganizationJsonLd = {
      '@context': SCHEMA_ORG_CONTEXT,
      '@type': 'Organization',
      name: 'Acme</script><script>alert(1)</script>',
      url: 'https://example.com',
      logo: 'https://example.com/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'a&b@example.com',
        contactType: 'customer service',
      },
      sameAs: [],
    };

    const serialized = serializeJsonLd(payload);
    expect(serialized).not.toContain('</script>');
    expect(serialized).toMatch(/\\u003c/);
    expect(serialized).toMatch(/\\u0026/);

    const parsed = JSON.parse(serialized) as { name: string; contactPoint: { email: string } };
    expect(parsed.name).toBe('Acme</script><script>alert(1)</script>');
    expect(parsed.contactPoint.email).toBe('a&b@example.com');
  });

  it('produces parseable JSON for a minimal Organization payload', () => {
    const schema: OrganizationJsonLd = {
      '@context': SCHEMA_ORG_CONTEXT,
      '@type': 'Organization',
      name: 'Test',
      url: 'https://example.com',
      logo: 'https://example.com/l.png',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'x@y.com',
        contactType: 'customer service',
      },
      sameAs: ['https://x.com/a'],
    };
    expect(() => JSON.parse(serializeJsonLd(schema))).not.toThrow();
  });
});
