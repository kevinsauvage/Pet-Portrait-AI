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
  
  // Check error code
  const code =
    (error as NodeJS.ErrnoException).code ?? (error.cause as NodeJS.ErrnoException)?.code;
  if (code && TRANSIENT_CODES.has(code)) return true;
  
  // Check for "fetch failed" errors (common in Node.js fetch)
  if (error.message === 'fetch failed' || error.message.includes('fetch failed')) {
    return true;
  }
  
  // Check for network-related error messages
  const networkErrors = ['network', 'timeout', 'connection', 'ECONN', 'ETIMEDOUT'];
  const lowerMessage = error.message.toLowerCase();
  return networkErrors.some((keyword) => lowerMessage.includes(keyword));
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: { maxAttempts?: number; initialDelayMs?: number; timeoutMs?: number },
): Promise<Response> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const initialDelayMs = options?.initialDelayMs ?? 500;
  const timeoutMs = options?.timeoutMs ?? 30000; // 30 seconds default

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Add timeout to prevent hanging requests (only if no signal already provided)
      const fetchOptions: RequestInit = { ...init };
      if (!fetchOptions.signal && typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
        fetchOptions.signal = AbortSignal.timeout(timeoutMs);
      }

      const response = await fetch(input, fetchOptions);
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // Don't retry on last attempt or if error is not transient
      if (attempt === maxAttempts || !isTransientError(err)) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }

  throw lastError || new Error('fetchWithRetry: unreachable');
}
