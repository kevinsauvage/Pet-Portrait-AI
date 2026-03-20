import { stripHtmlToText } from './index';

import { describe, expect, it } from 'vitest';

describe('stripHtmlToText', () => {
  it('returns empty string for empty input', () => {
    expect(stripHtmlToText('')).toBe('');
  });

  it('returns empty string for falsy input', () => {
    expect(stripHtmlToText(null as unknown as string)).toBe('');
    expect(stripHtmlToText(undefined as unknown as string)).toBe('');
  });

  it('strips basic HTML tags', () => {
    expect(stripHtmlToText('<p>Hello</p>')).toBe('Hello');
  });

  it('strips nested tags', () => {
    expect(stripHtmlToText('<p><strong>Bold</strong> text</p>')).toBe('Bold text');
  });

  it('collapses multiple whitespace characters', () => {
    const result = stripHtmlToText('<p>Hello</p>   <p>World</p>');
    expect(result).toBe('Hello World');
  });

  it('trims leading and trailing whitespace', () => {
    expect(stripHtmlToText('  <p>Hello</p>  ')).toBe('Hello');
  });

  it('preserves plain text without tags', () => {
    expect(stripHtmlToText('Just plain text')).toBe('Just plain text');
  });

  it('handles self-closing tags', () => {
    expect(stripHtmlToText('<br/><p>Text</p>')).toBe('Text');
  });

  it('does not leak script content into plain text', () => {
    expect(stripHtmlToText('<p>Safe</p><script>evil()</script>')).toBe('Safe');
  });
});
