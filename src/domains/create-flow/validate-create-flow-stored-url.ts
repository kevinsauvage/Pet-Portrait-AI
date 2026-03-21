import config from '@/core/config';

/** Caps stored value size (metafield abuse / oversized query strings). */
export const CREATE_FLOW_STORED_URL_MAX_LENGTH = 4096;

const createBase = config.routes.create;

function normalizeStoredCreateFlowUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.length > CREATE_FLOW_STORED_URL_MAX_LENGTH) return null;

  if (/^[a-zA-Z][a-zA-Z+\-.]*:/.test(trimmed)) return null;
  if (trimmed.startsWith('//')) return null;
  if (/(\.\.|%2e%2e)/i.test(trimmed)) return null;

  let pathname: string;
  let search: string;
  try {
    const pathForParse = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const u = new URL(pathForParse, 'https://create-flow.invalid');
    ({ pathname, search } = u);
  } catch {
    return null;
  }

  if (pathname !== createBase && !pathname.startsWith(`${createBase}/`)) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.some((s) => s === '..')) return null;

  return `${pathname}${search}`;
}

export type ParseCreateFlowStoredUrlResult =
  | { ok: true; value: string }
  | { ok: false; message: string };

/**
 * Validates a value persisted for the create wizard (relative app path under `/create`, no absolute URLs).
 * Used before writing the customer metafield and when reading it back.
 */
export function parseCreateFlowStoredUrl(raw: string): ParseCreateFlowStoredUrlResult {
  const normalized = normalizeStoredCreateFlowUrl(raw);
  if (normalized === null) {
    return { ok: false, message: 'Invalid create flow URL' };
  }
  return { ok: true, value: normalized };
}
