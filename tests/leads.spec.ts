import { test, expect, Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for dashboard content — server action redirects don't update URL in Playwright
  await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 20000 });
}

test.describe('Lead Management', () => {
  test('Admin can see all leads', async ({ page }) => {
    await login(page, 'admin@company.com', 'password123');
    await page.goto('/dashboard/leads');
    await expect(page.locator('h1')).toContainText('All Leads');
  });

  test('Agent can only see their leads', async ({ page }) => {
    await login(page, 'karan_sub@company.com', 'password123');
    await page.goto('/dashboard/leads');
    await expect(page.locator('h1')).toContainText('My Assigned Leads');
  });

  test('Create a new lead', async ({ page }) => {
    await login(page, 'admin@company.com', 'password123');
    await page.goto('/dashboard/leads/new');

    const uniquePhone = `77${Date.now().toString().slice(-8)}`;
    await page.fill('input[name="name"]', 'Test Lead Playwright');
    await page.fill('input[name="location"]', 'Bangalore');
    await page.fill('input[name="phoneNumber"]', uniquePhone);

    // Tab away from phone to trigger onBlur duplicate check and wait for result
    await page.press('input[name="phoneNumber"]', 'Tab');
    await expect(page.locator('text=Phone number is available')).toBeVisible({ timeout: 5000 });

    // Select an owner (required for ADMIN role form)
    const ownerSelect = page.locator('select[name="ownerId"]');
    if (await ownerSelect.isVisible()) {
      await ownerSelect.selectOption({ index: 1 }); // Pick first available agent
    }

    // Submit — the form uses React startTransition + router.push upon success
    await page.click('button[type="submit"]');

    // After success → router.push('/dashboard/leads') → h1 changes to "All Leads"
    await expect(page.locator('h1')).toContainText('All Leads', { timeout: 30000 });
  });

  test('Duplicate check for existing phone number', async ({ page }) => {
    await login(page, 'admin@company.com', 'password123');
    await page.goto('/dashboard/leads/new');

    await page.fill('input[name="name"]', 'Duplicate Test');
    await page.fill('input[name="location"]', 'Mumbai');
    // Fill the phone and tab away to trigger the onBlur duplicate check
    await page.fill('input[name="phoneNumber"]', '9876543210'); // seeded phone (Ravi Sharma)
    await page.press('input[name="phoneNumber"]', 'Tab'); // Trigger onBlur

    // The duplicate warning appears (button is also disabled when duplicate detected)
    await expect(page.locator('body')).toContainText(/phone belongs to|Ravi Sharma/i, { timeout: 10000 });
  });
});
