/**
 * Health Check API
 *
 * GET /api/health - Application health check endpoint
 *
 * Used by Kubernetes/Enclii for liveness and readiness probes.
 * Returns service status and optional dependency checks.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

interface HealthStatus {
	status: 'healthy' | 'degraded' | 'unhealthy';
	timestamp: string;
	version: string;
	checks: {
		database: 'ok' | 'error';
		janua?: 'ok' | 'error' | 'unconfigured';
	};
	uptime: number;
}

const startTime = Date.now();

/**
 * GET /api/health
 * Returns application health status
 */
export const GET: RequestHandler = async ({ url }) => {
	const verbose = url.searchParams.get('verbose') === 'true';

	const health: HealthStatus = {
		status: 'healthy',
		timestamp: new Date().toISOString(),
		version: process.env.npm_package_version || '0.1.0',
		checks: {
			database: 'ok'
		},
		uptime: Math.floor((Date.now() - startTime) / 1000)
	};

	// Check database connectivity
	try {
		await db.$queryRaw`SELECT 1`;
		health.checks.database = 'ok';
	} catch {
		health.checks.database = 'error';
		health.status = 'unhealthy';
	}

	// Check Janua connectivity (optional, only if verbose)
	if (verbose) {
		const januaUrl = process.env.JANUA_API_URL;
		if (januaUrl) {
			try {
				const response = await fetch(`${januaUrl}/health`, {
					signal: AbortSignal.timeout(3000)
				});
				health.checks.janua = response.ok ? 'ok' : 'error';
				if (!response.ok) {
					health.status = health.status === 'healthy' ? 'degraded' : health.status;
				}
			} catch {
				health.checks.janua = 'error';
				health.status = health.status === 'healthy' ? 'degraded' : health.status;
			}
		} else {
			health.checks.janua = 'unconfigured';
		}
	}

	const statusCode = health.status === 'unhealthy' ? 503 : 200;

	return json(health, { status: statusCode });
};
