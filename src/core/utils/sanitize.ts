import sanitize from 'sanitize-html';

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

function richTextAllowedAttributes(): Record<string, string[]> {
  const map: Record<string, string[]> = {
    a: ['href', 'target', 'rel', 'class'],
  };
  for (const tag of RICH_TEXT_TAGS) {
    if (tag === 'a' || tag === 'br') continue;
    map[tag] = ['class'];
  }
  return map;
}

/**
 * Sanitizes HTML content before rendering with dangerouslySetInnerHTML.
 * Use for CMS content (legal pages, product descriptions) to prevent XSS.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return sanitize(html, {
    allowedTags: RICH_TEXT_TAGS,
    allowedAttributes: richTextAllowedAttributes(),
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { a: ['http', 'https', 'mailto', 'tel'] },
  });
}
