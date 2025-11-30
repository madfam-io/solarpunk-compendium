/**
 * Vitest Test Setup
 *
 * Global setup for all tests
 */

import { vi } from 'vitest';

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
	browser: false,
	dev: true,
	building: false
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	preloadCode: vi.fn(),
	preloadData: vi.fn()
}));

vi.mock('$app/stores', () => {
	const readable = (value: unknown) => ({
		subscribe: (fn: (value: unknown) => void) => {
			fn(value);
			return () => {};
		}
	});

	return {
		page: readable({ url: new URL('http://localhost'), params: {} }),
		navigating: readable(null),
		updated: { check: vi.fn() }
	};
});

// Mock environment variables
vi.stubEnv('JANUA_API_URL', 'http://localhost:8001');
vi.stubEnv('PUBLIC_JANUA_API_URL', 'http://localhost:8001');
vi.stubEnv('PUBLIC_JANUA_APP_ID', 'solarpunk-almanac');
