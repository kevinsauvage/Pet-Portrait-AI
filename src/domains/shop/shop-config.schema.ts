import { DEFAULT_SHOP_CONFIG, type ShopConfig } from './shop-config.defaults';

import { z } from 'zod';

/** MIME types allowed in shop_config (aligned with docs/shop-config-schema.json). */
const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

function optionalClampedInt(min: number, max: number) {
  return z.preprocess((val: unknown) => {
    if (val === undefined || val === null || val === '') return undefined;
    const n = typeof val === 'number' ? val : Number(String(val));
    if (!Number.isFinite(n)) return undefined;
    const i = Math.trunc(n);
    return Math.min(max, Math.max(min, i));
  }, z.number().int().optional());
}

function optionalClampedFloat(min: number, max: number) {
  return z.preprocess((val: unknown) => {
    if (val === undefined || val === null || val === '') return undefined;
    const n = typeof val === 'number' ? val : Number(String(val));
    if (!Number.isFinite(n)) return undefined;
    return Math.min(max, Math.max(min, n));
  }, z.number().optional());
}

function optionalBoolean() {
  return z.preprocess((val: unknown) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }, z.boolean().optional());
}

function asObjectOrUndefined(val: unknown): unknown {
  if (val !== null && typeof val === 'object' && !Array.isArray(val)) return val;
  return undefined;
}

const aiPartialObject = z
  .object({
    variationsCount: optionalClampedInt(1, 10),
    generationTimeoutSeconds: optionalClampedInt(30, 600),
    apiTimeoutSeconds: optionalClampedInt(30, 600),
    model: z.preprocess((val: unknown) => {
      if (val === undefined || val === null) return undefined;
      if (typeof val !== 'string') return undefined;
      const t = val.trim().slice(0, 128);
      return t.length ? t : undefined;
    }, z.string().max(128).optional()),
    retry: z.preprocess(
      asObjectOrUndefined,
      z
        .object({
          maxAttempts: optionalClampedInt(1, 5),
          baseDelayMs: optionalClampedInt(500, 10000),
          maxDelayMs: optionalClampedInt(1000, 60000),
        })
        .partial()
        .optional(),
    ),
    timeEstimate: z.preprocess(
      asObjectOrUndefined,
      z
        .object({
          minSeconds: optionalClampedInt(10, 300),
          maxSeconds: optionalClampedInt(30, 600),
        })
        .partial()
        .optional(),
    ),
  })
  .partial();

const rateLimitBucketPartial = z.preprocess(
  asObjectOrUndefined,
  z
    .object({
      maxRequests: optionalClampedInt(1, 100),
      windowMs: optionalClampedInt(1000, 3_600_000),
    })
    .partial()
    .optional(),
);

const shopConfigPartialSchema = z.preprocess(
  (root: unknown) => asObjectOrUndefined(root) ?? {},
  z.object({
    ai: z.preprocess(asObjectOrUndefined, aiPartialObject.optional()),
    rateLimit: z.preprocess(
      asObjectOrUndefined,
      z
        .object({
          ai: rateLimitBucketPartial,
          upload: rateLimitBucketPartial,
          printful: rateLimitBucketPartial,
          search: rateLimitBucketPartial,
        })
        .partial()
        .optional(),
    ),
    image: z.preprocess(
      asObjectOrUndefined,
      z
        .object({
          maxFileSize: optionalClampedInt(1_048_576, 52_428_800),
          minDimension: optionalClampedInt(100, 1000),
          maxDimension: optionalClampedInt(1000, 20_000),
          minAspectRatio: optionalClampedFloat(0.1, 1.0),
          maxAspectRatio: optionalClampedFloat(1.0, 10.0),
          acceptedTypes: z.preprocess(
            (val: unknown) => {
              if (!Array.isArray(val)) return undefined;
              const allowed = new Set<string>(ALLOWED_IMAGE_MIME);
              const next = val.filter((x): x is string => typeof x === 'string' && allowed.has(x));
              return next.length ? next : undefined;
            },
            z.array(z.enum(ALLOWED_IMAGE_MIME)).optional(),
          ),
        })
        .partial()
        .optional(),
    ),
    features: z.preprocess(
      asObjectOrUndefined,
      z
        .object({
          enableRegeneration: optionalBoolean(),
          enableGallery: optionalBoolean(),
        })
        .partial()
        .optional(),
    ),
    pagination: z.preprocess(
      asObjectOrUndefined,
      z
        .object({
          productsPerPage: optionalClampedInt(4, 100),
        })
        .partial()
        .optional(),
    ),
    cache: z.preprocess(
      asObjectOrUndefined,
      z
        .object({
          revalidate: z.preprocess(
            asObjectOrUndefined,
            z
              .object({
                catalog: optionalClampedInt(60, 86_400),
                search: optionalClampedInt(60, 3600),
                product: optionalClampedInt(60, 86_400),
                shopify: optionalClampedInt(60, 3600),
              })
              .partial()
              .optional(),
          ),
        })
        .partial()
        .optional(),
    ),
    cookies: z.preprocess(
      asObjectOrUndefined,
      z
        .object({
          expiryDays: optionalClampedInt(1, 365),
        })
        .partial()
        .optional(),
    ),
  }),
);

export type ShopConfigPartial = z.infer<typeof shopConfigPartialSchema>;

