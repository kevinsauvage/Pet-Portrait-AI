import siteMetadata from '@/core/config/siteMetadata';
import {
  type BreadcrumbListJsonLd,
  type OrganizationJsonLd,
  type ProductJsonLd,
  SCHEMA_ORG_CONTEXT,
  type WebSiteJsonLd,
} from '@/core/utils/json-ld';
import { getBaseUrl } from '@/core/utils/metadata';
import type { ProductFieldsFragment } from '@/infra/shopify/generated/storefront/index';
import { stripHtmlToText } from '@/lib/html';

/**
 * Generate Organization structured data (JSON-LD)
 */
export function generateOrganizationSchema(): OrganizationJsonLd {
  const baseUrl = getBaseUrl();

  return {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': 'Organization',
    name: siteMetadata.companyName,
    url: baseUrl,
    logo: siteMetadata.siteLogo,
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteMetadata.email,
      contactType: 'customer service',
      ...(siteMetadata.phoneNumber ? { telephone: siteMetadata.phoneNumber } : {}),
    },
    sameAs: [
      siteMetadata.facebook,
      siteMetadata.twitter,
      siteMetadata.instagram,
      siteMetadata.linkedin,
    ].filter((url): url is string => Boolean(url)),
  };
}

/**
 * Generate Product structured data (JSON-LD)
 * @param product - Product data
 * @param productPath - Optional path for the product URL (e.g. "/shop/collection-handle/product-handle")
 */
export function generateProductSchema(
  product: ProductFieldsFragment,
  productPath?: string,
): ProductJsonLd {
  const baseUrl = getBaseUrl();
  const collectionSlug = product.collections?.edges?.[0]?.node?.handle ?? 'all';
  const productUrl = productPath ?? `/shop/${collectionSlug}/${product.handle}`;
  const firstVariant = product.variants?.edges?.[0]?.node;
  const price = firstVariant?.price?.amount;
  const currency = firstVariant?.price?.currencyCode || 'USD';
  const availability = firstVariant?.availableForSale
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const images = product.images?.edges?.map((edge) => edge.node.url) || [];
  const mainImage = images[0] || siteMetadata.siteLogo;

  const description =
    product.seo?.description ||
    (product.descriptionHtml ? stripHtmlToText(product.descriptionHtml) : '') ||
    '';

  const absoluteProductUrl = productUrl.startsWith('http') ? productUrl : `${baseUrl}${productUrl}`;

  const offers: ProductJsonLd['offers'] = {
    '@type': 'Offer',
    url: absoluteProductUrl,
    priceCurrency: currency,
    availability,
    ...(price !== undefined && price !== '' ? { price } : {}),
    priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    seller: {
      '@type': 'Organization',
      name: siteMetadata.companyName,
    },
  };

  const schema: ProductJsonLd = {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': 'Product',
    name: product.title,
    description,
    image: images.length > 0 ? images : [mainImage],
    brand: {
      '@type': 'Brand',
      name: siteMetadata.companyName,
    },
    offers,
    ...(firstVariant?.sku ? { sku: firstVariant.sku } : {}),
    ...(product.id ? { productID: product.id } : {}),
  };

  return schema;
}

/**
 * Generate BreadcrumbList structured data (JSON-LD)
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): BreadcrumbListJsonLd {
  const baseUrl = getBaseUrl();

  return {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate WebSite structured data with search action (JSON-LD)
 */
export function generateWebSiteSchema(): WebSiteJsonLd {
  const baseUrl = getBaseUrl();

  return {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': 'WebSite',
    name: siteMetadata.companyName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
