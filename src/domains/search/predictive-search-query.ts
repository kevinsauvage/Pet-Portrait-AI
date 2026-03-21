/** Max characters forwarded to Shopify predictive search (bounds abuse and API payloads). */
export const PREDICTIVE_SEARCH_QUERY_MAX_LENGTH = 128;

export function normalizePredictiveSearchQuery(raw: string | null | undefined): string {
  const t = (raw ?? '').trim();
  if (!t) return '';
  return t.length <= PREDICTIVE_SEARCH_QUERY_MAX_LENGTH
    ? t
    : t.slice(0, PREDICTIVE_SEARCH_QUERY_MAX_LENGTH);
}
