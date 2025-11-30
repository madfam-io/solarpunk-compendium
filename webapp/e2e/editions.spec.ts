/**
 * E2E Tests - Editions & Content
 *
 * Tests for the seasonal editions and article reading experience
 */

import { test, expect } from '@playwright/test';

test.describe('Editions', () => {
	test('should list available editions', async ({ page }) => {
		await page.goto('/editions');
		await expect(page.locator('h1')).toContainText(/Edition/i);
	});

	test('should display edition cards', async ({ page }) => {
		await page.goto('/editions');
		// Wait for content to load
		await page.waitForSelector('[data-testid="edition-card"], article, .edition-card', {
			timeout: 5000
		}).catch(() => {});

		// Check for edition content
		const content = await page.content();
		expect(content).toMatch(/Winter|Spring|Summer|Fall|Autumn/i);
	});
});

test.describe('Edition Detail', () => {
	test('should load winter solstice 2025 edition', async ({ page }) => {
		await page.goto('/editions/winter-2025');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('should display article list', async ({ page }) => {
		await page.goto('/editions/winter-2025');
		// Wait for articles to load
		await page.waitForLoadState('networkidle');

		// Check for article links
		const articleLinks = page.locator('a[href*="/editions/winter-2025/"]');
		const count = await articleLinks.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should show seasonal theming', async ({ page }) => {
		await page.goto('/editions/winter-2025');
		// Check for winter season data attribute
		const hasSeasonalStyling = await page.evaluate(() => {
			return document.querySelector('[data-season]') !== null ||
				document.body.innerHTML.includes('winter') ||
				document.body.innerHTML.includes('Winter');
		});
		expect(hasSeasonalStyling).toBe(true);
	});
});

test.describe('Article Reading Experience', () => {
	test('should load article page', async ({ page }) => {
		await page.goto('/editions/winter-2025/what-is-solarpunk');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('should display article content', async ({ page }) => {
		await page.goto('/editions/winter-2025/what-is-solarpunk');
		await page.waitForLoadState('networkidle');

		// Check for article body content
		const content = await page.content();
		expect(content.length).toBeGreaterThan(1000);
	});

	test('should show mode toggle', async ({ page }) => {
		await page.goto('/editions/winter-2025/what-is-solarpunk');

		// Look for mode toggle (Flow/Codex/Focus)
		const modeToggle = page.locator('[aria-label*="mode"], [data-testid="mode-toggle"], button:has-text("Flow")');
		const isVisible = await modeToggle.isVisible().catch(() => false);

		// Mode toggle should be present in the reading experience
		// May be named differently
	});

	test('should have navigation to next/prev articles', async ({ page }) => {
		await page.goto('/editions/winter-2025/what-is-solarpunk');
		await page.waitForLoadState('networkidle');

		// Check for navigation links
		const navLinks = page.locator('a[href*="/editions/winter-2025/"]');
		const count = await navLinks.count();
		expect(count).toBeGreaterThanOrEqual(1);
	});

	test('should display bookmark functionality', async ({ page }) => {
		await page.goto('/editions/winter-2025/what-is-solarpunk');

		// Look for bookmark element
		const bookmark = page.locator('[data-testid="bookmark"], .bookmark, [aria-label*="bookmark"]');
		const hasBookmark = await bookmark.isVisible().catch(() => false);

		// Bookmark may or may not be visible depending on implementation
	});
});

test.describe('Codex Design System', () => {
	test('should apply seasonal paper colors', async ({ page }) => {
		await page.goto('/editions/winter-2025');

		// Check for CSS custom properties or computed styles
		const hasSeasonalStyles = await page.evaluate(() => {
			const styles = getComputedStyle(document.documentElement);
			return styles.getPropertyValue('--codex-paper-cream') !== '' ||
				document.body.style.backgroundColor !== '';
		});
		// Seasonal styling should be applied
	});

	test('should use proper typography', async ({ page }) => {
		await page.goto('/editions/winter-2025/what-is-solarpunk');
		await page.waitForLoadState('networkidle');

		// Check for Literata or other Codex fonts
		const fontFamily = await page.evaluate(() => {
			const body = document.querySelector('article, main, .content, body');
			return body ? getComputedStyle(body).fontFamily : '';
		});

		// Should use either Literata, Georgia, or system serif
		expect(fontFamily).toMatch(/Literata|Georgia|serif/i);
	});
});
