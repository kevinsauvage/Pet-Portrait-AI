import { type NextRequest,NextResponse } from 'next/server';

import { validateImageFromUrl } from '@/domains/ai/ai-portrait/validate-image';
import { generatePetPortraitVariations } from '@/domains/ai/portrait-generation.service';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';
import {
  aiPortraitSuccessBodySchema,
  apiErrorBodySchema,
  parseApiRouteJson,
} from '@/test-support/api-route-response';

import { POST } from './route';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/ai/portrait-generation.service', () => ({
  generatePetPortraitVariations: vi.fn(),
}));

vi.mock('@/domains/ai/ai-portrait/validate-image', () => ({
  validateImageFromUrl: vi.fn(),
}));

vi.mock('@/infra/rate-limit/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

const mockRequireApiProtection = vi.fn().mockResolvedValue(null);
vi.mock('@/core/utils/auth', () => ({
  requireApiProtection: (...args: unknown[]) => mockRequireApiProtection(...args),
}));

vi.mock('@/core/utils/request-identity', () => ({
  getClientContext: vi.fn(() => ({ identifier: 'test-identifier' })),
}));

vi.mock('@/core/utils/request-size', () => ({
  enforceRequestSizeLimit: vi.fn(() => null),
  enforceBodySizeLimit: vi.fn(() => null),
}));

describe('/api/ai/generate route', () => {
  beforeEach(() => {
    const checkRateLimitMock = checkRateLimit as unknown as ReturnType<typeof vi.fn>;
    checkRateLimitMock.mockResolvedValue({ allowed: true, retryAfter: 0 });

    mockRequireApiProtection.mockResolvedValue(null);

    const validateImageFromUrlMock = validateImageFromUrl as unknown as ReturnType<typeof vi.fn>;
    validateImageFromUrlMock.mockResolvedValue({ valid: true });

    const generatePetPortraitVariationsMock =
      generatePetPortraitVariations as unknown as ReturnType<typeof vi.fn>;
    generatePetPortraitVariationsMock.mockResolvedValue({
      id: 'gen-123',
      variations: ['https://utfs.io/f/image1.png'],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('POST generates portrait successfully', async () => {
    const request = {
      json: vi.fn().mockResolvedValue({
        originalPhotoUrl: 'https://utfs.io/f/pet.jpg',
        styleId: 'pixar',
      }),
      headers: new Headers(),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await parseApiRouteJson(response, aiPortraitSuccessBodySchema);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('gen-123');
    expect(generatePetPortraitVariations).toHaveBeenCalledWith(
      'https://utfs.io/f/pet.jpg',
      'pixar',
    );
  });

  it('POST returns 429 when rate limited', async () => {
    const checkRateLimitMock = checkRateLimit as unknown as ReturnType<typeof vi.fn>;
    checkRateLimitMock.mockResolvedValue({ allowed: false, retryAfter: 60 });

    const request = {
      json: vi.fn().mockResolvedValue({
        originalPhotoUrl: 'https://utfs.io/f/pet.jpg',
        styleId: 'pixar',
      }),
      headers: new Headers(),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(429);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
    expect(body.message).toContain('Retry after');
    expect(generatePetPortraitVariations).not.toHaveBeenCalled();
  });

  it('POST returns 400 for invalid request body', async () => {
    const request = {
      json: vi.fn().mockResolvedValue({
        invalid: 'data',
      }),
      headers: new Headers(),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(400);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
    expect(generatePetPortraitVariations).not.toHaveBeenCalled();
  });

  it('POST returns 400 for invalid image URL', async () => {
    const validateImageFromUrlMock = validateImageFromUrl as unknown as ReturnType<typeof vi.fn>;
    validateImageFromUrlMock.mockResolvedValue({
      valid: false,
      error: 'Image URL is not accessible',
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        originalPhotoUrl: 'https://utfs.io/f/bad-image.jpg',
        styleId: 'pixar',
      }),
      headers: new Headers(),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(400);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
    expect(generatePetPortraitVariations).not.toHaveBeenCalled();
  });

  it('POST returns 413 when request body is too large', async () => {
    const { enforceRequestSizeLimit } = await import('@/core/utils/request-size');
    const enforceRequestSizeLimitMock = vi.mocked(enforceRequestSizeLimit);
    enforceRequestSizeLimitMock.mockReturnValueOnce(
      NextResponse.json({ error: 'Request body must be smaller than 256KB.' }, { status: 413 }),
    );

    const request = {
      json: vi.fn().mockResolvedValue({
        originalPhotoUrl: 'https://utfs.io/f/pet.jpg',
        styleId: 'pixar',
      }),
      headers: new Headers(),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(413);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
    expect(generatePetPortraitVariations).not.toHaveBeenCalled();
  });

  it('POST handles generation errors gracefully', async () => {
    const generatePetPortraitVariationsMock =
      generatePetPortraitVariations as unknown as ReturnType<typeof vi.fn>;
    generatePetPortraitVariationsMock.mockRejectedValue(new Error('OpenAI API error'));

    const request = {
      json: vi.fn().mockResolvedValue({
        originalPhotoUrl: 'https://utfs.io/f/pet.jpg',
        styleId: 'pixar',
      }),
      headers: new Headers(),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(500);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
  });
});
