import type { ProductFieldsFragment } from '@/infra/shopify/storefront';

import {
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateProductSchema,
  generateWebSiteSchema,
} from './structured-data';

import { beforeEach, describe, expect, it } from 'vitest';

function makeProduct(overrides: Partial<ProductFieldsFragment> = {}): ProductFieldsFragment {
  return {
    id: 'gid://shopify/Product/1',
    title: 'Test Product',
    handle: 'test-product',
    descriptionHtml: '<p>A great product</p>',
    description: 'A great product',
    seo: { title: 'Test Product', description: 'SEO description' },
    images: {
      edges: [
        {
          node: {
            url: 'https://example.com/image.jpg',
            altText: 'Product image',
            width: 800,
            height: 600,
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Default',
            availableForSale: true,
            sku: 'SKU-001',
            price: { amount: '19.99', currencyCode: 'USD' },
            compareAtPrice: null,
            selectedOptions: [],
            image: null,
          },
        },
      ],
    },
    ...overrides,
  } as unknown as ProductFieldsFragment;
}

describe('generateOrganizationSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
  });

  it('returns a valid Organization schema', () => {
    const schema = generateOrganizationSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(typeof schema.name).toBe('string');
    expect(schema.name.length).toBeGreaterThan(0);
    expect(schema.url).toContain('https://');
  });

  it('includes contactPoint', () => {
    const schema = generateOrganizationSchema();
    expect(schema.contactPoint).toBeDefined();
    expect((schema.contactPoint as { '@type': string })['@type']).toBe('ContactPoint');
  });

  it('sameAs filters out empty values', () => {
    const schema = generateOrganizationSchema();
    expect(Array.isArray(schema.sameAs)).toBe(true);
    expect((schema.sameAs as string[]).every((s) => s)).toBe(true);
  });
});

describe('generateBreadcrumbSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
  });

  it('returns a BreadcrumbList schema', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Shop', url: '/shop' },
    ]);
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(2);
  });

  it('assigns correct positions', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/shop' },
    ]);
    const items = schema.itemListElement as Array<{ position: number; name: string; item: string }>;
    expect(items[0]?.position).toBe(1);
    expect(items[1]?.position).toBe(2);
  });

  it('prepends base URL to relative URLs', () => {
    const schema = generateBreadcrumbSchema([{ name: 'Shop', url: '/shop' }]);
    const items = schema.itemListElement as Array<{ item: string }>;
    expect(items[0]?.item).toBe('https://example.com/shop');
  });

  it('preserves absolute URLs as-is', () => {
    const schema = generateBreadcrumbSchema([{ name: 'External', url: 'https://other.com/page' }]);
    const items = schema.itemListElement as Array<{ item: string }>;
    expect(items[0]?.item).toBe('https://other.com/page');
  });

  it('handles empty items array', () => {
    const schema = generateBreadcrumbSchema([]);
    expect(schema.itemListElement).toHaveLength(0);
  });
});

describe('generateProductSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
  });

  it('returns a Product schema', () => {
    const schema = generateProductSchema(makeProduct());
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Product');
    expect(schema.name).toBe('Test Product');
  });

  it('includes offers with price and currency', () => {
    const schema = generateProductSchema(makeProduct());
    const offers = schema.offers as { priceCurrency: string; price: string };
    expect(offers.priceCurrency).toBe('USD');
    expect(offers.price).toBe('19.99');
  });

  it('sets InStock availability when variant is available', () => {
    const schema = generateProductSchema(makeProduct());
    const offers = schema.offers as { availability: string };
    expect(offers.availability).toBe('https://schema.org/InStock');
  });

  it('sets OutOfStock when variant is not available', () => {
    const product = makeProduct();
    (product as unknown as Record<string, unknown>).variants = {
      edges: [{ node: { availableForSale: false, price: { amount: '10', currencyCode: 'USD' } } }],
    };
    const schema = generateProductSchema(product);
    const offers = schema.offers as { availability: string };
    expect(offers.availability).toBe('https://schema.org/OutOfStock');
  });

  it('includes sku when variant has sku', () => {
    const schema = generateProductSchema(makeProduct());
    expect(schema.sku).toBe('SKU-001');
  });

  it('includes productID when product has id', () => {
    const schema = generateProductSchema(makeProduct());
    expect(schema.productID).toBe('gid://shopify/Product/1');
  });

  it('uses seo description when available', () => {
    const schema = generateProductSchema(makeProduct());
    expect(schema.description).toBe('SEO description');
  });

  it('falls back to stripped descriptionHtml when no seo description', () => {
    const product = makeProduct();
    (product as unknown as Record<string, unknown>).seo = { title: '', description: '' };
    const schema = generateProductSchema(product);
    expect(schema.description).toContain('great product');
  });

  it('uses product images array', () => {
    const schema = generateProductSchema(makeProduct());
    expect(Array.isArray(schema.image)).toBe(true);
    expect((schema.image as string[])[0]).toBe('https://example.com/image.jpg');
  });

  it('handles product with no images', () => {
    const product = makeProduct();
    (product as unknown as Record<string, unknown>).images = { edges: [] };
    const schema = generateProductSchema(product);
    // Falls back to siteLogo
    expect(schema.image).toBeDefined();
  });
});

describe('generateWebSiteSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
  });

  it('returns a WebSite schema', () => {
    const schema = generateWebSiteSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebSite');
    expect(schema.url).toContain('https://');
  });

  it('includes a SearchAction', () => {
    const schema = generateWebSiteSchema();
    const action = schema.potentialAction as { '@type': string; 'query-input': string };
    expect(action['@type']).toBe('SearchAction');
    expect(action['query-input']).toContain('search_term_string');
  });
});
