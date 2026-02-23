import 'server-only';

import type { GenerationLogEntry } from '@/domains/ai/models/generation-log';

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

export function getGenerationSnapshot(limit = 100): {
  logs: GenerationLogEntry[];
  failedCount: number;
  totalCount: number;
} {
  const logs = store.slice(0, limit);
  let failedCount = 0;
  for (const entry of logs) {
    if (entry.status === 'failed') failedCount += 1;
  }
  return {
    logs,
    failedCount,
    totalCount: logs.length,
  };
}

export function getFailedGenerations(): GenerationLogEntry[] {
  return store.filter((e) => e.status === 'failed');
}
