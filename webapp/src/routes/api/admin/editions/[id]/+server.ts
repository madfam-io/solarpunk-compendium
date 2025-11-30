/**
 * Solstice CMS - Single Edition Admin API
 *
 * GET /api/admin/editions/[id] - Get edition details
 * PATCH /api/admin/editions/[id] - Update edition
 * DELETE /api/admin/editions/[id] - Delete edition
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import { z } from 'zod';

// Update edition schema
const updateEditionSchema = z.object({
	title: z.string().min(2).max(200).optional(),
	tagline: z.string().max(300).optional().nullable(),
	description: z.string().max(5000).optional().nullable(),
	coverImage: z.string().url().optional().nullable(),
	status: z.enum(['PLANNING', 'ACCEPTING', 'REVIEWING', 'LAYOUT', 'PUBLISHED', 'ARCHIVED']).optional(),
	callOpenAt: z.string().datetime().optional().nullable(),
	callCloseAt: z.string().datetime().optional().nullable(),
	launchDate: z.string().datetime().optional().nullable(),
	printEnabled: z.boolean().optional(),
	printConfig: z.object({
		pageSize: z.enum(['A4', 'A5', 'LETTER', 'DIGEST']).optional(),
		margins: z.object({
			top: z.number(),
			bottom: z.number(),
			left: z.number(),
			right: z.number()
		}).optional(),
		bleed: z.number().optional()
	}).optional().nullable(),
	printFileUrl: z.string().url().optional().nullable()
});

/**
 * GET /api/admin/editions/[id]
 * Get full edition details with articles and submissions
 */
export const GET: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	const edition = await db.edition.findUnique({
		where: { id },
		include: {
			articles: {
				include: {
					author: {
						select: { id: true, name: true, slug: true, avatar: true }
					}
				},
				orderBy: { order: 'asc' }
			},
			submissions: {
				include: {
					submitter: {
						select: { id: true, name: true, email: true, avatar: true }
					}
				},
				orderBy: { createdAt: 'desc' }
			},
			promotedPosts: {
				include: {
					author: {
						select: { id: true, name: true, slug: true, avatar: true }
					}
				}
			}
		}
	});

	if (!edition) {
		throw error(404, 'Edition not found');
	}

	return json({ data: edition });
};

/**
 * PATCH /api/admin/editions/[id]
 * Update edition (admin only)
 */
export const PATCH: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	try {
		// Check if edition exists
		const existing = await db.edition.findUnique({ where: { id } });
		if (!existing) {
			throw error(404, 'Edition not found');
		}

		const body = await event.request.json();
		const data = updateEditionSchema.parse(body);

		// Build update data
		const updateData: Record<string, unknown> = {};

		if (data.title !== undefined) updateData.title = data.title;
		if (data.tagline !== undefined) updateData.tagline = data.tagline;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
		if (data.status !== undefined) {
			updateData.status = data.status;
			// Set publishedAt when publishing
			if (data.status === 'PUBLISHED' && !existing.publishedAt) {
				updateData.publishedAt = new Date();
			}
		}
		if (data.callOpenAt !== undefined) {
			updateData.callOpenAt = data.callOpenAt ? new Date(data.callOpenAt) : null;
		}
		if (data.callCloseAt !== undefined) {
			updateData.callCloseAt = data.callCloseAt ? new Date(data.callCloseAt) : null;
		}
		if (data.launchDate !== undefined) {
			updateData.launchDate = data.launchDate ? new Date(data.launchDate) : null;
		}
		if (data.printEnabled !== undefined) updateData.printEnabled = data.printEnabled;
		if (data.printConfig !== undefined) updateData.printConfig = data.printConfig;
		if (data.printFileUrl !== undefined) updateData.printFileUrl = data.printFileUrl;

		const edition = await db.edition.update({
			where: { id },
			data: updateData
		});

		return json({ data: edition });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid edition data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error updating edition:', err);
		throw error(500, 'Failed to update edition');
	}
};

/**
 * DELETE /api/admin/editions/[id]
 * Delete edition (admin only)
 */
export const DELETE: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	try {
		// Check if edition exists
		const existing = await db.edition.findUnique({
			where: { id },
			include: {
				_count: { select: { articles: true } }
			}
		});

		if (!existing) {
			throw error(404, 'Edition not found');
		}

		// Prevent deletion of published editions
		if (existing.status === 'PUBLISHED') {
			throw error(400, 'Cannot delete a published edition. Archive it instead.');
		}

		// Warn if edition has articles
		if (existing._count.articles > 0) {
			throw error(400, `Cannot delete edition with ${existing._count.articles} articles. Remove articles first.`);
		}

		await db.edition.delete({ where: { id } });

		return json({ success: true });
	} catch (err) {
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error deleting edition:', err);
		throw error(500, 'Failed to delete edition');
	}
};
