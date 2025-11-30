/**
 * E2E Tests - Home Page
 *
 * Tests for the main landing page and newsletter signup
 */

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
	test('should load successfully', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Solarpunk Almanac/);
	});

	test('should display hero section', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('text=Practical wisdom for regenerative living')).toBeVisible();
	});

	test('should show newsletter signup form', async ({ page }) => {
		await page.goto('/');
		const emailInput = page.locator('input[type="email"]');
		await expect(emailInput).toBeVisible();
	});

	test('should validate email on newsletter signup', async ({ page }) => {
		await page.goto('/');
		const emailInput = page.locator('input[type="email"]');
		const submitButton = page.locator('button[type="submit"]');

		// Try invalid email
		await emailInput.fill('invalid-email');
		await submitButton.click();

		// Should show validation error or browser validation
		const isInvalid = await emailInput.evaluate(
			(el) => !(el as HTMLInputElement).checkValidity()
		);
		expect(isInvalid).toBe(true);
	});

	test('should submit valid email successfully', async ({ page }) => {
		await page.goto('/');
		const emailInput = page.locator('input[type="email"]');
		const submitButton = page.locator('button[type="submit"]');

		// Wait for the form
		await expect(emailInput).toBeVisible();

		// Submit valid email
		await emailInput.fill('test@example.com');
		await submitButton.click();

		// Should show success message (or handle the response)
		// Note: This depends on actual API response
	});

	test('should navigate to editions', async ({ page }) => {
		await page.goto('/');
		await page.click('text=Editions');
		await expect(page).toHaveURL(/\/editions/);
	});

	test('should navigate to directory', async ({ page }) => {
		await page.goto('/');
		await page.click('text=Directory');
		await expect(page).toHaveURL(/\/directory/);
	});

	test('should toggle dark/light theme', async ({ page }) => {
		await page.goto('/');
		const themeToggle = page.locator('[aria-label*="theme"], [title*="theme"]');

		if (await themeToggle.isVisible()) {
			const initialTheme = await page.evaluate(() =>
				document.documentElement.classList.contains('dark')
			);
			await themeToggle.click();
			const newTheme = await page.evaluate(() =>
				document.documentElement.classList.contains('dark')
			);
			expect(newTheme).not.toBe(initialTheme);
		}
	});
});
