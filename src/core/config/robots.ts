import type { MetadataRoute } from 'next';

export const ROBOTS_RULES: MetadataRoute.Robots['rules'] = {
  userAgent: '*',
  allow: '/',
  disallow: [
    '/account/', // Private user account pages (orders, addresses, wishlist, etc.)
    '/api/', // API routes (not meant for search engines)
    '/search', // Dynamic search pages (not useful for SEO)
    '/cart', // Cart pages are user-specific and not useful for SEO
  ],
};
