/**
 * Solstice CMS - Edition Submissions Admin API
 *
 * GET /api/admin/submissions - List all submissions
 * PATCH /api/admin/submissions - Bulk update submission statuses
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import { z } from 'zod';

// Query params schema
const querySchema = z.object({
	editionId: z.string().optional(),
	status: z.enum(['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'PUBLISHED']).optional(),
	submitterId: z.string().optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0)
});

// Bulk update schema
const bulkUpdateSchema = z.object({
	ids: z.array(z.string()).min(1),
	status: z.enum(['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']),
	reviewNotes: z.string().max(1000).optional()
});

/**
 * GET /api/admin/submissions
 * List all submissions with filters
 */
export const GET: RequestHandler = async (event) => {
	requireAdmin(event);

	try {
		const params = Object.fromEntries(event.url.searchParams);
		const query = querySchema.parse(params);

		// Build where clause
		const where: Record<string, unknown> = {};
		if (query.editionId) where.editionId = query.editionId;
		if (query.status) where.status = query.status;
		if (query.submitterId) where.submitterId = query.submitterId;

		// Fetch submissions
		const [submissions, total] = await Promise.all([
			db.editionSubmission.findMany({
				where,
				include: {
					edition: {
						select: { id: true, slug: true, title: true, season: true, year: true, status: true }
					},
					submitter: {
						select: { id: true, name: true, email: true, avatar: true }
					}
				},
				orderBy: { createdAt: 'desc' },
				take: query.limit,
				skip: query.offset
			}),
			db.editionSubmission.count({ where })
		]);

		return json({
			data: submissions,
			meta: {
				total,
				limit: query.limit,
				offset: query.offset,
				hasMore: query.offset + query.limit < total
			}
		});
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid query parameters: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		console.error('Error fetching submissions:', err);
		throw error(500, 'Failed to fetch submissions');
	}
};

/**
 * PATCH /api/admin/submissions
 * Bulk update submission statuses
 */
export const PATCH: RequestHandler = async (event) => {
	requireAdmin(event);

	try {
		const body = await event.request.json();
		const data = bulkUpdateSchema.parse(body);

		// Update all submissions
		const result = await db.editionSubmission.updateMany({
			where: {
				id: { in: data.ids }
			},
			data: {
				status: data.status,
				reviewNotes: data.reviewNotes,
				reviewedAt: new Date()
			}
		});

		return json({
			success: true,
			updated: result.count
		});
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		console.error('Error updating submissions:', err);
		throw error(500, 'Failed to update submissions');
	}
};
