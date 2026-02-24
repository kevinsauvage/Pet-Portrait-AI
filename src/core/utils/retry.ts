type RetryOptions<T> = {
  maxAttempts: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  isSuccess?: (result: T) => boolean;
  onAttemptFailed?: (attempt: number, maxAttempts: number, error: unknown) => void;
};

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

/**
 * Executes an async operation with exponential backoff retry.
 * @param fn - The async function to execute
 * @param options - Retry configuration
 * @returns The result of fn, or undefined if all attempts fail (when isSuccess is used)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions<T>,
): Promise<T | undefined> {
  const { maxAttempts, baseDelayMs = 100, maxDelayMs = 1000, isSuccess, onAttemptFailed } = options;

  let lastResult: T | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop -- intentional retry loop
      const result = await fn();
      lastResult = result;

      if (!isSuccess || isSuccess(result)) {
        return result;
      }

      const attemptError = new Error(
        typeof result === 'object' && result !== null && 'error' in result
          ? String((result as { error: unknown }).error)
          : 'Unexpected response format',
      );
      onAttemptFailed?.(attempt, maxAttempts, attemptError);
    } catch (error) {
      onAttemptFailed?.(attempt, maxAttempts, error);
    }

    if (attempt < maxAttempts) {
      const delayMs = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      // eslint-disable-next-line no-await-in-loop -- intentional backoff between retries
      await sleep(delayMs);
    }
  }

  return lastResult;
}
