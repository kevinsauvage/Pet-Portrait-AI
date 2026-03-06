import { headers } from 'next/headers';

/**
 * Server-side URL helpers
 * Gets the current URL without query parameters from request headers
 */
export const getCurrentUrlWithoutParameters = async () => {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '/';
  return pathname;
};
