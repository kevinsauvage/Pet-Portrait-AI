import config from '@/core/config';
import type { GetMenuByHandleQuery } from '@/infra/shopify/generated/storefront/index';

export type NavLink = { label: string; href: string };

const FALLBACK_NAV_LINKS: NavLink[] = [
  { label: 'Create', href: config.routes.create },
  { label: 'Styles', href: config.routes.styles },
  { label: 'Gallery', href: config.routes.gallery },
  { label: 'Shop', href: config.routes.collection },
];

function pathnameFromUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '#';
  try {
    return new URL(url, 'https://dummy').pathname;
  } catch {
    return '#';
  }
}

type TopLevelMenuItem = NonNullable<GetMenuByHandleQuery['menu']>['items'][number];

function menuItemsToNavLinks(items: TopLevelMenuItem[] | null | undefined): NavLink[] {
  if (!items?.length) return [];
  const links: NavLink[] = [];
  for (const item of items) {
    const href = pathnameFromUrl(item.url);
    if (href !== '#' && item.title) {
      links.push({ label: item.title, href });
    }
  }
  return links;
}

/**
 * Resolves main nav links: Shopify menu first, then fallback to default links.
 */
export function getNavLinks(headerMenu: GetMenuByHandleQuery['menu'] | null | undefined): NavLink[] {
  const fromShopify = menuItemsToNavLinks(headerMenu?.items);
  if (fromShopify.length > 0) return fromShopify;
  return FALLBACK_NAV_LINKS;
}
