import { test, expect } from '../playwright-fixture';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Drive Hub/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');

  // Click the get started link (adjust selector as needed).
  // This is a placeholder test.
  // await page.getByRole('link', { name: 'Get started' }).click();

  // await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
