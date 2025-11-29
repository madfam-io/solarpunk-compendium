/**
 * Authentication Store
 *
 * Svelte stores for managing authentication state with Janua.
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { janua, tokenStorage, type JanuaUser, type AuthResponse } from '$lib/janua';

// Core auth state
export const user = writable<JanuaUser | null>(null);
export const isLoading = writable(true);
export const error = writable<string | null>(null);

// Derived stores
export const isAuthenticated = derived(user, ($user) => $user !== null);
export const userInitials = derived(user, ($user) => {
	if (!$user) return '';
	const first = $user.firstName?.[0] || $user.email[0];
	const last = $user.lastName?.[0] || '';
	return (first + last).toUpperCase();
});

/**
 * Initialize authentication state on app load
 */
export async function initializeAuth(): Promise<void> {
	if (!browser) {
		isLoading.set(false);
		return;
	}

	try {
		isLoading.set(true);
		error.set(null);

		// Check for existing tokens
		const hasTokens = tokenStorage.initializeFromStorage();

		if (hasTokens) {
			// Validate tokens by fetching current user
			try {
				const currentUser = await janua.users.getCurrentUser();
				user.set(currentUser);
			} catch (err) {
				// Tokens invalid, try refresh
				try {
					const refreshToken = tokenStorage.getRefreshToken();
					if (refreshToken) {
						const response = await janua.auth.refreshTokens({ refreshToken });
						tokenStorage.setTokens(response.accessToken, response.refreshToken);
						const currentUser = await janua.users.getCurrentUser();
						user.set(currentUser);
					}
				} catch {
					// Refresh failed, clear everything
					tokenStorage.clearTokens();
					user.set(null);
				}
			}
		}
	} catch (err) {
		console.error('Auth initialization error:', err);
		error.set('Failed to initialize authentication');
	} finally {
		isLoading.set(false);
	}
}

/**
 * Auth actions
 */
export const auth = {
	/**
	 * Sign up with email and password
	 */
	async signUp(params: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
	}): Promise<AuthResponse> {
		try {
			isLoading.set(true);
			error.set(null);

			const response = await janua.auth.signUp({
				email: params.email,
				password: params.password,
				first_name: params.firstName,
				last_name: params.lastName
			});

			tokenStorage.setTokens(response.accessToken, response.refreshToken);
			user.set(response.user);

			return response;
		} catch (err: any) {
			const message = err?.message || 'Sign up failed';
			error.set(message);
			throw new Error(message);
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Sign in with email and password
	 */
	async signIn(params: { email: string; password: string }): Promise<AuthResponse> {
		try {
			isLoading.set(true);
			error.set(null);

			const response = await janua.auth.signIn({
				email: params.email,
				password: params.password
			});

			tokenStorage.setTokens(response.accessToken, response.refreshToken);
			user.set(response.user);

			return response;
		} catch (err: any) {
			const message = err?.message || 'Sign in failed';
			error.set(message);
			throw new Error(message);
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Sign in with OAuth provider
	 */
	async signInWithOAuth(provider: 'google' | 'github' | 'discord'): Promise<void> {
		try {
			error.set(null);
			const { url } = await janua.auth.getOAuthUrl({ provider });
			window.location.href = url;
		} catch (err: any) {
			error.set(err?.message || `${provider} sign in failed`);
			throw err;
		}
	},

	/**
	 * Handle OAuth callback
	 */
	async handleOAuthCallback(params: {
		provider: string;
		code: string;
		state?: string;
	}): Promise<AuthResponse> {
		try {
			isLoading.set(true);
			error.set(null);

			const response = await janua.auth.handleOAuthCallback(params);
			tokenStorage.setTokens(response.accessToken, response.refreshToken);
			user.set(response.user);

			return response;
		} catch (err: any) {
			error.set(err?.message || 'OAuth callback failed');
			throw err;
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Sign out
	 */
	async signOut(redirectTo = '/'): Promise<void> {
		try {
			await janua.auth.signOut();
		} catch {
			// Ignore signout errors
		} finally {
			tokenStorage.clearTokens();
			user.set(null);
			error.set(null);

			if (browser) {
				await goto(redirectTo);
			}
		}
	},

	/**
	 * Request password reset email
	 */
	async requestPasswordReset(email: string): Promise<void> {
		try {
			isLoading.set(true);
			error.set(null);
			await janua.auth.requestPasswordReset({ email });
		} catch (err: any) {
			error.set(err?.message || 'Password reset request failed');
			throw err;
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Reset password with token
	 */
	async resetPassword(token: string, newPassword: string): Promise<void> {
		try {
			isLoading.set(true);
			error.set(null);
			await janua.auth.resetPassword({ token, password: newPassword });
		} catch (err: any) {
			error.set(err?.message || 'Password reset failed');
			throw err;
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Request email verification
	 */
	async requestEmailVerification(): Promise<void> {
		const currentUser = get(user);
		if (!currentUser) throw new Error('Not authenticated');

		try {
			isLoading.set(true);
			error.set(null);
			await janua.auth.requestEmailVerification({ email: currentUser.email });
		} catch (err: any) {
			error.set(err?.message || 'Email verification request failed');
			throw err;
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Update user profile
	 */
	async updateProfile(params: {
		firstName?: string;
		lastName?: string;
		avatar?: string;
	}): Promise<JanuaUser> {
		try {
			isLoading.set(true);
			error.set(null);

			const updatedUser = await janua.users.updateUser({
				first_name: params.firstName,
				last_name: params.lastName,
				avatar: params.avatar
			});

			user.set(updatedUser);
			return updatedUser;
		} catch (err: any) {
			error.set(err?.message || 'Profile update failed');
			throw err;
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Change password
	 */
	async changePassword(currentPassword: string, newPassword: string): Promise<void> {
		try {
			isLoading.set(true);
			error.set(null);

			await janua.users.updatePassword({
				current_password: currentPassword,
				new_password: newPassword
			});
		} catch (err: any) {
			error.set(err?.message || 'Password change failed');
			throw err;
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Get active sessions
	 */
	async getSessions() {
		try {
			return await janua.sessions.getActiveSessions();
		} catch (err: any) {
			error.set(err?.message || 'Failed to fetch sessions');
			throw err;
		}
	},

	/**
	 * Revoke a session
	 */
	async revokeSession(sessionId: string): Promise<void> {
		try {
			await janua.sessions.revokeSession({ sessionId });
		} catch (err: any) {
			error.set(err?.message || 'Failed to revoke session');
			throw err;
		}
	},

	/**
	 * Clear error state
	 */
	clearError(): void {
		error.set(null);
	}
};
