/**
 * Harvest Admin API
 *
 * Endpoints for managing content harvest queue
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import {
	runHarvestBySlug,
	initializeSources,
	publishApprovedItems,
	getQueueStats
} from '$lib/server/harvest';

// GET /api/admin/harvest - Get queue stats and sources
export const GET: RequestHandler = async ({ url, locals }) => {
	// TODO: Add admin auth check
	// if (!locals.user?.isAdmin) throw error(403, 'Unauthorized');

	const action = url.searchParams.get('action');

	if (action === 'stats') {
		const stats = await getQueueStats();
		return json(stats);
	}

	if (action === 'sources') {
		const sources = await db.harvestSource.findMany({
			orderBy: { priority: 'desc' },
			include: {
				_count: {
					select: { items: true }
				}
			}
		});
		return json(sources);
	}

	// Default: return both
	const [stats, sources] = await Promise.all([
		getQueueStats(),
		db.harvestSource.findMany({
			orderBy: { priority: 'desc' },
			include: {
				_count: {
					select: { items: true }
				}
			}
		})
	]);

	return json({ stats, sources });
};

// POST /api/admin/harvest - Run harvest actions
export const POST: RequestHandler = async ({ request, locals }) => {
	// TODO: Add admin auth check

	const body = await request.json();
	const { action, sourceSlug } = body;

	switch (action) {
		case 'initialize':
			await initializeSources();
			return json({ success: true, message: 'Sources initialized' });

		case 'harvest':
			if (!sourceSlug) {
				throw error(400, 'sourceSlug required');
			}
			const harvestResult = await runHarvestBySlug(sourceSlug);
			return json({ success: true, stats: harvestResult });

		case 'publish':
			const publishResult = await publishApprovedItems();
			return json({ success: true, ...publishResult });

		default:
			throw error(400, `Unknown action: ${action}`);
	}
};
