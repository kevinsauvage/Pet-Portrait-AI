import { z } from 'zod';

/** Shopify-style user error entries returned on API error bodies. */
const shopifyUserErrorEntrySchema = z
  .object({
    field: z.array(z.string()).optional(),
    message: z.string().optional(),
  })
  .passthrough();

/** Matches `ApiErrorResponse` from api-responses closely enough for route contract tests. */
export const apiErrorBodySchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
  userErrors: z.array(shopifyUserErrorEntrySchema).optional(),
});

/** Success JSON from `createSuccessResponse` with arbitrary `data`. */
export const apiSuccessBodySchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
});

export function apiSuccessBodyWithData<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });
}

export const aiPortraitGenerationResultSchema = z.object({
  id: z.string(),
  variations: z.array(z.string()),
});

export const aiPortraitSuccessBodySchema = apiSuccessBodyWithData(aiPortraitGenerationResultSchema);

export type JsonResponseLike = Pick<Response, 'json'>;

export async function parseApiRouteJson<T>(response: JsonResponseLike, schema: z.ZodType<T>): Promise<T> {
  const raw: unknown = await response.json();
  return schema.parse(raw);
}
