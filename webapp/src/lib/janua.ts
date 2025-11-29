/**
 * Janua Authentication Client
 *
 * Janua is MADFAM's self-hosted auth + monetization + email platform.
 * This module initializes the client for use throughout the app.
 */

import { createClient } from '@janua/typescript-sdk';
import { browser } from '$app/environment';

// Configuration from environment variables
const JANUA_API_URL = import.meta.env.PUBLIC_JANUA_API_URL || 'http://localhost:8001';
const JANUA_APP_ID = import.meta.env.PUBLIC_JANUA_APP_ID || 'solarpunk-almanac';

// Create the Janua client
export const janua = createClient({
	baseURL: JANUA_API_URL,
	appId: JANUA_APP_ID
});

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
