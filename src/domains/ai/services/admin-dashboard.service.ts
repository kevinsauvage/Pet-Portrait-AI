import 'server-only';

import type { GenerationLogEntry } from '@/domains/ai/models';
import { getGenerationSnapshot } from '@/domains/ai/repositories/generation-log.repository';

export type AdminGenerationSnapshot = {
  logs: GenerationLogEntry[];
  failedCount: number;
  totalCount: number;
};

export function getAdminGenerationSnapshot(limit = 100): AdminGenerationSnapshot {
  return getGenerationSnapshot(limit);
}
