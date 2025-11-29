/**
 * Server Environment Variables
 *
 * Type-safe access to private environment variables.
 * These are only available server-side.
 */

import { env } from '$env/dynamic/private';

export const config = {
	// Janua Authentication
	janua: {
		apiUrl: env.JANUA_API_URL || 'http://localhost:8001',
		apiSecret: env.JANUA_API_SECRET || ''
	},

	// Database
	database: {
		url: env.DATABASE_URL || ''
	},

	// Redis (for caching/sessions)
	redis: {
		url: env.REDIS_URL || ''
	},

	// Resend (email via Janua)
	resend: {
		apiKey: env.RESEND_API_KEY || ''
	},

	// App
	app: {
		url: env.APP_URL || 'http://localhost:5173',
		env: env.NODE_ENV || 'development'
	}
};

// Validate required variables in production
if (config.app.env === 'production') {
	const required = ['DATABASE_URL', 'JANUA_API_URL', 'JANUA_API_SECRET'];

	for (const key of required) {
		if (!env[key]) {
			throw new Error(`Missing required environment variable: ${key}`);
		}
	}
}
