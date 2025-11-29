/**
 * Harvest Queue API
 *
 * CRUD operations for harvest items in moderation queue
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import type { HarvestStatus } from '@prisma/client';

// GET /api/admin/harvest/queue - List queue items
export const GET: RequestHandler = async (event) => {
	requireAdmin(event);
	const { url } = event;

	const status = url.searchParams.get('status') as HarvestStatus | null;
	const sourceId = url.searchParams.get('sourceId');
	const contentType = url.searchParams.get('contentType');
	const minQuality = parseInt(url.searchParams.get('minQuality') || '0');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '20');

	const where: Record<string, unknown> = {};

	if (status) {
		where.status = status;
	}
	if (sourceId) {
		where.sourceId = sourceId;
	}
	if (contentType) {
		where.contentType = contentType;
	}
	if (minQuality > 0) {
		where.quality = { gte: minQuality };
	}

	const [items, total] = await Promise.all([
		db.harvestItem.findMany({
			where,
			include: {
				source: {
					select: { id: true, name: true, slug: true }
				}
			},
			orderBy: [{ quality: 'desc' }, { createdAt: 'desc' }],
			skip: (page - 1) * limit,
			take: limit
		}),
		db.harvestItem.count({ where })
	]);

	return json({
		items,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit)
		}
	});
};

// PATCH /api/admin/harvest/queue - Bulk update items
export const PATCH: RequestHandler = async (event) => {
	requireAdmin(event);

	const body = await event.request.json();
	const { ids, status, reviewNotes } = body;

	if (!ids || !Array.isArray(ids) || ids.length === 0) {
		throw error(400, 'ids array required');
	}

	if (!status) {
		throw error(400, 'status required');
	}

	const validStatuses: HarvestStatus[] = [
		'PENDING',
		'APPROVED',
		'REJECTED',
		'PUBLISHED',
		'DUPLICATE',
		'NEEDS_INFO'
	];

	if (!validStatuses.includes(status)) {
		throw error(400, `Invalid status: ${status}`);
	}

	const updated = await db.harvestItem.updateMany({
		where: { id: { in: ids } },
		data: {
			status,
			reviewNotes: reviewNotes || null,
			reviewedAt: new Date()
			// reviewedById: locals.user?.id
		}
	});

	return json({ updated: updated.count });
};
