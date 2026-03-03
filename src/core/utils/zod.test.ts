import { formatZodErrorMessage } from './zod';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

describe('formatZodErrorMessage', () => {
  it('returns field error message when present', () => {
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodErrorMessage(result.error)).toBe('Invalid email address');
    }
  });

  it('returns first form-level error when no field errors', () => {
    const schema = z
      .object({ a: z.string(), b: z.string() })
      .refine((v) => v.a === v.b, { message: 'Values must match' });
    const result = schema.safeParse({ a: 'x', b: 'y' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodErrorMessage(result.error)).toBe('Values must match');
    }
  });

  it('returns default message when no errors available', () => {
    const schema = z.object({});
    const result = schema.safeParse({});
    expect(result.success).toBe(true);
    // Construct a ZodError with no issues to test the fallback
    const { ZodError } = z;
    const emptyError = new ZodError([]);
    expect(formatZodErrorMessage(emptyError)).toBe('Invalid request data');
  });
});