const shopConfigMergedSchema = z
  .object({
    ai: z.object({
      variationsCount: z.number().int().min(1).max(10),
      generationTimeoutSeconds: z.number().int().min(30).max(600),
      apiTimeoutSeconds: z.number().int().min(30).max(600),
      model: z.string().min(1).max(128),
      retry: z.object({
        maxAttempts: z.number().int().min(1).max(5),
        baseDelayMs: z.number().int().min(500).max(10000),
        maxDelayMs: z.number().int().min(1000).max(60000),
      }),
      timeEstimate: z.object({
        minSeconds: z.number().int().min(10).max(300),
        maxSeconds: z.number().int().min(30).max(600),
      }),
    }),
    rateLimit: z.object({
      ai: z.object({
        maxRequests: z.number().int().min(1).max(100),
        windowMs: z.number().int().min(1000).max(3_600_000),
      }),
      upload: z.object({
        maxRequests: z.number().int().min(1).max(100),
        windowMs: z.number().int().min(1000).max(3_600_000),
      }),
      printful: z.object({
        maxRequests: z.number().int().min(1).max(100),
        windowMs: z.number().int().min(1000).max(3_600_000),
      }),
      search: z.object({
        maxRequests: z.number().int().min(1).max(100),
        windowMs: z.number().int().min(1000).max(3_600_000),
      }),
    }),
    image: z.object({
      maxFileSize: z.number().int().min(1_048_576).max(52_428_800),
      minDimension: z.number().int().min(100).max(1000),
      maxDimension: z.number().int().min(1000).max(20_000),
      minAspectRatio: z.number().min(0.1).max(1.0),
      maxAspectRatio: z.number().min(1.0).max(10.0),
      acceptedTypes: z.array(z.enum(ALLOWED_IMAGE_MIME)).min(1),
    }),
    features: z.object({
      enableRegeneration: z.boolean(),
      enableGallery: z.boolean(),
    }),
    pagination: z.object({
      productsPerPage: z.number().int().min(4).max(100),
    }),
    cache: z.object({
      revalidate: z.object({
        catalog: z.number().int().min(60).max(86_400),
        search: z.number().int().min(60).max(3600),
        product: z.number().int().min(60).max(86_400),
        shopify: z.number().int().min(60).max(3600),
      }),
    }),
    cookies: z.object({
      expiryDays: z.number().int().min(1).max(365),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.image.minAspectRatio > data.image.maxAspectRatio) {
      ctx.addIssue({
        code: 'custom',
        message: 'image.minAspectRatio must be <= image.maxAspectRatio',
        path: ['image', 'minAspectRatio'],
      });
    }
    if (data.ai.timeEstimate.minSeconds > data.ai.timeEstimate.maxSeconds) {
      ctx.addIssue({
        code: 'custom',
        message: 'ai.timeEstimate.minSeconds must be <= maxSeconds',
        path: ['ai', 'timeEstimate', 'minSeconds'],
      });
    }
  });

/**
 * Parses JSON from the shop_config metafield; invalid shapes yield {} after logging.
 */
export function parseShopConfigJson(
  value: string | null | undefined,
  logWarn: (message: string, meta?: Record<string, unknown>) => void,
): ShopConfigPartial {
  if (!value) return {};

  let raw: unknown;
  try {
    raw = JSON.parse(value) as unknown;
  } catch {
    logWarn('Failed to parse shop_config metafield (invalid JSON)', {
      valueLength: value.length,
      valueStartsWithBrace: value.trimStart().startsWith('{'),
    });
    return {};
  }

  const parsed = shopConfigPartialSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn('shop_config metafield failed schema validation; using defaults for invalid fields', {
      issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return {};
  }

  return parsed.data;
}

function normalizeMergedConfig(config: ShopConfig): ShopConfig {
  let next: ShopConfig = config;

  if (next.image.minAspectRatio > next.image.maxAspectRatio) {
    next = {
      ...next,
      image: {
        ...next.image,
        minAspectRatio: DEFAULT_SHOP_CONFIG.image.minAspectRatio,
        maxAspectRatio: DEFAULT_SHOP_CONFIG.image.maxAspectRatio,
      },
    };
  }

  if (next.ai.timeEstimate.minSeconds > next.ai.timeEstimate.maxSeconds) {
    next = {
      ...next,
      ai: {
        ...next.ai,
        timeEstimate: {
          minSeconds: DEFAULT_SHOP_CONFIG.ai.timeEstimate.minSeconds,
          maxSeconds: DEFAULT_SHOP_CONFIG.ai.timeEstimate.maxSeconds,
        },
      },
    };
  }

  return next;
}

/**
 * Validates merged config (caps + cross-field rules). On failure, returns defaults.
 */
export function validateMergedShopConfig(
  merged: ShopConfig,
  logWarn: (message: string, meta?: Record<string, unknown>) => void,
): ShopConfig {
  const normalized = normalizeMergedConfig(merged);
  const checked = shopConfigMergedSchema.safeParse(normalized);
  if (!checked.success) {
    logWarn('Merged shop config failed validation; falling back to defaults', {
      issues: checked.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return DEFAULT_SHOP_CONFIG;
  }

  const v = checked.data;
  return {
    ai: {
      variationsCount: v.ai.variationsCount,
      generationTimeoutSeconds: v.ai.generationTimeoutSeconds,
      apiTimeoutSeconds: v.ai.apiTimeoutSeconds,
      model: v.ai.model,
      retry: { ...v.ai.retry },
      timeEstimate: { ...v.ai.timeEstimate },
    },
    rateLimit: {
      ai: { ...v.rateLimit.ai },
      upload: { ...v.rateLimit.upload },
      printful: { ...v.rateLimit.printful },
      search: { ...v.rateLimit.search },
    },
    image: {
      ...v.image,
      acceptedTypes: [...v.image.acceptedTypes],
    },
    features: { ...v.features },
    pagination: { ...v.pagination },
    cache: { revalidate: { ...v.cache.revalidate } },
    cookies: { ...v.cookies },
  };
}
