import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('submits contact form successfully', async ({ page }) => {
    await page.goto('/contact');

    // Fill out the form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="subject"]', 'Test Subject');
    await page.fill('textarea[name="message"]', 'Test Message');

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for success message
    await expect(page.getByText('Message sent successfully')).toBeVisible();
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto('/contact');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check for error messages
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Subject is required')).toBeVisible();
    await expect(page.getByText('Message is required')).toBeVisible();
  });
});