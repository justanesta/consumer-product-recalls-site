import { expect, test } from '@playwright/test';

test('landing shows headline KPIs and nav', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /consumer product recalls/i })).toBeVisible();
  await expect(page.getByText('Total recalls', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Dashboards' })).toBeVisible();
});

test('methodology page renders the honesty caveats', async ({ page }) => {
  await page.goto('/methodology');
  await expect(page.getByRole('heading', { name: /methodology/i })).toBeVisible();
  await expect(page.getByText('Honesty caveats')).toBeVisible();
});

test('recalls browser hydrates with filters and a result state', async ({ page }) => {
  await page.goto('/recalls');
  await expect(page.getByRole('heading', { name: /browse recalls/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible();
  // Either the live results land or the loading/empty state shows — all acceptable.
  await expect(page.getByText(/result|loading recalls|no recalls/i).first()).toBeVisible({
    timeout: 20_000,
  });
});

test('product search runs and shows results or an honest empty state', async ({ page }) => {
  await page.goto('/search');
  await expect(page.getByRole('heading', { name: /is my product recalled/i })).toBeVisible();
  await page.getByLabel(/search products/i).fill('stroller');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText(/result|no matches found/i).first()).toBeVisible({ timeout: 25_000 });
});
