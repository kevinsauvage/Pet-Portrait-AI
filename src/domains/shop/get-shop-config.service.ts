import { logger } from '@/core/utils/logger.server';
import { withCache } from '@/infra/cache';
import { storefrontSdk } from '@/infra/shopify/client';

/**
 * Default configuration values used when shop_config metafield is not available
 */
export const DEFAULT_SHOP_CONFIG = {
  ai: {
    variationsCount: 3,
    generationTimeoutSeconds: 120,
    apiTimeoutSeconds: 60,
    model: 'gpt-image-1.5',
    retry: {
      maxAttempts: 2,
      baseDelayMs: 2000,
      maxDelayMs: 6000,
    },
    timeEstimate: {
      minSeconds: 30,
      maxSeconds: 60,
    },
  },
  rateLimit: {
    ai: {
      maxRequests: 5,
      windowMs: 60000,
    },
    upload: {
      maxRequests: 12,
      windowMs: 60000,
    },
  },
  image: {
    maxFileSize: 8 * 1024 * 1024, // 8MB in bytes
    minDimension: 200,
    maxDimension: 10000,
    minAspectRatio: 0.5,
    maxAspectRatio: 2.0,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  features: {
    enableRegeneration: true,
    enableGallery: true,
  },
  pagination: {
    productsPerPage: 16,
  },
  cache: {
    revalidate: {
      catalog: 3600,
      search: 300,
      product: 3600,
      shopify: 600,
    },
  },
  cookies: {
    expiryDays: 182,
  },
} as const;

export type ShopConfig = typeof DEFAULT_SHOP_CONFIG;

/**
 * Parses the shop_config metafield JSON value
 */
function parseShopConfig(value: string | null | undefined): Partial<ShopConfig> {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as Partial<ShopConfig>;
    return parsed;
  } catch (error) {
    logger.warn('Failed to parse shop_config metafield', {
      context: 'shop-config',
      error,
      metadata: { value },
    });
    return {};
  }
}

/**
 * Merges parsed config with defaults, ensuring type safety
 */
function mergeConfig(parsed: Partial<ShopConfig>): ShopConfig {
  return {
    ai: {
      variationsCount: parsed.ai?.variationsCount ?? DEFAULT_SHOP_CONFIG.ai.variationsCount,
      generationTimeoutSeconds:
        parsed.ai?.generationTimeoutSeconds ?? DEFAULT_SHOP_CONFIG.ai.generationTimeoutSeconds,
      apiTimeoutSeconds: parsed.ai?.apiTimeoutSeconds ?? DEFAULT_SHOP_CONFIG.ai.apiTimeoutSeconds,
      model: parsed.ai?.model ?? DEFAULT_SHOP_CONFIG.ai.model,
      retry: {
        maxAttempts: parsed.ai?.retry?.maxAttempts ?? DEFAULT_SHOP_CONFIG.ai.retry.maxAttempts,
        baseDelayMs: parsed.ai?.retry?.baseDelayMs ?? DEFAULT_SHOP_CONFIG.ai.retry.baseDelayMs,
        maxDelayMs: parsed.ai?.retry?.maxDelayMs ?? DEFAULT_SHOP_CONFIG.ai.retry.maxDelayMs,
      },
      timeEstimate: {
        minSeconds:
          parsed.ai?.timeEstimate?.minSeconds ?? DEFAULT_SHOP_CONFIG.ai.timeEstimate.minSeconds,
        maxSeconds:
          parsed.ai?.timeEstimate?.maxSeconds ?? DEFAULT_SHOP_CONFIG.ai.timeEstimate.maxSeconds,
      },
    },
    rateLimit: {
      ai: {
        maxRequests: parsed.rateLimit?.ai?.maxRequests ?? DEFAULT_SHOP_CONFIG.rateLimit.ai.maxRequests,
        windowMs: parsed.rateLimit?.ai?.windowMs ?? DEFAULT_SHOP_CONFIG.rateLimit.ai.windowMs,
      },
      upload: {
        maxRequests:
          parsed.rateLimit?.upload?.maxRequests ?? DEFAULT_SHOP_CONFIG.rateLimit.upload.maxRequests,
        windowMs:
          parsed.rateLimit?.upload?.windowMs ?? DEFAULT_SHOP_CONFIG.rateLimit.upload.windowMs,
      },
    },
    image: {
      maxFileSize: parsed.image?.maxFileSize ?? DEFAULT_SHOP_CONFIG.image.maxFileSize,
      minDimension: parsed.image?.minDimension ?? DEFAULT_SHOP_CONFIG.image.minDimension,
      maxDimension: parsed.image?.maxDimension ?? DEFAULT_SHOP_CONFIG.image.maxDimension,
      minAspectRatio: parsed.image?.minAspectRatio ?? DEFAULT_SHOP_CONFIG.image.minAspectRatio,
      maxAspectRatio: parsed.image?.maxAspectRatio ?? DEFAULT_SHOP_CONFIG.image.maxAspectRatio,
      acceptedTypes: parsed.image?.acceptedTypes ?? DEFAULT_SHOP_CONFIG.image.acceptedTypes,
    },
    features: {
      enableRegeneration:
        parsed.features?.enableRegeneration ?? DEFAULT_SHOP_CONFIG.features.enableRegeneration,
      enableGallery: parsed.features?.enableGallery ?? DEFAULT_SHOP_CONFIG.features.enableGallery,
    },
    pagination: {
      productsPerPage:
        parsed.pagination?.productsPerPage ?? DEFAULT_SHOP_CONFIG.pagination.productsPerPage,
    },
    cache: {
      revalidate: {
        catalog:
          parsed.cache?.revalidate?.catalog ?? DEFAULT_SHOP_CONFIG.cache.revalidate.catalog,
        search: parsed.cache?.revalidate?.search ?? DEFAULT_SHOP_CONFIG.cache.revalidate.search,
        product:
          parsed.cache?.revalidate?.product ?? DEFAULT_SHOP_CONFIG.cache.revalidate.product,
        shopify:
          parsed.cache?.revalidate?.shopify ?? DEFAULT_SHOP_CONFIG.cache.revalidate.shopify,
      },
    },
    cookies: {
      expiryDays: parsed.cookies?.expiryDays ?? DEFAULT_SHOP_CONFIG.cookies.expiryDays,
    },
  };
}

async function fetchShopConfigInternal(): Promise<ShopConfig> {
  try {
    const sdk = storefrontSdk();
    const result = await sdk.getShop();

    // Type assertion needed until GraphQL codegen is run to include shopConfig field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shop = result.shop as any;
    const metafieldValue = shop.shopConfig?.value as string | null | undefined;
    const parsed = parseShopConfig(metafieldValue);
    const config = mergeConfig(parsed);

    logger.debug('Shop config loaded', {
      context: 'shop-config',
      metadata: {
        hasMetafield: !!metafieldValue,
        variationsCount: config.ai.variationsCount,
      },
    });

    return config;
  } catch (error) {
    logger.error('Failed to fetch shop config, using defaults', {
      context: 'shop-config',
      error,
    });
    return DEFAULT_SHOP_CONFIG;
  }
}

const cachedFetchShopConfig = withCache(fetchShopConfigInternal, {
  prefix: 'shop-config',
  ttlMs: 600000,
});

export async function getShopConfig(): Promise<ShopConfig> {
  return cachedFetchShopConfig();
}
