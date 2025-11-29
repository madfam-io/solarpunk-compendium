/**
 * Single Harvest Item API
 *
 * Operations on individual queue items
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import type { HarvestStatus } from '@prisma/client';

// GET /api/admin/harvest/queue/[id] - Get single item
export const GET: RequestHandler = async ({ params }) => {
	const item = await db.harvestItem.findUnique({
		where: { id: params.id },
		include: {
			source: true
		}
	});

	if (!item) {
		throw error(404, 'Item not found');
	}

	return json(item);
};

// PATCH /api/admin/harvest/queue/[id] - Update single item
export const PATCH: RequestHandler = async ({ params, request }) => {
	// TODO: Add admin auth check

	const body = await request.json();
	const { status, reviewNotes, normalized } = body;

	const updateData: Record<string, unknown> = {
		reviewedAt: new Date()
		// reviewedById: locals.user?.id
	};

	if (status) {
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
		updateData.status = status;
	}

	if (reviewNotes !== undefined) {
		updateData.reviewNotes = reviewNotes;
	}

	if (normalized) {
		updateData.normalized = normalized;
	}

	const item = await db.harvestItem.update({
		where: { id: params.id },
		data: updateData,
		include: { source: true }
	});

	return json(item);
};

// DELETE /api/admin/harvest/queue/[id] - Delete item
export const DELETE: RequestHandler = async ({ params }) => {
	// TODO: Add admin auth check

	await db.harvestItem.delete({
		where: { id: params.id }
	});

	return json({ success: true });
};
