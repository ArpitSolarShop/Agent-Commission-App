import { test, expect } from '@playwright/test';

test.describe('Smoke Testing - Page Loads', () => {
  test('Login page should load', async ({ page }) => {
    await page.goto('/login');
    // The page has h1 "Karan Agent Hub" and a submit button "Sign In"
    await expect(page.locator('h1')).toContainText('Karan Agent Hub');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
  });

  test('Public routes should redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    // Middleware will redirect – URL will contain /login (possibly with callbackUrl)
    await expect(page).toHaveURL(/\/login/);
  });
});
