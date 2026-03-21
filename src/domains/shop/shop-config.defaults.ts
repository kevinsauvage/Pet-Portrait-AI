export type ShopConfig = {
  ai: {
    variationsCount: number;
    variationsConcurrency: number;
    generationTimeoutSeconds: number;
    apiTimeoutSeconds: number;
    model: string;
    retry: {
      maxAttempts: number;
      baseDelayMs: number;
      maxDelayMs: number;
    };
    timeEstimate: {
      minSeconds: number;
      maxSeconds: number;
    };
  };
  rateLimit: {
    ai: { maxRequests: number; windowMs: number };
    upload: { maxRequests: number; windowMs: number };
    printful: { maxRequests: number; windowMs: number };
    search: { maxRequests: number; windowMs: number };
  };
  image: {
    maxFileSize: number;
    minDimension: number;
    maxDimension: number;
    minAspectRatio: number;
    maxAspectRatio: number;
    acceptedTypes: readonly string[];
  };
  features: {
    enableRegeneration: boolean;
    enableGallery: boolean;
  };
  pagination: {
    productsPerPage: number;
  };
  cache: {
    revalidate: {
      catalog: number;
      search: number;
      product: number;
      shopify: number;
    };
  };
  cookies: {
    expiryDays: number;
  };
};

/**
 * Default configuration values used when shop_config metafield is not available
 */
export const DEFAULT_SHOP_CONFIG: ShopConfig = {
  ai: {
    variationsCount: 3,
    variationsConcurrency: 2,
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
    printful: {
      maxRequests: 30,
      windowMs: 60000,
    },
    search: {
      maxRequests: 45,
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
};
