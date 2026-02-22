import { cookies } from 'next/headers';

import config from '@/core/config';

/**
 * Server-side URL helpers
 * Utilities for working with URLs stored in cookies (set by middleware)
 */

export const getCurrentUrl = async () => {
  const cookiesStore = await cookies();
  return cookiesStore.get(config.cookies.url)?.value;
};

export const getCurrentUrlWithoutParameters = async () => {
  const cookiesStore = await cookies();
  return cookiesStore.get(config.cookies.url)?.value?.split('?')[0];
};

export const getCurrentSearchParameters = async () => {
  const cookiesStore = await cookies();
  const currentURL = new URL(cookiesStore.get(config.cookies.url)?.value || '');
  return currentURL.searchParams;
};

export const getCurrentPathname = async () => {
  const cookiesStore = await cookies();
  const currentURL = new URL(cookiesStore.get(config.cookies.url)?.value || '');
  return currentURL.pathname;
};

export const getCurrentOrigin = async () => {
  const cookiesStore = await cookies();
  const cookieUrl = cookiesStore.get(config.cookies.url)?.value;
  if (!cookieUrl) return;
  const currentURL = new URL(cookieUrl);
  return currentURL.origin;
};
