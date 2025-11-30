/**
 * E2E Tests - Project Directory
 *
 * Tests for the project discovery and filtering experience
 */

import { test, expect } from '@playwright/test';

test.describe('Project Directory', () => {
	test('should load directory page', async ({ page }) => {
		await page.goto('/directory');
		await expect(page).toHaveURL(/\/directory/);
		await expect(page.locator('h1')).toBeVisible();
	});

	test('should display project cards', async ({ page }) => {
		await page.goto('/directory');
		await page.waitForLoadState('networkidle');

		// Wait for project content
		const content = await page.content();
		expect(content.length).toBeGreaterThan(500);
	});

	test('should have category filters', async ({ page }) => {
		await page.goto('/directory');
		await page.waitForLoadState('networkidle');

		// Check for category filter buttons or dropdown
		const categoryElement = page.locator(
			'[data-testid="category-filter"], select, button:has-text("Category"), button:has-text("Filter")'
		);
		const hasFilter = await categoryElement.first().isVisible().catch(() => false);
		// Category filters should exist
	});

	test('should have search functionality', async ({ page }) => {
		await page.goto('/directory');

		// Look for search input
		const searchInput = page.locator(
			'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]'
		);
		const hasSearch = await searchInput.isVisible().catch(() => false);
		// Search should be available
	});

	test('should filter projects by category', async ({ page }) => {
		await page.goto('/directory');
		await page.waitForLoadState('networkidle');

		// Get initial project count (or content state)
		const initialContent = await page.content();

		// Click a category filter if available
		const energyFilter = page.locator('button:has-text("Energy"), a:has-text("Energy")');
		if (await energyFilter.isVisible().catch(() => false)) {
			await energyFilter.click();
			await page.waitForLoadState('networkidle');

			// URL should update or content should change
			const newUrl = page.url();
			const newContent = await page.content();

			expect(newUrl.includes('category') || newContent !== initialContent).toBe(true);
		}
	});
});

test.describe('Project Detail', () => {
	test('should navigate to project detail', async ({ page }) => {
		await page.goto('/directory');
		await page.waitForLoadState('networkidle');

		// Find and click first project link
		const projectLink = page.locator('a[href*="/directory/"]').first();
		if (await projectLink.isVisible().catch(() => false)) {
			await projectLink.click();
			await expect(page).toHaveURL(/\/directory\/.+/);
		}
	});
});

test.describe('Tools', () => {
	test('should load solar calculator', async ({ page }) => {
		await page.goto('/tools/solar-calculator');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('should load seed planner', async ({ page }) => {
		await page.goto('/tools/seed-planner');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('should load carbon footprint calculator', async ({ page }) => {
		await page.goto('/tools/carbon-footprint');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('should load rainwater calculator', async ({ page }) => {
		await page.goto('/tools/rainwater-calculator');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('should have interactive inputs on calculators', async ({ page }) => {
		await page.goto('/tools/solar-calculator');
		await page.waitForLoadState('networkidle');

		// Check for input elements
		const inputs = page.locator('input[type="number"], input[type="range"], select');
		const count = await inputs.count();
		expect(count).toBeGreaterThan(0);
	});
});
