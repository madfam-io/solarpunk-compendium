/**
 * Janua Authentication Client
 *
 * Janua is MADFAM's self-hosted auth + monetization + email platform.
 * This is an HTTP client implementation that wraps Janua's REST API.
 *
 * When @janua/typescript-sdk is published, this can be replaced with the official SDK.
 * The interface is designed to be compatible with the future SDK.
 */

import { browser } from '$app/environment';

// Type definitions for Janua responses
export interface JanuaUser {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	avatar?: string;
	emailVerified: boolean;
	createdAt: string;
	metadata?: Record<string, unknown>;
}

export interface JanuaOrganization {
	id: string;
	name: string;
	slug: string;
	logo?: string;
	role: 'owner' | 'admin' | 'member';
}

export interface JanuaSession {
	id: string;
	userAgent: string;
	ipAddress: string;
	createdAt: string;
	lastActiveAt: string;
	isCurrent: boolean;
}

export interface AuthResponse {
	user: JanuaUser;
	accessToken: string;
	refreshToken: string;
}

export interface JanuaError {
	code: string;
	message: string;
	status: number;
}

// Client configuration
interface JanuaConfig {
	apiUrl: string;
	appId: string;
	apiSecret?: string;
}

// Get config from environment
function getConfig(): JanuaConfig {
	if (browser) {
		// Client-side: use public env vars (injected at build time or from window)
		const win = window as Window & { __JANUA_API_URL__?: string; __JANUA_APP_ID__?: string };
		return {
			apiUrl:
				win.__JANUA_API_URL__ ||
				import.meta.env.PUBLIC_JANUA_API_URL ||
				'http://localhost:8001',
			appId:
				win.__JANUA_APP_ID__ ||
				import.meta.env.PUBLIC_JANUA_APP_ID ||
				'solarpunk-almanac'
		};
	} else {
		// Server-side: use private env vars
		return {
			apiUrl: process.env.JANUA_API_URL || 'http://localhost:8001',
			appId: process.env.PUBLIC_JANUA_APP_ID || 'solarpunk-almanac',
			apiSecret: process.env.JANUA_API_SECRET
		};
	}
}

// HTTP client for Janua API
class JanuaHttpClient {
	private accessToken: string | null = null;
	private refreshToken: string | null = null;

	setTokens(tokens: { accessToken: string; refreshToken: string }): void {
		this.accessToken = tokens.accessToken;
		this.refreshToken = tokens.refreshToken;
	}

	clearTokens(): void {
		this.accessToken = null;
		this.refreshToken = null;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const config = getConfig();
		const url = `${config.apiUrl}${endpoint}`;

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'X-App-Id': config.appId,
			...(options.headers as Record<string, string>)
		};

		// Add auth header if we have a token
		if (this.accessToken) {
			headers['Authorization'] = `Bearer ${this.accessToken}`;
		}

		// Add API secret on server-side
		if (!browser && config.apiSecret) {
			headers['X-API-Key'] = config.apiSecret;
		}

		const response = await fetch(url, {
			...options,
			headers
		});

		if (!response.ok) {
			let error: JanuaError;
			try {
				const data = await response.json();
				error = {
					code: data.code || 'UNKNOWN_ERROR',
					message: data.message || response.statusText,
					status: response.status
				};
			} catch {
				error = {
					code: 'UNKNOWN_ERROR',
					message: response.statusText,
					status: response.status
				};
			}
			throw error;
		}

		// Handle empty responses (204 No Content)
		if (response.status === 204) {
			return undefined as T;
		}

