/** Preview cache TTL (20h; Printful URLs expire in 72h) */
export const PREVIEW_CACHE_TTL_MS = 20 * 60 * 60 * 1000;

export const PREVIEW_CACHE_PREFIX = 'printful:preview:';

/** Mockup API: wait before first poll */
export const MOCKUP_INITIAL_WAIT_MS = 10_000;

/** Mockup API: max poll attempts */
export const MOCKUP_POLL_ATTEMPTS = 6;

/** Mockup API: poll interval */
export const MOCKUP_POLL_INTERVAL_MS = 5_000;
