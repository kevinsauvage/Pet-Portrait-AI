import { cookies } from 'next/headers';

import config from '@/core/config';

/**
 * Resolves a string sort key to a typed enum value.
 * Matches by value or key (case-insensitive). Falls back to defaultKey.
 */
export function resolveSortKeyFromString<T extends Record<string, string>>(
  sortKey: string | undefined,
  enumObj: T,
  defaultKey: keyof T,
): T[keyof T] {
  const match = Object.values(enumObj).find(
    (item) => item.toLowerCase() === sortKey?.toLowerCase(),
  );
  if (match) return match as T[keyof T];

  const matchKey = Object.keys(enumObj).find(
    (item) => item.toLowerCase() === sortKey?.toLowerCase(),
  ) as keyof T | undefined;

  if (matchKey) return enumObj[matchKey];

  return enumObj[defaultKey];
}
import type { GetMenuByHandleQuery, PageInfo, ProductFilter } from './storefront';

interface PaginationVariables {
  after?: string;
  before?: string;
  first?: number;
  last?: number;
  [key: string]: unknown; // To allow any other additional properties
}

export const adjustPaginationVariables = ({
  after,
  before,
  first,
  last,
  ...rest
}: PaginationVariables): PaginationVariables => {
  const variables: PaginationVariables = {
    ...rest,
    after: after || undefined, // Cursor for next page
    before: before || undefined, // Cursor for previous page
    first: after ? first || 10 : undefined, // Forward pagination
    last: before ? last || 10 : undefined, // Backward pagination
  };

  if (!after && !before) {
    variables.first = first || 10; // Default to forward pagination
  }

  return variables;
};

export const parseFiltersQuery = (filters: string | Array<string> | undefined): ProductFilter[] => {
  if (!filters) return [];

  const safeParseFilter = (value: string): ProductFilter | undefined => {
    try {
      const [, jsonPart] = value.split(/:(.+)/);
      if (!jsonPart) return undefined;
      return JSON.parse(jsonPart) as ProductFilter;
    } catch {
      return undefined;
    }
  };

  if (!Array.isArray(filters) && typeof filters === 'string') {
    const parsed = safeParseFilter(filters);
    return parsed ? [parsed] : [];
  }

  return filters
    .map((item) => safeParseFilter(item))
    .filter((filter): filter is ProductFilter => filter !== undefined);
};

export const buildExtraHeaders = async (
  headers: Record<string, string>,
): Promise<Record<string, string>> => {
  const cookiesStore = await cookies();

  const token = cookiesStore.get(config.cookies.delegateToken)?.value;
  const userIp = cookiesStore.get(config.cookies.userIp)?.value;

  const extraHeaders: Record<string, string> = {
    'Shopify-Storefront-Buyer-IP': userIp || '',
    'Shopify-Storefront-Private-Token': token || '',
  };

  return {
    ...extraHeaders,
    ...headers,
    'Content-Type': 'application/json',
  };
};

export const buildShopifySearchQuery = (query: string) => {
  if (!query) {
    return '';
  }
  const trimmed = query.trim();

  if (trimmed.includes(' ')) {
    return `"${trimmed}"`;
  }

  return `${trimmed}*`;
};

type PaginationSearchParams = {
  after?: string;
  before?: string;
  sort_key?: string;
};

function buildPaginationPath(
  pathname: string,
  searchParameters: PaginationSearchParams,
  options: { cursorKey: 'after' | 'before'; cursorValue: string },
): string {
  const params = new URLSearchParams();

  params.set(options.cursorKey, options.cursorValue);
  if (searchParameters.sort_key) params.set('sort_key', searchParameters.sort_key);

  return `${pathname}?${params.toString()}`;
}

export const getNextPath = (
  pathname: string,
  pageInfo: PageInfo,
  searchParameters: PaginationSearchParams,
): string => {
  if (!pageInfo.hasNextPage || !pageInfo.endCursor) return '';

  return buildPaginationPath(pathname, searchParameters, {
    cursorKey: 'after',
    cursorValue: pageInfo.endCursor,
  });
};

export const getPreviousPath = (
  pathname: string,
  pageInfo: PageInfo,
  searchParameters: PaginationSearchParams,
): string => {
  if (!pageInfo.hasPreviousPage || !pageInfo.startCursor) return '';

  return buildPaginationPath(pathname, searchParameters, {
    cursorKey: 'before',
    cursorValue: pageInfo.startCursor,
  });
};

type Menu = NonNullable<GetMenuByHandleQuery['menu']>;
type MenuItem = Menu['items'][number];
type MenuItemWithOptionalItems = Omit<MenuItem, 'items'> & { items?: MenuItem['items'] };

const menuItemContainsSlug = (
  item: MenuItemWithOptionalItems | null | undefined,
  collectionSlug: string,
): boolean => {
  if (!item) return false;

  if (typeof item.url === 'string' && item.url.toLowerCase().includes(collectionSlug.toLowerCase())) {
    return true;
  }

  if (!item.items?.length) return false;

  const children = (item.items ?? []) as MenuItemWithOptionalItems[];
  return children.some((child) => menuItemContainsSlug(child, collectionSlug));
};

export const getMenuItemsForCollection = (
  menu: GetMenuByHandleQuery['menu'] | null | undefined,
  collectionSlug: string,
): Menu['items'] => {
  if (!menu?.items?.length) return [];

  const foundItem = menu.items.find((item) => menuItemContainsSlug(item, collectionSlug));
  return (foundItem?.items ?? []) as Menu['items'];
};
