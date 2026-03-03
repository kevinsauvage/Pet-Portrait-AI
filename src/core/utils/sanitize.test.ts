import { sanitizeHtml } from './sanitize';

import { describe, expect, it } from 'vitest';

describe('sanitizeHtml', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('returns empty string for null-like inputs', () => {
    expect(sanitizeHtml(null as unknown as string)).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('allows permitted tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  it('strips disallowed tags like script', () => {
    const input = '<script>alert("xss")</script><p>Safe</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Safe</p>');
  });

  it('strips disallowed tags like img', () => {
    const input = '<img src="x" onerror="alert(1)"><p>text</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<img');
    expect(result).toContain('<p>text</p>');
  });

  it('allows anchor tags with permitted attributes', () => {
    const input = '<a href="https://example.com" rel="noopener">link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<a');
    expect(result).toContain('href=');
  });

  it('strips event handler attributes', () => {
    const input = '<p onclick="evil()">text</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
  });

  it('allows heading tags', () => {
    const input = '<h1>Title</h1><h2>Sub</h2>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<h1>');
    expect(result).toContain('<h2>');
  });
});
