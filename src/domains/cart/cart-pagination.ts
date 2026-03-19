import type { CartPaginationParams } from './types';

export type { CartPaginationParams } from './types';

export const DEFAULT_CART_PAGINATION = {
  first: 100,
  last: 0,
  after: '',
  before: '',
} as const;

const parseIntParam = (searchParams: URLSearchParams, key: string, fallback: number) => {
  const value = searchParams.get(key);
  return value ? Number.parseInt(value, 10) : fallback;
};

export const getCartPaginationParams = (searchParams: URLSearchParams): CartPaginationParams => {
  return {
    first: parseIntParam(searchParams, 'first', DEFAULT_CART_PAGINATION.first),
    last: parseIntParam(searchParams, 'last', DEFAULT_CART_PAGINATION.last),
    after: searchParams.get('after') || DEFAULT_CART_PAGINATION.after,
    before: searchParams.get('before') || DEFAULT_CART_PAGINATION.before,
  };
};
