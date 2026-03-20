import { QueryClient } from '@tanstack/react-query';

/**
 * Browser QueryClient: TanStack Query handles retries (default 3 for queries).
 * Mutations stay at retry: 0 to avoid duplicate side effects.
 */
export function createBrowserQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        staleTime: 60_000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/**
 * For prefetching or `useQuery` during SSR — fail fast; do not block HTML on retries.
 */
export function createServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
