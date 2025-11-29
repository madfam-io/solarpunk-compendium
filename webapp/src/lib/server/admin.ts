/**
 * Admin Authentication Helpers
 *
 * Utilities for protecting admin routes and API endpoints.
 * Admin access is controlled via ADMIN_EMAILS environment variable.
 */

import { error, type RequestEvent } from '@sveltejs/kit';
import { config } from './env';

/**
 * Check if a user email is an admin
 */
export function isAdminEmail(email: string | undefined | null): boolean {
	if (!email) return false;
	return config.admin.emails.includes(email.toLowerCase());
}

/**
 * Check if the current request is from an admin user
 */
export function isAdmin(event: RequestEvent): boolean {
	const user = event.locals.user;
	if (!user) return false;
	return isAdminEmail(user.email);
}

/**
 * Require admin access for an API route
 * Throws 401 if not authenticated, 403 if not admin
 */
export function requireAdmin(event: RequestEvent): void {
	const user = event.locals.user;

	if (!user) {
		throw error(401, 'Authentication required');
	}

	if (!isAdminEmail(user.email)) {
		throw error(403, 'Admin access required');
	}
}

/**
 * Get admin user or throw error
 * Returns the user if they are an admin
 */
export function getAdminUser(event: RequestEvent) {
	requireAdmin(event);
	return event.locals.user!;
}
