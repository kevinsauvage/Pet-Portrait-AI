import { z } from 'zod';

export const GenerationRequestSchema = z.object({
  imageUrl: z.string().url(),
  styleId: z.string(),
  petName: z.string().min(1).max(100),
  petType: z.enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'other']),
});

export const GenerationResultSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  originalImageUrl: z.string().url(),
  generatedImages: z.array(z.string().url()),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  styleId: z.string(),
  createdAt: z.string(),
});

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;
export type GenerationResult = z.infer<typeof GenerationResultSchema>;
