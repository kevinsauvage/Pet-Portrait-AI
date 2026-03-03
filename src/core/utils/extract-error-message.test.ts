import { extractErrorMessage } from './extract-error-message';

import { describe, expect, it } from 'vitest';

describe('extractErrorMessage', () => {
  it('returns the error field when present as a string', () => {
    expect(extractErrorMessage({ error: 'Something went wrong' }, 'fallback')).toBe(
      'Something went wrong',
    );
  });

  it('returns the message field when error field is absent', () => {
    expect(extractErrorMessage({ message: 'Bad request' }, 'fallback')).toBe('Bad request');
  });

  it('prefers error field over message field', () => {
    expect(extractErrorMessage({ error: 'err', message: 'msg' }, 'fallback')).toBe('err');
  });

  it('returns fallback when error field is not a string', () => {
    expect(extractErrorMessage({ error: 42 }, 'fallback')).toBe('fallback');
  });

  it('returns fallback when message field is not a string', () => {
    expect(extractErrorMessage({ message: true }, 'fallback')).toBe('fallback');
  });

  it('returns fallback for null', () => {
    expect(extractErrorMessage(null, 'fallback')).toBe('fallback');
  });

  it('returns fallback for a plain string', () => {
    expect(extractErrorMessage('some error', 'fallback')).toBe('fallback');
  });

  it('returns fallback for an empty object', () => {
    expect(extractErrorMessage({}, 'fallback')).toBe('fallback');
  });

  it('returns fallback for undefined', () => {
    expect(extractErrorMessage(undefined, 'fallback')).toBe('fallback');
  });
});
