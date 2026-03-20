export interface FetchWithTimeoutOptions {
  timeoutMs?: number;
}

/**
 * Single-attempt fetch with optional timeout. Use for server-side / SSR paths
 * where retries would block the response; prefer TanStack Query retries on the client.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: FetchWithTimeoutOptions,
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? 30000;
  const fetchOptions: RequestInit = { ...init };
  if (!fetchOptions.signal && typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
    fetchOptions.signal = AbortSignal.timeout(timeoutMs);
  }

  return fetch(input, fetchOptions);
}
