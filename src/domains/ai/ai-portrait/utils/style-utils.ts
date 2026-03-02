import { AI_ART_STYLES } from '../types';

/**
 * Gets the style name by ID (for cart attributes), or returns the ID if not found
 */
export function getStyleName(styleId?: string): string | undefined {
  if (!styleId) return undefined;
  return AI_ART_STYLES.find((s) => s.id === styleId)?.name ?? styleId;
}

/**
 * Gets the style label by ID (for display), or returns the ID if not found
 */
export function getStyleLabel(styleId?: string): string | undefined {
  if (!styleId) return undefined;
  return AI_ART_STYLES.find((s) => s.id === styleId)?.label ?? styleId;
}
