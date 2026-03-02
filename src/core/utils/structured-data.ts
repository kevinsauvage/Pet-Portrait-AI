import siteMetadata from '@/core/config/siteMetadata';
import { getBaseUrl } from '@/core/utils/metadata';
import type { ProductFieldsFragment } from '@/infra/shopify/storefront';
import { stripHtmlToText } from '@/lib/html';

/**
 * Generate Organization structured data (JSON-LD)
 */
export function generateOrganizationSchema() {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteMetadata.companyName,
    url: baseUrl,
    logo: siteMetadata.siteLogo,
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteMetadata.email,
      contactType: 'customer service',
      ...(siteMetadata.phoneNumber && { telephone: siteMetadata.phoneNumber }),
    },
    sameAs: [
      siteMetadata.facebook,
      siteMetadata.twitter,
      siteMetadata.instagram,
      siteMetadata.linkedin,
    ].filter(Boolean),
  };
}

/**
 * Generate Product structured data (JSON-LD)
 */
export function generateProductSchema(product: ProductFieldsFragment) {
  const baseUrl = getBaseUrl();
  const firstVariant = product.variants?.edges?.[0]?.node;
  const price = firstVariant?.price?.amount;
  const currency = firstVariant?.price?.currencyCode || 'USD';
  const availability = firstVariant?.availableForSale
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const images = product.images?.edges?.map((edge) => edge.node.url) || [];
  const mainImage = images[0] || siteMetadata.siteLogo;

  // Get description from SEO field or strip HTML from descriptionHtml
  const description =
    product.seo?.description ||
    (product.descriptionHtml ? stripHtmlToText(product.descriptionHtml) : '') ||
    '';

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description,
    image: images.length > 0 ? images : [mainImage],
    brand: {
      '@type': 'Brand',
      name: siteMetadata.companyName,
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/shop/products/${product.handle}`,
      priceCurrency: currency,
      availability,
      price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      seller: {
        '@type': 'Organization',
        name: siteMetadata.companyName,
      },
    },
  };

  // Add SKU if available
  if (firstVariant?.sku) {
    schema.sku = firstVariant.sku;
  }

  // Add product ID
  if (product.id) {
    schema.productID = product.id;
  }

  // Add aggregate rating if reviews are available (can be extended later)
  // schema.aggregateRating = {
  //   '@type': 'AggregateRating',
  //   ratingValue: '4.5',
  //   reviewCount: '100',
  // };

  return schema;
}

/**
 * Generate BreadcrumbList structured data (JSON-LD)
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
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
export function generateWebSiteSchema() {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
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
