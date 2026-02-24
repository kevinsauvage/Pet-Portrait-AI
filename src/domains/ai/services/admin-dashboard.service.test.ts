import { getAdminGenerationSnapshot } from './admin-dashboard.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/ai/repositories/generation-log.repository', () => ({
  getGenerationSnapshot: vi.fn().mockReturnValue({
    logs: [],
    failedCount: 0,
    totalCount: 0,
  }),
}));

const { getGenerationSnapshot } = await import(
  '@/domains/ai/repositories/generation-log.repository'
);

describe('admin-dashboard.service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns snapshot from repository', () => {
    const result = getAdminGenerationSnapshot();
    expect(result).toEqual({ logs: [], failedCount: 0, totalCount: 0 });
    expect(getGenerationSnapshot).toHaveBeenCalledWith(100);
  });

  it('passes custom limit to repository', () => {
    getAdminGenerationSnapshot(50);
    expect(getGenerationSnapshot).toHaveBeenCalledWith(50);
  });
});
