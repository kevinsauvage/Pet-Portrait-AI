import { DEFAULT_SHOP_CONFIG, type ShopConfig } from './shop-config.defaults';
import { parseShopConfigJson, validateMergedShopConfig } from './shop-config.schema';

import { describe, expect, it, vi } from 'vitest';

describe('parseShopConfigJson', () => {
  it('returns empty object for null/undefined', () => {
    const warn = vi.fn();
    expect(parseShopConfigJson(null, warn)).toEqual({});
    expect(parseShopConfigJson(undefined, warn)).toEqual({});
    expect(warn).not.toHaveBeenCalled();
  });

  it('clamps variationsCount to 1–10', () => {
    const warn = vi.fn();
    const parsed = parseShopConfigJson(JSON.stringify({ ai: { variationsCount: 999 } }), warn);
    expect(parsed.ai?.variationsCount).toBe(10);
  });

  it('parses sibling keys when ai is not an object', () => {
    const warn = vi.fn();
    const parsed = parseShopConfigJson(
      JSON.stringify({ ai: 'broken', pagination: { productsPerPage: 24 } }),
      warn,
    );
    expect(parsed.ai).toBeUndefined();
    expect(parsed.pagination?.productsPerPage).toBe(24);
  });

  it('warns and returns {} for invalid JSON', () => {
    const warn = vi.fn();
    expect(parseShopConfigJson('{', warn)).toEqual({});
    expect(warn).toHaveBeenCalledOnce();
  });

  it('filters acceptedTypes to allowed MIME set', () => {
    const warn = vi.fn();
    const parsed = parseShopConfigJson(
      JSON.stringify({
        image: { acceptedTypes: ['image/jpeg', 'application/octet-stream', 'image/png'] },
      }),
      warn,
    );
    expect(parsed.image?.acceptedTypes).toEqual(['image/jpeg', 'image/png']);
  });
});

describe('validateMergedShopConfig', () => {
  it('resets image aspect ratio pair when min > max', () => {
    const warn = vi.fn();
    const merged: ShopConfig = {
      ...DEFAULT_SHOP_CONFIG,
      image: {
        ...DEFAULT_SHOP_CONFIG.image,
        minAspectRatio: 0.9,
        maxAspectRatio: 0.2,
      },
    };
    const out = validateMergedShopConfig(merged, warn);
    expect(out.image.minAspectRatio).toBe(DEFAULT_SHOP_CONFIG.image.minAspectRatio);
    expect(out.image.maxAspectRatio).toBe(DEFAULT_SHOP_CONFIG.image.maxAspectRatio);
  });

  it('resets time estimate when min > max', () => {
    const warn = vi.fn();
    const merged: ShopConfig = {
      ...DEFAULT_SHOP_CONFIG,
      ai: {
        ...DEFAULT_SHOP_CONFIG.ai,
        timeEstimate: { minSeconds: 200, maxSeconds: 50 },
      },
    };
    const out = validateMergedShopConfig(merged, warn);
    expect(out.ai.timeEstimate.minSeconds).toBe(DEFAULT_SHOP_CONFIG.ai.timeEstimate.minSeconds);
    expect(out.ai.timeEstimate.maxSeconds).toBe(DEFAULT_SHOP_CONFIG.ai.timeEstimate.maxSeconds);
  });
});
