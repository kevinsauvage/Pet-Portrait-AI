/**
 * Schema.org JSON-LD types and safe serialization for <script type="application/ld+json">.
 * Escapes characters that could break out of a script context when values contain HTML-like text.
 */

export const SCHEMA_ORG_CONTEXT = 'https://schema.org' as const;

type SchemaOrgContext = typeof SCHEMA_ORG_CONTEXT;

export interface OrganizationJsonLd {
  '@context': SchemaOrgContext;
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  contactPoint: {
    '@type': 'ContactPoint';
    email: string;
    contactType: string;
    telephone?: string;
  };
  sameAs: string[];
}

export interface WebSiteJsonLd {
  '@context': SchemaOrgContext;
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface ProductOfferJsonLd {
  '@type': 'Offer';
  url: string;
  priceCurrency: string;
  availability: string;
  price?: string;
  priceValidUntil: string;
  seller: {
    '@type': 'Organization';
    name: string;
  };
}

export interface ProductJsonLd {
  '@context': SchemaOrgContext;
  '@type': 'Product';
  name: string;
  description: string;
  image: string[];
  brand: {
    '@type': 'Brand';
    name: string;
  };
  offers: ProductOfferJsonLd;
  sku?: string;
  productID?: string;
}

export interface BreadcrumbListItemJsonLd {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListJsonLd {
  '@context': SchemaOrgContext;
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbListItemJsonLd[];
}

export type StructuredDataJsonLd =
  | OrganizationJsonLd
  | WebSiteJsonLd
  | ProductJsonLd
  | BreadcrumbListJsonLd;

/**
 * JSON.stringify plus HTML/script-safe unicode escapes for embedding in JSON-LD script tags.
 */
export function serializeJsonLd(schema: StructuredDataJsonLd): string {
  return JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
