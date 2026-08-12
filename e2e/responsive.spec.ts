import { expect, test } from '@playwright/test';

const widths = [320, 375, 390, 430, 768, 1024, 1280, 1440] as const;

const routes = [
  { path: '/', heading: 'Gas and water, brought to your door.' },
  { path: '/shop', heading: 'Shop household essentials' },
  { path: '/customer/cart', heading: 'Your cart' },
  { path: '/customer/checkout', heading: 'Checkout' },
  { path: '/admin/overview', heading: 'Operational overview' },
  { path: '/deliverer/deliveries', heading: 'Active deliveries' },
] as const;

test.describe('responsive route smoke checks', () => {
  for (const width of widths) {
    for (const route of routes) {
      test(`${route.path} fits ${width}px`, async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (message) => {
          if (message.type() === 'error') errors.push(message.text());
        });
        page.on('pageerror', (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route.path, { waitUntil: 'networkidle' });

        await expect(page.getByRole('heading', { name: route.heading })).toBeVisible();
        await expect(page.locator('main')).toHaveCount(1);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        ).toBe(true);
        expect(errors).toEqual([]);
      });
    }
  }
});
