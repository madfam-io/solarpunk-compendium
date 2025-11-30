/**
 * Janua Client Tests
 *
 * Tests for the Janua authentication HTTP client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the browser check before importing janua
vi.mock('$app/environment', () => ({
	browser: false
}));

describe('Janua Client', () => {
	beforeEach(() => {
		vi.resetModules();
		global.fetch = vi.fn();
	});

	describe('Auth Methods', () => {
		it('should make signup request with correct payload', async () => {
			const mockResponse = {
				user: { id: '1', email: 'test@example.com', emailVerified: false, createdAt: new Date().toISOString() },
				accessToken: 'access-token',
				refreshToken: 'refresh-token'
			};

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve(mockResponse)
			});

			const { janua } = await import('./janua');
			const result = await janua.auth.signUp({
				email: 'test@example.com',
				password: 'password123',
				first_name: 'Test',
				last_name: 'User'
			});

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/v1/auth/signup'),
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({
						email: 'test@example.com',
						password: 'password123',
						firstName: 'Test',
						lastName: 'User'
					})
				})
			);

			expect(result.user.email).toBe('test@example.com');
			expect(result.accessToken).toBe('access-token');
		});

		it('should make signin request with correct payload', async () => {
			const mockResponse = {
				user: { id: '1', email: 'test@example.com', emailVerified: false, createdAt: new Date().toISOString() },
				accessToken: 'access-token',
				refreshToken: 'refresh-token'
			};

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve(mockResponse)
			});

			const { janua } = await import('./janua');
			const result = await janua.auth.signIn({
				email: 'test@example.com',
				password: 'password123'
			});

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/v1/auth/signin'),
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({
						email: 'test@example.com',
						password: 'password123'
					})
				})
			);

			expect(result.accessToken).toBe('access-token');
		});

		it('should throw error on failed auth request', async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
				json: () => Promise.resolve({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' })
			});

			const { janua } = await import('./janua');

			await expect(janua.auth.signIn({
				email: 'test@example.com',
				password: 'wrong-password'
			})).rejects.toMatchObject({
				code: 'INVALID_CREDENTIALS',
				status: 401
			});
		});
	});

	describe('User Methods', () => {
		it('should fetch current user', async () => {
			const mockUser = {
				id: '1',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				emailVerified: true,
				createdAt: new Date().toISOString()
			};

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve(mockUser)
			});

			const { janua } = await import('./janua');
			janua.setTokens({ accessToken: 'test-token', refreshToken: 'refresh-token' });
			const user = await janua.users.getCurrentUser();

			expect(user.email).toBe('test@example.com');
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/v1/users/me'),
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'Bearer test-token'
					})
				})
			);
		});
	});

	describe('Email Methods', () => {
		it('should send welcome email', async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				status: 204
			});

			const { janua } = await import('./janua');
			await janua.email.sendWelcome({ email: 'test@example.com', name: 'Test' });

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/v1/email/welcome'),
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ email: 'test@example.com', name: 'Test' })
				})
			);
		});
	});
});

describe('Token Storage', () => {
	it('should return null for tokens when not in browser', async () => {
		const { tokenStorage } = await import('./janua');

		expect(tokenStorage.getAccessToken()).toBeNull();
		expect(tokenStorage.getRefreshToken()).toBeNull();
	});
});
