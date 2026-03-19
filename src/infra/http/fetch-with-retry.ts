const TRANSIENT_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_SOCKET',
]);

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const code =
    (error as NodeJS.ErrnoException).code ?? (error.cause as NodeJS.ErrnoException)?.code;
  if (code && TRANSIENT_CODES.has(code)) return true;

  if (error.message === 'fetch failed' || error.message.includes('fetch failed')) {
    return true;
  }

  const networkErrors = ['network', 'timeout', 'connection', 'ECONN', 'ETIMEDOUT'];
  const lowerMessage = error.message.toLowerCase();
  return networkErrors.some((keyword) => lowerMessage.includes(keyword));
}

export interface FetchWithRetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  timeoutMs?: number;
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: FetchWithRetryOptions,
): Promise<Response> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const initialDelayMs = options?.initialDelayMs ?? 500;
  const timeoutMs = options?.timeoutMs ?? 30000;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const fetchOptions: RequestInit = { ...init };
      if (!fetchOptions.signal && typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
        fetchOptions.signal = AbortSignal.timeout(timeoutMs);
      }

      // eslint-disable-next-line no-await-in-loop -- intentional retry loop
      const response = await fetch(input, fetchOptions);
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === maxAttempts || !isTransientError(err)) {
        throw lastError;
      }

      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      // eslint-disable-next-line no-await-in-loop -- intentional backoff between retries
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }

  throw lastError || new Error('fetchWithRetry: unreachable');
}
