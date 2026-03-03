import { formatPrice } from './index';

import { describe, expect, it } from 'vitest';

describe('formatPrice', () => {
  it('formats USD amount from a number', () => {
    const result = formatPrice(12.99, 'USD');
    expect(result).toBe('$12.99');
  });

  it('formats USD amount from a string', () => {
    const result = formatPrice('12.99', 'USD');
    expect(result).toBe('$12.99');
  });

  it('formats EUR amount', () => {
    const result = formatPrice(9.5, 'EUR');
    expect(result).toMatch(/9[.,]50/);
  });

  it('formats zero price', () => {
    const result = formatPrice(0, 'USD');
    expect(result).toBe('$0.00');
  });

  it('falls back to plain format for unknown currency codes', () => {
    const result = formatPrice(5.5, 'XYZ');
    // May succeed via Intl or fall back; either way should not throw
    expect(typeof result).toBe('string');
    expect(result).toContain('5');
  });

  it('handles large numbers', () => {
    const result = formatPrice(1000000, 'USD');
    expect(result).toContain('1');
    expect(result).toContain('000');
  });
});
