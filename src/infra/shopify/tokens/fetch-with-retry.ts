const TRANSIENT_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
]);

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code =
    (error as NodeJS.ErrnoException).code ?? (error.cause as NodeJS.ErrnoException)?.code;
  if (code && TRANSIENT_CODES.has(code)) return true;
  return error.message === 'fetch failed' && !!error.cause;
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: { maxAttempts?: number; initialDelayMs?: number },
): Promise<Response> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const initialDelayMs = options?.initialDelayMs ?? 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetch(input, init);
    } catch (err) {
      if (attempt === maxAttempts || !isTransientError(err)) throw err;
      await new Promise<void>((resolve) => {
        setTimeout(resolve, initialDelayMs * 2 ** (attempt - 1));
      });
    }
  }

  throw new Error('fetchWithRetry: unreachable');
}
