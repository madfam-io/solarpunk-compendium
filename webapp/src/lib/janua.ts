/**
 * Janua Authentication Client (Stub)
 *
 * Janua is MADFAM's self-hosted auth + monetization + email platform.
 * This is a stub implementation until the SDK is available.
 *
 * TODO: Replace with actual @janua/typescript-sdk when available
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

// Stub client implementation
interface JanuaClient {
	setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
	auth: {
		signUp: (params: {
			email: string;
			password: string;
			first_name?: string;
			last_name?: string;
		}) => Promise<AuthResponse>;
		signIn: (params: { email: string; password: string }) => Promise<AuthResponse>;
		signOut: () => Promise<void>;
		refreshTokens: (params: { refreshToken: string }) => Promise<AuthResponse>;
		getOAuthUrl: (params: { provider: string }) => Promise<{ url: string }>;
		handleOAuthCallback: (params: {
			provider: string;
			code: string;
			state?: string;
		}) => Promise<AuthResponse>;
		requestPasswordReset: (params: { email: string }) => Promise<void>;
		resetPassword: (params: { token: string; password: string }) => Promise<void>;
		requestEmailVerification: (params: { email: string }) => Promise<void>;
	};
	users: {
		getCurrentUser: () => Promise<JanuaUser>;
		updateUser: (params: {
			first_name?: string;
			last_name?: string;
			avatar?: string;
		}) => Promise<JanuaUser>;
		updatePassword: (params: {
			current_password: string;
			new_password: string;
		}) => Promise<void>;
	};
	sessions: {
		getActiveSessions: () => Promise<JanuaSession[]>;
		revokeSession: (params: { sessionId: string }) => Promise<void>;
	};
}

// Create stub client
function createStubClient(): JanuaClient {
	const notImplemented = (method: string) => {
		return () => {
			console.warn(`[Janua Stub] ${method} not implemented - SDK not available`);
			throw new Error(`Janua SDK not available: ${method}`);
		};
	};

	return {
		setTokens: () => {
			// No-op in stub
		},
		auth: {
			signUp: notImplemented('auth.signUp'),
			signIn: notImplemented('auth.signIn'),
			signOut: async () => {
				// Allow signout to succeed silently
			},
			refreshTokens: notImplemented('auth.refreshTokens'),
			getOAuthUrl: notImplemented('auth.getOAuthUrl'),
			handleOAuthCallback: notImplemented('auth.handleOAuthCallback'),
			requestPasswordReset: notImplemented('auth.requestPasswordReset'),
			resetPassword: notImplemented('auth.resetPassword'),
			requestEmailVerification: notImplemented('auth.requestEmailVerification')
		},
		users: {
			getCurrentUser: notImplemented('users.getCurrentUser'),
			updateUser: notImplemented('users.updateUser'),
			updatePassword: notImplemented('users.updatePassword')
		},
		sessions: {
			getActiveSessions: notImplemented('sessions.getActiveSessions'),
			revokeSession: notImplemented('sessions.revokeSession')
		}
	};
}

// Create the Janua client (stub)
export const janua = createStubClient();

// Token management helpers
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
		janua.setTokens({ accessToken, refreshToken });
	},

	clearTokens(): void {
		if (!browser) return;
		localStorage.removeItem('janua_access_token');
		localStorage.removeItem('janua_refresh_token');
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
