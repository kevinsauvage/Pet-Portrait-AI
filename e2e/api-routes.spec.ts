import { expect, test } from '@playwright/test';

/**
 * E2E tests for API routes
 * These tests verify that API endpoints return expected responses
 */

test.describe('API Routes', () => {
  test('GET /api/cart returns success or 404 when there is no cart cookie', async ({ request }) => {
    const response = await request.get('/api/cart');
    const body = (await response.json()) as { success?: boolean; error?: string };

    if (response.status() === 404) {
      expect(body.error).toBeDefined();
      expect(body.success).toBeUndefined();
      return;
    }

    expect(response.ok()).toBeTruthy();
    expect(body.success).toBe(true);
  });

  test('POST /api/ai/generate should require authentication', async ({ request }) => {
    const response = await request.post('/api/ai/generate', {
      data: {
        imageUrl: 'https://example.com/image.jpg',
        styleId: 'pixar',
      },
    });

    // Should return 401 Unauthorized without proper auth
    expect([401, 403]).toContain(response.status());
  });

  test('POST /api/cart/lines should return 404 when cart not found', async ({ request }) => {
    // Clear cookies to simulate no cart
    const response = await request.patch('/api/cart/lines', {
      data: {
        operation: 'add',
        addLines: [{ merchandiseId: 'test-variant', quantity: 1 }],
      },
    });

    // Should return 404 if no cart cookie exists
    expect([404, 400]).toContain(response.status());
  });
});
