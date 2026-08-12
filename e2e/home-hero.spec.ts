import { expect, test } from '@playwright/test';

const viewportSizes = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 600 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
] as const;

test.describe('customer storefront hero', () => {
  for (const viewport of viewportSizes) {
    test(`fills the first screen at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'networkidle' });

      const hero = page.locator('section[aria-labelledby="home-title"]');
      const title = page.getByRole('heading', {
        name: 'Gas and water, brought to your door.',
      });

      await expect(hero).toBeVisible();
      await expect(title).toBeVisible();
      await expect(page.getByRole('link', { name: 'Shop essentials' })).toBeVisible();
      await expect(
        page.getByRole('link', { name: /View delivery fees/ }),
      ).toBeVisible();

      const layout = await page.evaluate(() => {
        const header = document.querySelector('header')?.getBoundingClientRect();
        const heroElement = document.querySelector(
          'section[aria-labelledby="home-title"]',
        );
        const heroRect = heroElement?.getBoundingClientRect();
        const image = heroElement?.querySelector('img');
        const heading = document.querySelector('#home-title');

        return {
          headerTop: header?.top,
          firstScreenBottom: heroRect?.bottom,
          imageLoaded:
            image instanceof HTMLImageElement &&
            image.complete &&
            image.naturalWidth > 0,
          titleColor: heading ? getComputedStyle(heading).color : null,
          overflowX:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        };
      });

      expect(layout.headerTop).toBe(0);
      expect(layout.firstScreenBottom).toBeCloseTo(viewport.height, 0);
      expect(layout.imageLoaded).toBe(true);
      expect(layout.titleColor).toBe('rgb(255, 255, 255)');
      expect(layout.overflowX).toBe(false);

      const rulerTransition = await page
        .getByRole('link', { name: /View delivery fees/ })
        .evaluate((element) => getComputedStyle(element).transitionDuration);
      expect(rulerTransition).toBe('0s');

      if (viewport.width === 320) {
        const rulerFits = await page
          .getByRole('link', { name: /View delivery fees/ })
          .locator('span')
          .last()
          .evaluate((element) => element.scrollWidth <= element.clientWidth);
        expect(rulerFits).toBe(true);
      }

      await page.evaluate(() => window.scrollTo(0, 500));
      await expect.poll(async () =>
        page.locator('header').evaluate((element) => element.getBoundingClientRect().top),
      ).toBe(0);
    });
  }

  test('keeps hero content visible when reduced motion is requested', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(
      page.getByRole('heading', { name: 'Gas and water, brought to your door.' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Shop essentials' })).toBeVisible();
  });

  test('reserves fixed-header space on customer pages', async ({ page }) => {
    await page.goto('/customer/cart', { waitUntil: 'networkidle' });

    const positions = await page.evaluate(() => {
      const header = document.querySelector('header')?.getBoundingClientRect();
      const banner = document.querySelector('header + div')?.getBoundingClientRect();

      return {
        headerBottom: header?.bottom,
        bannerTop: banner?.top,
      };
    });

    expect(positions.bannerTop).toBeGreaterThanOrEqual(
      (positions.headerBottom ?? 0) - 1,
    );
  });
});