		return response.json();
	}

	// Auth methods
	auth = {
		signUp: async (params: {
			email: string;
			password: string;
			first_name?: string;
			last_name?: string;
		}): Promise<AuthResponse> => {
			const response = await this.request<AuthResponse>('/api/v1/auth/signup', {
				method: 'POST',
				body: JSON.stringify({
					email: params.email,
					password: params.password,
					firstName: params.first_name,
					lastName: params.last_name
				})
			});

			// Store tokens
			this.setTokens({
				accessToken: response.accessToken,
				refreshToken: response.refreshToken
			});

			return response;
		},

		signIn: async (params: { email: string; password: string }): Promise<AuthResponse> => {
			const response = await this.request<AuthResponse>('/api/v1/auth/signin', {
				method: 'POST',
				body: JSON.stringify(params)
			});

			// Store tokens
			this.setTokens({
				accessToken: response.accessToken,
				refreshToken: response.refreshToken
			});

			return response;
		},

		signOut: async (): Promise<void> => {
			try {
				await this.request<void>('/api/v1/auth/signout', {
					method: 'POST'
				});
			} finally {
				// Always clear tokens, even if the request fails
				this.clearTokens();
			}
		},

		refreshTokens: async (params: { refreshToken: string }): Promise<AuthResponse> => {
			const response = await this.request<AuthResponse>('/api/v1/auth/refresh', {
				method: 'POST',
				body: JSON.stringify({ refreshToken: params.refreshToken })
			});

			// Update stored tokens
			this.setTokens({
				accessToken: response.accessToken,
				refreshToken: response.refreshToken
			});

			return response;
		},

		getOAuthUrl: async (params: { provider: string }): Promise<{ url: string }> => {
			const config = getConfig();
			const redirectUri = browser
				? `${window.location.origin}/auth/callback/${params.provider}`
				: `${process.env.APP_URL || 'http://localhost:5173'}/auth/callback/${params.provider}`;

			return this.request<{ url: string }>(
				`/api/v1/auth/oauth/${params.provider}/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`
			);
		},

		handleOAuthCallback: async (params: {
			provider: string;
			code: string;
			state?: string;
		}): Promise<AuthResponse> => {
			const response = await this.request<AuthResponse>(
				`/api/v1/auth/oauth/${params.provider}/callback`,
				{
					method: 'POST',
					body: JSON.stringify({
						code: params.code,
						state: params.state
					})
				}
			);

			// Store tokens
			this.setTokens({
				accessToken: response.accessToken,
				refreshToken: response.refreshToken
			});

			return response;
		},

		requestPasswordReset: async (params: { email: string }): Promise<void> => {
			await this.request<void>('/api/v1/auth/password/reset-request', {
				method: 'POST',
				body: JSON.stringify(params)
			});
		},

		resetPassword: async (params: { token: string; password: string }): Promise<void> => {
			await this.request<void>('/api/v1/auth/password/reset', {
				method: 'POST',
				body: JSON.stringify(params)
			});
		},

		requestEmailVerification: async (params: { email: string }): Promise<void> => {
			await this.request<void>('/api/v1/auth/email/verify-request', {
				method: 'POST',
				body: JSON.stringify(params)
			});
		},

		verifyEmail: async (params: { token: string }): Promise<void> => {
			await this.request<void>('/api/v1/auth/email/verify', {
				method: 'POST',
				body: JSON.stringify(params)
			});
		}
	};

	// User methods
	users = {
		getCurrentUser: async (): Promise<JanuaUser> => {
			return this.request<JanuaUser>('/api/v1/users/me');
		},

		updateUser: async (params: {
			first_name?: string;
			last_name?: string;
			avatar?: string;
		}): Promise<JanuaUser> => {
			return this.request<JanuaUser>('/api/v1/users/me', {
				method: 'PATCH',
				body: JSON.stringify({
					firstName: params.first_name,
					lastName: params.last_name,
					avatar: params.avatar
				})
			});
		},

		updatePassword: async (params: {
			current_password: string;
			new_password: string;
		}): Promise<void> => {
			await this.request<void>('/api/v1/users/me/password', {
				method: 'POST',
				body: JSON.stringify({
					currentPassword: params.current_password,
					newPassword: params.new_password
				})
			});
		}
	};

	// Session methods
	sessions = {
		getActiveSessions: async (): Promise<JanuaSession[]> => {
			return this.request<JanuaSession[]>('/api/v1/sessions');
		},

		revokeSession: async (params: { sessionId: string }): Promise<void> => {
			await this.request<void>(`/api/v1/sessions/${params.sessionId}`, {
				method: 'DELETE'
			});
		},

		revokeAllSessions: async (): Promise<void> => {
			await this.request<void>('/api/v1/sessions', {
				method: 'DELETE'
			});
		}
	};

	// Email methods (for sending transactional emails via Janua's Resend integration)
	email = {
		sendWelcome: async (params: { email: string; name?: string }): Promise<void> => {
			await this.request<void>('/api/v1/email/welcome', {
				method: 'POST',
				body: JSON.stringify(params)
			});
		},

		sendNewsletter: async (params: {
			to: string[];
			subject: string;
			content: string;
			templateId?: string;
		}): Promise<void> => {
			await this.request<void>('/api/v1/email/newsletter', {
				method: 'POST',
				body: JSON.stringify(params)
			});
		}
	};
}

// Create the Janua client instance
export const janua = new JanuaHttpClient();

// Token management helpers for browser-side persistence
export const tokenStorage = {
	getAccessToken(): string | null {
		if (!browser) return null;
		return localStorage.getItem('janua_access_token');
	},

	getRefreshToken(): string | null {
		if (!browser) return null;
		return localStorage.getItem('janua_refresh_token');
	},

	setTokens(accessToken: string, refreshToken: string): void {
		if (!browser) return;
		localStorage.setItem('janua_access_token', accessToken);
		localStorage.setItem('janua_refresh_token', refreshToken);
		// Also update the client's internal state
		janua.setTokens({ accessToken, refreshToken });
	},

	clearTokens(): void {
		if (!browser) return;
		localStorage.removeItem('janua_access_token');
		localStorage.removeItem('janua_refresh_token');
		janua.clearTokens();
	},

	initializeFromStorage(): boolean {
		if (!browser) return false;

		const accessToken = this.getAccessToken();
		const refreshToken = this.getRefreshToken();

		if (accessToken && refreshToken) {
			janua.setTokens({ accessToken, refreshToken });
			return true;
		}
		return false;
	}
};

// Helper to check if user is authenticated (browser-side)
export function isAuthenticated(): boolean {
	return tokenStorage.getAccessToken() !== null;
}

// Helper to get auth headers for fetch requests
export function getAuthHeaders(): Record<string, string> {
	const token = tokenStorage.getAccessToken();
	if (token) {
		return { Authorization: `Bearer ${token}` };
	}
	return {};
}
