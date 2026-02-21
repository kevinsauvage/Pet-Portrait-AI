/**
 * In-memory generation log store for admin dashboard.
 * For production, replace with a database or Sentry.
 */

export interface GenerationLogEntry {
  id: string;
  styleId: string;
  generationId: string;
  timestamp: string;
  status: 'success' | 'failed';
  error?: string;
  originalPhotoUrl?: string;
}

const MAX_ENTRIES = 500;
const store: GenerationLogEntry[] = [];

function addEntry(entry: Omit<GenerationLogEntry, 'id' | 'timestamp'>): void {
  store.unshift({
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });
  if (store.length > MAX_ENTRIES) store.pop();
}

export function logGenerationSuccess(generationId: string, styleId: string): void {
  addEntry({ generationId, styleId, status: 'success' });
}

export function logGenerationFailure(
  generationId: string,
  styleId: string,
  error?: string,
  originalPhotoUrl?: string,
): void {
  addEntry({ generationId, styleId, status: 'failed', error, originalPhotoUrl });
}

export function getGenerationLogs(limit = 100): GenerationLogEntry[] {
  return store.slice(0, limit);
}

export function getFailedGenerations(): GenerationLogEntry[] {
  return store.filter((e) => e.status === 'failed');
}
