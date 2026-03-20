/**
 * HTML processing utilities
 * Pure utility functions for HTML manipulation
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Strips all tags and returns plain text (SEO, structured data, meta fallbacks).
 * Uses DOMPurify with no allowed tags so parsing matches browser-like recovery for messy HTML.
 */
export function stripHtmlToText(html: string) {
  if (!html || typeof html !== 'string') return '';

  const text = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  return text.replace(/\s+/g, ' ').trim();
}
