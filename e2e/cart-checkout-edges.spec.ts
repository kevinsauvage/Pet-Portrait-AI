import { expect, test } from '@playwright/test';

/**
 * Edge coverage for cart id cookie + Shopify userErrors (inventory/discount races).
 * Requires a running app with valid Storefront API credentials (same as `yarn dev`).
 */

const CART_COOKIE = 'x-cart-id';

/** Well-formed cart GID that should not exist on any real store (stale / expired checkout). */
const STALE_CART_GID = 'gid://shopify/Cart/01900000000000000000000000000000';

/** Variant GID that is valid-shaped but not purchasable on the connected store (maps to cart userErrors like OOS/invalid). */
const NON_PURCHASABLE_VARIANT_GID = 'gid://shopify/ProductVariant/11111111111111';

function decodeCartCookieValue(raw: string): string {
  if (!raw) return '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function waitForCartCookie(page: import('@playwright/test').Page): Promise<void> {
  await expect
    .poll(
      async () => {
        const cookies = await page.context().cookies();
        const raw = cookies.find((c) => c.name === CART_COOKIE)?.value ?? '';
        return decodeCartCookieValue(raw);
      },
      {
        timeout: 25_000,
        message:
          'Expected cart cookie after home load — check Storefront API env for the dev server',
      },
    )
    .toMatch(/^gid:\/\//);
}

test.describe('Shopify cart / checkout edges', () => {
  test.describe.configure({ mode: 'serial' });

  test('GET /api/cart returns 404 when the cookie cart no longer exists on Shopify', async ({
    request,
  }) => {
    const response = await request.get('/api/cart', {
      headers: {
        Cookie: `${CART_COOKIE}=${encodeURIComponent(STALE_CART_GID)}`,
      },
    });

    expect(response.status()).toBe(404);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toMatch(/cart/i);
  });

  test('PATCH /api/cart/lines returns 400 with userErrors for a non-purchasable variant', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForCartCookie(page);

    const response = await page.request.patch('/api/cart/lines', {
      data: {
        operation: 'add',
        addLines: [{ merchandiseId: NON_PURCHASABLE_VARIANT_GID, quantity: 1 }],
      },
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as { userErrors?: unknown[] };
    expect(Array.isArray(body.userErrors)).toBe(true);
    expect(body.userErrors!.length).toBeGreaterThan(0);
  });

  test('PATCH /api/cart/discount-codes surfaces rejection for an invalid discount code', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForCartCookie(page);

    const response = await page.request.patch('/api/cart/discount-codes', {
      data: {
        discountCodes: ['__E2E_INVALID_DISCOUNT_CODE__'],
      },
    });

    const body = (await response.json()) as {
      success?: boolean;
      userErrors?: unknown[];
      data?: { warnings?: Array<{ message?: string | null; code?: string | null }> };
    };

    if (response.status() === 400) {
      expect(Array.isArray(body.userErrors)).toBe(true);
      expect(body.userErrors!.length).toBeGreaterThan(0);
      return;
    }

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    const warnings = body.data?.warnings ?? [];
    expect(warnings.length).toBeGreaterThan(0);
  });

  test('order page treats a stale cart cookie like an empty cart', async ({ page, context }) => {
    await context.addCookies([
      {
        name: CART_COOKIE,
        value: STALE_CART_GID,
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/order');
    await expect(page.getByRole('heading', { level: 1, name: 'Your Cart' })).toBeVisible();
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });
});
