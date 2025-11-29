/**
 * Server Hooks
 *
 * Middleware for handling authentication on the server side.
 * Validates Janua tokens and populates locals with user data.
 */

import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { isAdminEmail } from '$lib/server/admin';

// Get Janua config from environment (with fallbacks for dev)
const JANUA_API_URL = env.JANUA_API_URL || 'http://localhost:8001';
const JANUA_API_SECRET = env.JANUA_API_SECRET || '';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/directory/submit'];

// Routes that require admin access
const adminRoutes = ['/admin'];

// Routes that redirect authenticated users
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

export const handle: Handle = async ({ event, resolve }) => {
	// Get token from cookie or authorization header
	const token =
		event.cookies.get('janua_access_token') ||
		event.request.headers.get('Authorization')?.replace('Bearer ', '');

	// Initialize locals
	event.locals.user = null;
	event.locals.session = null;

	if (token) {
		try {
			// Validate token with Janua API
			const response = await fetch(`${JANUA_API_URL}/api/v1/users/me`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'X-API-Key': JANUA_API_SECRET || ''
				}
			});

			if (response.ok) {
				const user = await response.json();
				event.locals.user = user;
				event.locals.session = { token };
			}
		} catch (err) {
			console.error('Token validation error:', err);
		}
	}

	// Route protection
	const pathname = event.url.pathname;

	// Check if accessing protected route without auth
	if (protectedRoutes.some((route) => pathname.startsWith(route))) {
		if (!event.locals.user) {
			const redirectUrl = encodeURIComponent(pathname);
			return new Response(null, {
				status: 302,
				headers: {
					Location: `/login?redirect=${redirectUrl}`
				}
			});
		}
	}

	// Check if accessing admin route without admin access
	if (adminRoutes.some((route) => pathname.startsWith(route))) {
		if (!event.locals.user) {
			const redirectUrl = encodeURIComponent(pathname);
			return new Response(null, {
				status: 302,
				headers: {
					Location: `/login?redirect=${redirectUrl}`
				}
			});
		}

		if (!isAdminEmail(event.locals.user.email)) {
			return new Response('Forbidden: Admin access required', {
				status: 403,
				headers: {
					'Content-Type': 'text/plain'
				}
			});
		}
	}

	// Redirect authenticated users away from auth pages
	if (authRoutes.some((route) => pathname.startsWith(route))) {
		if (event.locals.user) {
			return new Response(null, {
				status: 302,
				headers: {
					Location: '/'
				}
			});
		}
	}

	return resolve(event);
};
