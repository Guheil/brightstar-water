import { expect, test } from '@playwright/test';

test('shop addition updates the shared cart and checkout', async ({ page }) => {
  await page.goto('/shop');
  const cartLink = page.getByRole('link', { name: /Cart with \d+ items?/ });
  const initialLabel = await cartLink.getAttribute('aria-label');
  const initialCount = Number(initialLabel?.match(/\d+/)?.[0] ?? 0);

  await page.getByRole('button', { name: 'Add to prototype cart' }).first().click();
  await expect(
    page.getByText(/added to your prototype cart/i).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: `Cart with ${initialCount + 1} items` }),
  ).toBeVisible();

  await page.goto('/customer/cart');
  await expect(page.getByRole('heading', { name: 'Your cart' })).toBeVisible();
  await expect(page.getByText(/Items \(\d+\)/)).toBeVisible();
  await page.getByRole('link', { name: 'Continue to checkout' }).click();
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
});

test('login redirects each demo role to its workspace', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/customer\/account$/);
  await expect(page.getByRole('heading', { name: /Good day, Maya Demo/i })).toBeVisible();

  await page.goto('/login');
  const adminEmail = page.getByRole('textbox', { name: 'Demo email' });
  await expect(adminEmail).toHaveValue('customer.demo@example.test');
  await adminEmail.fill('admin.demo@example.test');
  await expect(adminEmail).toHaveValue('admin.demo@example.test');
  await page.getByLabel('Demo password').fill('demo-only');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin\/overview$/);
  await expect(page.getByRole('heading', { name: 'Operational overview' })).toBeVisible();

  await page.goto('/login');
  const delivererEmail = page.getByRole('textbox', { name: 'Demo email' });
  await expect(delivererEmail).toHaveValue('customer.demo@example.test');
  await delivererEmail.fill('deliverer.demo@example.test');
  await expect(delivererEmail).toHaveValue('deliverer.demo@example.test');
  await page.getByLabel('Demo password').fill('demo-only');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/deliverer\/deliveries$/);
  await expect(page.getByRole('heading', { name: 'Active deliveries' })).toBeVisible();
});

test('deliverer progresses an assigned delivery into the active route', async ({ page }) => {
  await page.goto('/deliverer/deliveries');
  await page.getByRole('link', { name: /1:00 PM/ }).click();
  await expect(page.getByRole('button', { name: 'Accept assignment' })).toBeVisible();
  await page.getByRole('button', { name: 'Accept assignment' }).click();
  await expect(page.getByRole('button', { name: 'Start delivery' })).toBeVisible();
  await page.getByRole('button', { name: 'Start delivery' }).click();
  await expect(page.getByRole('button', { name: 'Mark delivered' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Report failed delivery' })).toBeVisible();
});
