import { logger } from '@/core/utils/logger.server';
import { withCache } from '@/infra/cache';
import { storefrontSdk } from '@/infra/shopify/client';

import { DEFAULT_SHOP_CONFIG, type ShopConfig } from './shop-config.defaults';
import {
  parseShopConfigJson,
  type ShopConfigPartial,
  validateMergedShopConfig,
} from './shop-config.schema';

export { DEFAULT_SHOP_CONFIG, type ShopConfig } from './shop-config.defaults';

/**
 * Merges parsed config with defaults, ensuring type safety
 */
function mergeConfig(parsed: ShopConfigPartial): ShopConfig {
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
        maxRequests:
          parsed.rateLimit?.ai?.maxRequests ?? DEFAULT_SHOP_CONFIG.rateLimit.ai.maxRequests,
        windowMs: parsed.rateLimit?.ai?.windowMs ?? DEFAULT_SHOP_CONFIG.rateLimit.ai.windowMs,
      },
      upload: {
        maxRequests:
          parsed.rateLimit?.upload?.maxRequests ?? DEFAULT_SHOP_CONFIG.rateLimit.upload.maxRequests,
        windowMs:
          parsed.rateLimit?.upload?.windowMs ?? DEFAULT_SHOP_CONFIG.rateLimit.upload.windowMs,
      },
      printful: {
        maxRequests:
          parsed.rateLimit?.printful?.maxRequests ??
          DEFAULT_SHOP_CONFIG.rateLimit.printful.maxRequests,
        windowMs:
          parsed.rateLimit?.printful?.windowMs ?? DEFAULT_SHOP_CONFIG.rateLimit.printful.windowMs,
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
        catalog: parsed.cache?.revalidate?.catalog ?? DEFAULT_SHOP_CONFIG.cache.revalidate.catalog,
        search: parsed.cache?.revalidate?.search ?? DEFAULT_SHOP_CONFIG.cache.revalidate.search,
        product: parsed.cache?.revalidate?.product ?? DEFAULT_SHOP_CONFIG.cache.revalidate.product,
        shopify: parsed.cache?.revalidate?.shopify ?? DEFAULT_SHOP_CONFIG.cache.revalidate.shopify,
      },
    },
    cookies: {
      expiryDays: parsed.cookies?.expiryDays ?? DEFAULT_SHOP_CONFIG.cookies.expiryDays,
    },
  };
}

function logShopConfigWarn(message: string, metadata?: Record<string, unknown>) {
  logger.warn(message, { context: 'shop-config', metadata });
}

async function fetchShopConfigInternal(): Promise<ShopConfig> {
  try {
    const sdk = storefrontSdk();
    const result = await sdk.getShop();
    const metafieldValue = result.shop.shopConfig?.value;
    const parsed = parseShopConfigJson(metafieldValue, logShopConfigWarn);
    const merged = mergeConfig(parsed);
    const config = validateMergedShopConfig(merged, logShopConfigWarn);

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
