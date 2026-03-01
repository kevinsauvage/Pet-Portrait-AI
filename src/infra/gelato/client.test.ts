import {
  createGelatoProductFromTemplate,
  findGelatoProductByShopifyId,
  type GelatoProduct,
  getGelatoProduct,
} from './client';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockProduct = (overrides: Partial<GelatoProduct> = {}): GelatoProduct => ({
  id: 'gelato-prod-1',
  storeId: 'store-1',
  externalId: '123456',
  title: 'Test Product',
  description: 'desc',
  previewUrl: 'https://example.com/preview.jpg',
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

beforeEach(() => {
  process.env.GELATO_API_KEY = 'test-api-key';
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.GELATO_API_KEY;
});

function mockFetchOk(body: unknown) {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
}

function mockFetchError(status: number, text = 'Bad Request') {
  vi.mocked(fetch).mockResolvedValue({
    ok: false,
    status,
    text: () => Promise.resolve(text),
  } as Response);
}

describe('getGelatoProduct', () => {
  it('returns the product on success', async () => {
    const product = mockProduct();
    mockFetchOk(product);
    const result = await getGelatoProduct('store-1', 'gelato-prod-1');
    expect(result).toEqual(product);
    expect(fetch).toHaveBeenCalledWith(
      'https://ecommerce.gelatoapis.com/v1/stores/store-1/products/gelato-prod-1',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-API-KEY': 'test-api-key' }),
      }),
    );
  });

  it('throws when GELATO_API_KEY is missing', async () => {
    delete process.env.GELATO_API_KEY;
    await expect(getGelatoProduct('store-1', 'prod-1')).rejects.toThrow('Missing GELATO_API_KEY');
  });

  it('throws on non-2xx response', async () => {
    mockFetchError(404, 'Not found');
    await expect(getGelatoProduct('store-1', 'prod-1')).rejects.toThrow(
      'Gelato API 404: Not found',
    );
  });

  it('throws on non-2xx with empty body', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.reject(new Error('no body')),
    } as unknown as Response);
    await expect(getGelatoProduct('store-1', 'prod-1')).rejects.toThrow('Gelato API 500:');
  });
});

describe('createGelatoProductFromTemplate', () => {
  it('posts to create-from-template and returns product', async () => {
    const product = mockProduct({ status: 'created' });
    mockFetchOk(product);
    const result = await createGelatoProductFromTemplate('store-1', {
      templateId: 'tmpl-1',
      title: 'My Product',
      description: 'desc',
    });
    expect(result).toEqual(product);
    expect(fetch).toHaveBeenCalledWith(
      'https://ecommerce.gelatoapis.com/v1/stores/store-1/products:create-from-template',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('findGelatoProductByShopifyId', () => {
  it('returns matching product by externalId', async () => {
    const target = mockProduct({ externalId: '999' });
    mockFetchOk({ data: [mockProduct(), target], pagination: { currentPage: 1, totalPages: 1 } });
    const result = await findGelatoProductByShopifyId('store-1', '999');
    expect(result).toEqual(target);
  });

  it('returns null when no product matches', async () => {
    mockFetchOk({
      data: [mockProduct({ externalId: '111' })],
      pagination: { currentPage: 1, totalPages: 1 },
    });
    const result = await findGelatoProductByShopifyId('store-1', '999');
    expect(result).toBeNull();
  });

  it('paginates until match is found', async () => {
    const target = mockProduct({ externalId: '999' });
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [mockProduct({ externalId: '111' })],
            pagination: { currentPage: 1, totalPages: 2 },
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ data: [target], pagination: { currentPage: 2, totalPages: 2 } }),
      } as Response);
    const result = await findGelatoProductByShopifyId('store-1', '999');
    expect(result).toEqual(target);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('returns null after exhausting all pages', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ data: [mockProduct()], pagination: { currentPage: 1, totalPages: 2 } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [mockProduct({ externalId: '111' })],
            pagination: { currentPage: 2, totalPages: 2 },
          }),
      } as Response);
    const result = await findGelatoProductByShopifyId('store-1', '999');
    expect(result).toBeNull();
  });

  it('handles missing data field gracefully', async () => {
    mockFetchOk({ pagination: { currentPage: 1, totalPages: 1 } });
    const result = await findGelatoProductByShopifyId('store-1', '999');
    expect(result).toBeNull();
  });

  it('handles missing pagination field (defaults to 1 page)', async () => {
    mockFetchOk({ data: [] });
    const result = await findGelatoProductByShopifyId('store-1', '999');
    expect(result).toBeNull();
  });
});
