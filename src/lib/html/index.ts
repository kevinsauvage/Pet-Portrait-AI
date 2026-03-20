/**
 * HTML processing utilities
 * Pure utility functions for HTML manipulation
 */

import sanitize from 'sanitize-html';

/**
 * Strips all tags and returns plain text (SEO, structured data, meta fallbacks).
 */
export function stripHtmlToText(html: string) {
  if (!html || typeof html !== 'string') return '';

  const text = sanitize(html, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return text.replace(/\s+/g, ' ').trim();
}
