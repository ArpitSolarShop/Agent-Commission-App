import { test, expect, Page } from '@playwright/test';

/**
 * Login helper for Next.js server action forms.
 * 
 * NOTE: After successful login via Next.js App Router server actions,
 * the page content changes to the dashboard but the browser URL may not
 * update synchronously in Playwright. We check for page content instead.
 */
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for the dashboard content to appear (h1 with "Dashboard" text)
  // This is more reliable than waitForURL for server action redirects
  await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 20000 });
}

test.describe('Authentication Flows', () => {
  test('Admin can login successfully', async ({ page }) => {
    await login(page, 'admin@company.com', 'password123');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('Sub-Agent can login successfully', async ({ page }) => {
    await login(page, 'karan_sub@company.com', 'password123');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('User can logout (desktop sidebar)', async ({ page }) => {
    // Skip on mobile — sidebar Logout button only visible on desktop
    const viewportWidth = page.viewportSize()?.width ?? 1280;
    test.skip(viewportWidth < 768, 'Logout button only visible on desktop sidebar');

    await login(page, 'admin@company.com', 'password123');

    const logoutBtn = page.locator('button', { hasText: 'Logout' });
    await logoutBtn.waitFor({ state: 'visible', timeout: 5000 });
    await logoutBtn.click();

    // After signout, content should return to login form
    await page.waitForSelector('input[name="email"]', { timeout: 15000 });
    await expect(page.locator('button[type="submit"]')).toContainText(/sign in/i);
  });
});
