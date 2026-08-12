import { expect, test } from '@playwright/test';

const brandName = 'MRJE Gas + Bright Star Water';

test.describe('customer storefront header', () => {
  test('transitions from the hero treatment to a solid header on scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const header = page.locator('header');
    const logo = page.getByRole('link', { name: brandName }).first().locator('img');

    await expect(header).toHaveAttribute('data-surface', 'transparent');
    await expect(header).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect.poll(() => logo.evaluate((image) => getComputedStyle(image).filter))
      .toContain('invert(1)');

    await page.evaluate(() => window.scrollTo(0, 24));
    await expect(header).toHaveAttribute('data-surface', 'solid');
    await expect.poll(() => logo.evaluate((image) => getComputedStyle(image).filter))
      .toBe('none');

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).toHaveAttribute('data-surface', 'transparent');
  });

  test('keeps the primary choices beside the utility actions on desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const navigation = page.getByRole('navigation', {
      name: 'Customer navigation',
    });
    const utilities = page.getByRole('navigation', {
      name: 'Customer utilities',
    });
    const shopButton = navigation.getByRole('button', { name: 'Shop' });

    await expect(shopButton).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Delivery' })).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'My orders' })).toBeVisible();
    await expect(
      utilities.getByRole('link', { name: 'Search products' }),
    ).toBeVisible();

    const positions = await page.evaluate(() => {
      const primary = document.querySelector(
        'nav[aria-label="Customer navigation"]',
      )?.getBoundingClientRect();
      const utility = document.querySelector(
        'nav[aria-label="Customer utilities"]',
      )?.getBoundingClientRect();

      return {
        primaryRight: primary?.right ?? 0,
        utilityLeft: utility?.left ?? 0,
      };
    });

    expect(positions.utilityLeft - positions.primaryRight).toBeLessThanOrEqual(40);
  });

  test('sequences the solid header before entry and after the menu outro', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const shopButton = page.getByRole('button', { name: 'Shop' });
    const header = page.locator('header');
    const megaMenu = page.getByRole('region', { name: 'Shop menu' });
    await shopButton.click();

    await expect(header).toHaveAttribute('data-surface', 'solid');
    await expect(header).toHaveAttribute('data-shop-menu-phase', 'opening');
    await expect(megaMenu).toBeHidden();
    await page.waitForTimeout(900);
    await expect(megaMenu).toBeHidden();

    await expect(megaMenu).toBeVisible({ timeout: 1000 });
    await expect(header).toHaveAttribute('data-shop-menu-phase', 'open', {
      timeout: 1000,
    });
    await expect(megaMenu.getByRole('link')).toHaveCount(9);
    await expect(megaMenu.getByText('Products', { exact: true })).toBeVisible();
    await expect(
      megaMenu.getByText('Customer service', { exact: true }),
    ).toBeVisible();
    await expect(megaMenu.getByText('Your order', { exact: true })).toBeVisible();
    await expect.poll(() => megaMenu.evaluate((menu) => menu.getBoundingClientRect().height))
      .toBeGreaterThan(200);

    await page.keyboard.press('Escape');
    await expect(header).toHaveAttribute('data-shop-menu-phase', 'closing');
    await expect(header).toHaveAttribute('data-surface', 'solid');
    await expect(megaMenu).toBeHidden();
    await expect(shopButton).toBeFocused();
    await page.waitForTimeout(900);
    await expect(header).toHaveAttribute('data-surface', 'solid');
    await expect(header).toHaveAttribute('data-shop-menu-phase', 'closing');
    await expect(header).toHaveAttribute('data-shop-menu-phase', 'closed', {
      timeout: 1000,
    });
    await expect(header).toHaveAttribute('data-surface', 'transparent', {
      timeout: 1000,
    });
  });

  test('uses the supplied logo on solid pages and for browser metadata', async ({
    page,
  }) => {
    await page.goto('/shop', { waitUntil: 'networkidle' });

    const header = page.locator('header');
    const logo = page.getByRole('link', { name: brandName }).first().locator('img');
    await expect(header).toHaveAttribute('data-surface', 'solid');
    await expect(logo).toHaveAttribute('src', /logo\.png/);
    await expect(logo).toHaveCSS('filter', 'none');

    const iconHrefs = await page
      .locator('link[rel~="icon"], link[rel="apple-touch-icon"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(iconHrefs.some((href) => href?.includes('/logo.png'))).toBe(true);
  });

  test('uses the complete drawer at tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(
      page.getByRole('navigation', { name: 'Customer navigation' }),
    ).toBeHidden();
    await expect(page.getByRole('link', { name: 'Search products' })).toBeVisible();

    const menuButton = page.getByRole('button', { name: 'Open navigation' });
    await menuButton.click();
    await expect(page.locator('header')).toHaveAttribute(
      'data-surface',
      'transparent',
    );
    const drawerNavigation = page.getByRole('navigation', {
      name: 'Customer mobile navigation',
    });
    await expect(drawerNavigation).toBeVisible();
    await expect(drawerNavigation.getByRole('link')).toHaveCount(9);
    await expect(
      drawerNavigation.getByRole('link', { name: 'Delivery area' }),
    ).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(drawerNavigation).toBeHidden();
    await expect(menuButton).toBeFocused();
  });

  test('keeps mobile utilities uncluttered and moves all choices into the drawer', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.getByRole('link', { name: brandName }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Search products' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Customer account' })).toBeHidden();

    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.locator('header')).toHaveAttribute(
      'data-surface',
      'transparent',
    );
    await expect(
      page.getByRole('navigation', { name: 'Customer mobile navigation' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Search', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Account', exact: true })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test('keeps the mobile header solid after the hero has been scrolled', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 120));

    const header = page.locator('header');
    await expect(header).toHaveAttribute('data-surface', 'solid');
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(header).toHaveAttribute('data-surface', 'solid');
  });

  test('cancels stale menu timers during rapid desktop toggles', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const header = page.locator('header');
    const shopButton = page.getByRole('button', { name: 'Shop' });
    const megaMenu = page.getByRole('region', { name: 'Shop menu' });

    await shopButton.click();
    await page.waitForTimeout(200);
    await shopButton.click();
    await page.waitForTimeout(200);
    await shopButton.click();

    await expect(header).toHaveAttribute('data-shop-menu-phase', 'opening');
    await expect(megaMenu).toBeVisible({ timeout: 2000 });
    await expect(header).toHaveAttribute('data-shop-menu-phase', 'open', {
      timeout: 2000,
    });
  });

  test('skips deliberate menu delays for reduced-motion users', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const header = page.locator('header');
    const megaMenu = page.getByRole('region', { name: 'Shop menu' });
    const shopButton = page.getByRole('button', { name: 'Shop' });

    await shopButton.click();
    await expect(megaMenu).toBeVisible();
    await expect(header).toHaveAttribute('data-shop-menu-phase', 'open');
    await shopButton.click();
    await expect(megaMenu).toBeHidden();
    await expect(header).toHaveAttribute('data-surface', 'transparent');
  });
});
