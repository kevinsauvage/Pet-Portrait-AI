/**
 * Extracts a human-readable error message from unknown error data.
 * Handles common API error response shapes: { error }, { message }
 */
export function extractErrorMessage(errorData: unknown, fallback: string): string {
  if (typeof errorData === 'object' && errorData !== null) {
    if ('error' in errorData && typeof (errorData as { error: unknown }).error === 'string') {
      return (errorData as { error: string }).error;
    }
    if ('message' in errorData && typeof (errorData as { message: unknown }).message === 'string') {
      return (errorData as { message: string }).message;
    }
  }
  return fallback;
}
