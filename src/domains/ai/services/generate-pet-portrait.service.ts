import { ValidationError } from '@/core/errors';
import type { GenerationRequest, GenerationResult } from '@/domains/ai/models';
import { GenerationRequestSchema } from '@/domains/ai/models';

export const GeneratePetPortraitService = {
  validateRequest(data: unknown): GenerationRequest {
    const result = GenerationRequestSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError('Invalid generation request', {
        errors: result.error.flatten(),
      });
    }
    return result.data;
  },

  async execute(request: GenerationRequest): Promise<GenerationResult> {
    this.validateRequest(request);

    return {
      id: crypto.randomUUID(),
      status: 'pending',
      originalImageUrl: request.imageUrl,
      generatedImages: [],
      title: `${request.petName} Portrait`,
      description: `A beautiful AI-generated portrait of ${request.petName}`,
      tags: ['pet-portrait', request.petType, 'ai-generated'],
      styleId: request.styleId,
      createdAt: new Date().toISOString(),
    };
  },
};
