import { ValidationError } from '@/core/errors';

import { GeneratePetPortraitService } from './generate-pet-portrait.service';

import { describe, expect, it } from 'vitest';

const validRequest = {
  imageUrl: 'https://example.com/pet.jpg',
  styleId: 'style-1',
  petName: 'Max',
  petType: 'dog' as const,
};

describe('GeneratePetPortraitService', () => {
  describe('validateRequest', () => {
    it('returns parsed data for valid request', () => {
      const result = GeneratePetPortraitService.validateRequest(validRequest);
      expect(result).toEqual(validRequest);
    });

    it('throws ValidationError for invalid imageUrl', () => {
      expect(() =>
        GeneratePetPortraitService.validateRequest({
          ...validRequest,
          imageUrl: 'not-a-url',
        }),
      ).toThrow(ValidationError);
    });

    it('throws ValidationError for missing petName', () => {
      expect(() =>
        GeneratePetPortraitService.validateRequest({
          ...validRequest,
          petName: '',
        }),
      ).toThrow(ValidationError);
    });

    it('throws ValidationError for invalid petType', () => {
      expect(() =>
        GeneratePetPortraitService.validateRequest({
          ...validRequest,
          petType: 'invalid',
        }),
      ).toThrow(ValidationError);
    });
  });

  describe('execute', () => {
    it('returns generation result with correct structure', async () => {
      const result = await GeneratePetPortraitService.execute(validRequest);
      expect(result.id).toBeDefined();
      expect(result.status).toBe('pending');
      expect(result.originalImageUrl).toBe(validRequest.imageUrl);
      expect(result.generatedImages).toEqual([]);
      expect(result.title).toBe(`${validRequest.petName} Portrait`);
      expect(result.description).toContain(validRequest.petName);
      expect(result.tags).toContain('pet-portrait');
      expect(result.tags).toContain(validRequest.petType);
      expect(result.styleId).toBe(validRequest.styleId);
      expect(result.createdAt).toBeDefined();
    });
  });
});
