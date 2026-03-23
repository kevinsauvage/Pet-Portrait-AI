function readStringField(obj: object, key: 'error' | 'message'): string | undefined {
  if (!(key in obj)) return undefined;
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

export function extractErrorMessage(errorData: unknown, fallback: string): string {
  if (typeof errorData !== 'object' || errorData === null) return fallback;
  return readStringField(errorData, 'error') ?? readStringField(errorData, 'message') ?? fallback;
}
