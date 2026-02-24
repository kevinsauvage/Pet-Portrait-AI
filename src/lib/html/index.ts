/**
 * HTML processing utilities
 * Pure utility functions for HTML manipulation
 */

export function stripHtmlToText(html: string) {
  if (!html) return '';

  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
