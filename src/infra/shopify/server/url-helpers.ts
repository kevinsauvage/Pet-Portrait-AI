import { cookies } from 'next/headers';

import config from '@/core/config';

/**
 * Server-side URL helpers
 * Utilities for working with URLs stored in cookies (set by middleware)
 */
export const getCurrentUrlWithoutParameters = async () => {
  const cookiesStore = await cookies();
  return cookiesStore.get(config.cookies.url)?.value?.split('?')[0];
};
