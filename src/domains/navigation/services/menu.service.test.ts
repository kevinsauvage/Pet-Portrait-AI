import { getSiteMenus } from './menu.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    getMenuByHandle: vi.fn(({ handle }: { handle: string }) =>
      Promise.resolve({
        menu: { items: [{ title: handle === 'main-menu' ? 'Home' : 'Footer' }] },
      }),
    ),
  })),
}));

describe('menu.service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns header and footer menus', async () => {
    const result = await getSiteMenus();
    expect(result).toHaveProperty('headerMenu');
    expect(result).toHaveProperty('footerMenu');
    expect(result.headerMenu?.items).toHaveLength(1);
    expect(result.footerMenu?.items).toHaveLength(1);
  });
});
