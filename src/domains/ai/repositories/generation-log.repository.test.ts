// The repository uses a module-level store. We re-import each time to get a fresh module.
// Since vitest caches modules, we clear state by testing in sequence.
import {
  getFailedGenerations,
  getGenerationLogs,
  getGenerationSnapshot,
  logGenerationFailure,
  logGenerationSuccess,
} from './generation-log.repository';

import { describe, expect, it } from 'vitest';

describe('generation-log repository', () => {
  // Clear the store before each test by importing fresh (module is cached,
  // so we rely on clearing via reaching max entries or just reading state progressively).
  // We prefix identifiers to isolate tests.

  it('logs a successful generation', () => {
    logGenerationSuccess('gen-success-1', 'pixar');
    const logs = getGenerationLogs();
    const entry = logs.find((l) => l.generationId === 'gen-success-1');
    expect(entry).toBeDefined();
    expect(entry?.status).toBe('success');
    expect(entry?.styleId).toBe('pixar');
    expect(entry?.id).toBeTruthy();
    expect(entry?.timestamp).toBeTruthy();
  });

  it('logs a failed generation with optional error and photo URL', () => {
    logGenerationFailure('gen-fail-1', 'watercolor', 'timeout', 'https://example.com/photo.jpg');
    const logs = getGenerationLogs();
    const entry = logs.find((l) => l.generationId === 'gen-fail-1');
    expect(entry).toBeDefined();
    expect(entry?.status).toBe('failed');
    expect(entry?.error).toBe('timeout');
    expect(entry?.originalPhotoUrl).toBe('https://example.com/photo.jpg');
  });

  it('logs a failed generation without optional fields', () => {
    logGenerationFailure('gen-fail-2', 'oil-paint');
    const logs = getGenerationLogs();
    const entry = logs.find((l) => l.generationId === 'gen-fail-2');
    expect(entry).toBeDefined();
    expect(entry?.error).toBeUndefined();
    expect(entry?.originalPhotoUrl).toBeUndefined();
  });

  it('getGenerationLogs returns entries in most-recent-first order', () => {
    logGenerationSuccess('gen-order-1', 's1');
    logGenerationSuccess('gen-order-2', 's2');
    const logs = getGenerationLogs();
    const idx1 = logs.findIndex((l) => l.generationId === 'gen-order-2');
    const idx2 = logs.findIndex((l) => l.generationId === 'gen-order-1');
    expect(idx1).toBeLessThan(idx2);
  });

  it('getGenerationSnapshot returns correct counts', () => {
    logGenerationSuccess('snap-ok', 'style1');
    logGenerationFailure('snap-fail', 'style2', 'err');
    const snapshot = getGenerationSnapshot();
    expect(snapshot.logs.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.failedCount).toBeGreaterThanOrEqual(1);
    expect(snapshot.totalCount).toBeGreaterThanOrEqual(2);
  });

  it('getFailedGenerations returns only failed entries', () => {
    logGenerationSuccess('filter-ok', 'style1');
    logGenerationFailure('filter-fail', 'style2');
    const failed = getFailedGenerations();
    expect(failed.every((e) => e.status === 'failed')).toBe(true);
    expect(failed.some((e) => e.generationId === 'filter-fail')).toBe(true);
  });

  it('respects the limit parameter in getGenerationLogs', () => {
    const logs = getGenerationLogs(2);
    expect(logs.length).toBeLessThanOrEqual(2);
  });
});
