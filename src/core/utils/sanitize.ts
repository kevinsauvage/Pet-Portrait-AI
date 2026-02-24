import DOMPurify from 'isomorphic-dompurify';

/** Allowed tags for rich text (legal pages, product descriptions) */
const RICH_TEXT_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'span',
  'div',
];

/** Allowed attributes for links */
const ALLOWED_ATTRS = ['href', 'target', 'rel', 'class'];

/**
 * Sanitizes HTML content before rendering with dangerouslySetInnerHTML.
 * Use for CMS content (legal pages, product descriptions) to prevent XSS.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RICH_TEXT_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ADD_ATTR: ['target'],
  });
}
