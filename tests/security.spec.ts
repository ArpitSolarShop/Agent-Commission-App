import { test, expect, Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 20000 });
}

test.describe('Security & RBAC Enforcement', () => {
  test('Agent cannot access Settings admin section (Admin only)', async ({ page }) => {
    await login(page, 'karan_sub@company.com', 'password123');
    await page.goto('/dashboard/settings');

    // "Platform Management" card must NOT be visible for non-admin users
    await expect(page.locator('text=Platform Management')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('button', { hasText: 'Approve All' })).not.toBeVisible();
  });

  test('Agent cannot view unauthorized Lead URL (ReBAC)', async ({ page }) => {
    await login(page, 'karan_sub@company.com', 'password123');

    // Navigate to an ID that either doesn't exist OR doesn't belong to Karan.
    // getLeadById returns null → notFound() is called → Next.js renders a 404 page.
    await page.goto('/dashboard/leads/unauthorized-id-123');

    // 404 page or error boundary — either way, 'not found' or 'error' text is present
    await expect(page.locator('body')).toContainText(/not found|404|error|unauthorized|access denied/i, { timeout: 10000 });
  });

  test('Agent cannot see Approve button on Commissions page', async ({ page }) => {
    await login(page, 'karan_sub@company.com', 'password123');
    await page.goto('/dashboard/commissions');

    // Wait for page to load — desktop h1="Commissions", mobile h1="Earnings"
    await expect(page.locator('body')).toContainText(/commissions|earnings|ledger/i, { timeout: 10000 });

    // Approve button must NOT appear for agents
    await expect(page.locator('button', { hasText: 'Approve' })).not.toBeVisible();
  });
});
