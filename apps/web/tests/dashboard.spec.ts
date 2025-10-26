import { test, expect } from '@playwright/test';

const dashboardHeading = 'Plan a share';

test.describe('dashboard mobile layout', () => {
  test('renders planner and history on narrow viewports', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: dashboardHeading })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Schedule share' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Party shares' })).toBeVisible();

    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByText('Share history')).toBeVisible();

    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});
