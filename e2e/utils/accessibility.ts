import type { Page } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';

/**
 * Accessibility testing utilities for Playwright tests
 */

/**
 * Injects axe-core into the page and runs accessibility checks
 *
 * @param page - Playwright page instance
 * @param options - Optional axe configuration
 */
export async function runA11yCheck(
  page: Page,
  selector?: string,
  options?: {
    tags?: string[];
    rules?: Record<string, { enabled: boolean }>;
  },
): Promise<void> {
  await injectAxe(page);

  await checkA11y(page, selector, {
    detailedReport: true,
    detailedReportOptions: {
      html: true,
    },
    ...options,
  });
}

/**
 * Common accessibility test patterns
 */
export const a11yTestHelpers = {
  /**
   * Check if element is keyboard focusable
   */
  async isKeyboardFocusable(page: Page, selector: string): Promise<boolean> {
    const element = page.locator(selector);
    const tabIndex = await element.getAttribute('tabindex');
    const isDisabled = await element.isDisabled();
    const tagName = await element.evaluate((el) => el.tagName.toLowerCase());

    // Elements that are naturally focusable
    const naturallyFocusable = ['a', 'button', 'input', 'select', 'textarea', 'details', 'summary'];

    if (isDisabled) return false;
    if (tabIndex === '-1') return false;
    if (tabIndex !== null && parseInt(tabIndex, 10) >= 0) return true;
    if (naturallyFocusable.includes(tagName)) return true;

    return false;
  },

  /**
   * Check if element has proper ARIA label
   */
  async hasAriaLabel(page: Page, selector: string): Promise<boolean> {
    const element = page.locator(selector);
    const ariaLabel = await element.getAttribute('aria-label');
    const ariaLabelledBy = await element.getAttribute('aria-labelledby');
    const title = await element.getAttribute('title');

    return !!(ariaLabel || ariaLabelledBy || title);
  },

  /**
   * Check keyboard navigation order
   */
  async checkTabOrder(page: Page, selectors: string[]): Promise<boolean> {
    await page.keyboard.press('Tab');

    for (const selector of selectors) {
      const element = page.locator(selector);
      // eslint-disable-next-line no-await-in-loop
      const isFocused = await element.evaluate((el) => el === document.activeElement);

      if (!isFocused) {
        return false;
      }

      // eslint-disable-next-line no-await-in-loop
      await page.keyboard.press('Tab');
    }

    return true;
  },
};
