import { GenerationRequestSchema, GenerationResultSchema } from '@/domains/ai/validation';

import { describe, expect, it } from 'vitest';

describe('GenerationRequestSchema', () => {
  const validRequest = {
    imageUrl: 'https://example.com/photo.jpg',
    styleId: 'pixar',
    petName: 'Buddy',
    petType: 'dog',
  };

  it('validates a correct request', () => {
    const result = GenerationRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid image URL', () => {
    const result = GenerationRequestSchema.safeParse({ ...validRequest, imageUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty petName', () => {
    const result = GenerationRequestSchema.safeParse({ ...validRequest, petName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a petName over 100 characters', () => {
    const result = GenerationRequestSchema.safeParse({ ...validRequest, petName: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown petType', () => {
    const result = GenerationRequestSchema.safeParse({ ...validRequest, petType: 'snake' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid petType values', () => {
    const types = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'other'];
    for (const petType of types) {
      const result = GenerationRequestSchema.safeParse({ ...validRequest, petType });
      expect(result.success).toBe(true);
    }
  });

  it('rejects missing required fields', () => {
    const result = GenerationRequestSchema.safeParse({ imageUrl: 'https://x.com/img.jpg' });
    expect(result.success).toBe(false);
  });
});

describe('GenerationResultSchema', () => {
  const validResult = {
    id: 'result-123',
    status: 'completed',
    originalImageUrl: 'https://example.com/original.jpg',
    generatedImages: ['https://example.com/gen1.jpg'],
    title: 'My Pet Portrait',
    description: 'A beautiful portrait',
    tags: ['pixar', 'dog'],
    styleId: 'pixar',
    createdAt: '2024-01-01T00:00:00Z',
  };

  it('validates a correct result', () => {
    const result = GenerationResultSchema.safeParse(validResult);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid status', () => {
    const result = GenerationResultSchema.safeParse({ ...validResult, status: 'done' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid statuses', () => {
    const statuses = ['pending', 'processing', 'completed', 'failed'];
    for (const status of statuses) {
      const result = GenerationResultSchema.safeParse({ ...validResult, status });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid URLs in generatedImages', () => {
    const result = GenerationResultSchema.safeParse({
      ...validResult,
      generatedImages: ['not-a-url'],
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty generatedImages array', () => {
    const result = GenerationResultSchema.safeParse({ ...validResult, generatedImages: [] });
    expect(result.success).toBe(true);
  });
});
