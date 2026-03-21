/* eslint-disable no-await-in-loop */
import { expect, test } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';

/**
 * Accessibility tests using axe-core
 *
 * These tests ensure WCAG compliance and identify accessibility issues
 * that could prevent users with disabilities from using the application.
 */
const consentCookie = {
  name: 'localConsent',
  value: JSON.stringify({
    ad_storage: true,
    analytics_storage: true,
    functionality_storage: true,
    personalization_storage: true,
  }),
  domain: 'localhost',
  path: '/',
};

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([consentCookie]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await injectAxe(page);
    await checkA11y(page);
  });

  test('search page should have no accessibility violations', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    await injectAxe(page);
    await checkA11y(page);
  });

  test('contact form should have no accessibility violations', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    await injectAxe(page);
    await checkA11y(page);
  });

  test('product page should have no accessibility violations', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('a[href^="/shop/"]').filter({ has: page.locator('article') });
    if ((await productCards.count()) === 0) {
      test.skip();
      return;
    }

    const productHref = await productCards.first().getAttribute('href');
    if (!productHref) {
      test.skip();
      return;
    }

    await page.goto(productHref);
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(page);
  });

  test('skip links should be present and functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check skip links are present
    const skipLinks = page.locator('.skip-link');
    await expect(skipLinks).toHaveCount(3);

    // Test skip to main content
    await page.keyboard.press('Tab');
    const firstSkipLink = skipLinks.first();
    await expect(firstSkipLink).toBeFocused();

    // Verify skip link text
    await expect(firstSkipLink).toHaveText('Skip to main content');

    // Skip links sit under the header stacking context; use keyboard activation (realistic for SR users).
    await firstSkipLink.press('Enter');

    // Verify main content is focused
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Decorative images should have empty alt or role="presentation"
      if (alt === null && role !== 'presentation') {
        throw new Error(`Image at index ${i} is missing alt text`);
      }
    }
  });

  test('all form inputs should have labels', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const type = await input.getAttribute('type');

      // Skip hidden inputs
      if (type === 'hidden') continue;

      // Check if input has label
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = (await label.count()) > 0;

        if (!labelExists && !ariaLabel && !ariaLabelledBy) {
          throw new Error(`Input at index ${i} is missing label`);
        }
      } else if (!ariaLabel && !ariaLabelledBy) {
        throw new Error(`Input at index ${i} is missing label and id`);
      }
    }
  });

  test('keyboard navigation should work', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start from top of page
    await page.keyboard.press('Home');

    // Tab through interactive elements
    let focusableCount = 0;
    const maxTabs = 20; // Limit to prevent infinite loops

    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      const count = await focusedElement.count();

      if (count === 0) break;

      focusableCount++;

      // Check if element is visible
      const isVisible = await focusedElement.isVisible();
      expect(isVisible).toBe(true);
    }

    expect(focusableCount).toBeGreaterThan(0);
  });

  test('color contrast should meet WCAG AA standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await injectAxe(page);
    await checkA11y(page);
  });
});
