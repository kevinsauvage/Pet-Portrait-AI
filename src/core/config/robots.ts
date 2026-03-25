import type { MetadataRoute } from 'next';

export const ROBOTS_RULES: MetadataRoute.Robots['rules'] = {
  userAgent: '*',
  allow: '/',
  disallow: [
    '/account/', // Private user account pages (orders, addresses, etc.)
    '/api/', // API routes (not meant for search engines)
    '/search', // Dynamic search pages (not useful for SEO)
    '/order', // Cart/order page is user-specific and not useful for SEO
    '/create/style', // User-specific create flow steps
    '/create/generating', // User-specific create flow steps
    '/create/select', // User-specific create flow steps
    '/create/collections', // User-specific create flow steps
    '/create/order', // User-specific create flow add-to-cart step
  ],
};
