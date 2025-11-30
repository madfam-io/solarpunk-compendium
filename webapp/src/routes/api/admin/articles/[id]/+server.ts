/**
 * Solstice CMS - Single Article Admin API
 *
 * GET /api/admin/articles/[id] - Get article details
 * PATCH /api/admin/articles/[id] - Update article
 * DELETE /api/admin/articles/[id] - Delete article
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import { z } from 'zod';

// Update article schema
const updateArticleSchema = z.object({
	title: z.string().min(2).max(300).optional(),
	subtitle: z.string().max(500).optional().nullable(),
	excerpt: z.string().max(1000).optional().nullable(),
	content: z.string().min(1).optional(),
	coverImage: z.string().url().optional().nullable(),
	authorId: z.string().optional().nullable(),
	section: z.enum(['OVERVIEW', 'GROW', 'BUILD', 'POWER', 'CONNECT', 'THRIVE', 'CREATE', 'LEARN']).optional().nullable(),
	status: z.enum(['SEED', 'GROWING', 'HARVEST', 'PUBLISHED', 'PRESERVE']).optional(),
	order: z.number().min(0).optional(),
	featured: z.boolean().optional()
});

/**
 * GET /api/admin/articles/[id]
 * Get full article details with content
 */
export const GET: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	const article = await db.article.findUnique({
		where: { id },
		include: {
			edition: {
				select: { id: true, slug: true, title: true, season: true, year: true, status: true }
			},
			author: {
				select: { id: true, name: true, slug: true, avatar: true, bio: true }
			},
			relationsFrom: {
				include: {
					articleTo: { select: { id: true, slug: true, title: true } },
					postTo: { select: { id: true, slug: true, title: true } }
				}
			},
			relationsTo: {
				include: {
					articleFrom: { select: { id: true, slug: true, title: true } },
					postFrom: { select: { id: true, slug: true, title: true } }
				}
			}
		}
	});

	if (!article) {
		throw error(404, 'Article not found');
	}

	return json({ data: article });
};

/**
 * PATCH /api/admin/articles/[id]
 * Update article (admin only)
 */
export const PATCH: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	try {
		// Check if article exists
		const existing = await db.article.findUnique({ where: { id } });
		if (!existing) {
			throw error(404, 'Article not found');
		}

		const body = await event.request.json();
		const data = updateArticleSchema.parse(body);

		// Verify author exists if changing
		if (data.authorId) {
			const author = await db.author.findUnique({ where: { id: data.authorId } });
			if (!author) {
				throw error(404, 'Author not found');
			}
		}

		// Build update data
		const updateData: Record<string, unknown> = {};

		if (data.title !== undefined) updateData.title = data.title;
		if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
		if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
		if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
		if (data.authorId !== undefined) updateData.authorId = data.authorId;
		if (data.section !== undefined) updateData.section = data.section;
		if (data.order !== undefined) updateData.order = data.order;
		if (data.featured !== undefined) updateData.featured = data.featured;

		if (data.content !== undefined) {
			updateData.content = data.content;
			// Recalculate reading time
			const wordCount = data.content.split(/\s+/).length;
			updateData.readTime = Math.max(1, Math.ceil(wordCount / 200));
		}

		if (data.status !== undefined) {
			updateData.status = data.status;
			// Set publishedAt when publishing
			if (data.status === 'PUBLISHED' && !existing.publishedAt) {
				updateData.publishedAt = new Date();
			}
		}

		const article = await db.article.update({
			where: { id },
			data: updateData,
			include: {
				edition: {
					select: { id: true, slug: true, title: true, season: true, year: true }
				},
				author: {
					select: { id: true, name: true, slug: true, avatar: true }
				}
			}
		});

		return json({ data: article });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid article data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error updating article:', err);
		throw error(500, 'Failed to update article');
	}
};

/**
 * DELETE /api/admin/articles/[id]
 * Delete article (admin only)
 */
export const DELETE: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	try {
		// Check if article exists
		const existing = await db.article.findUnique({ where: { id } });
		if (!existing) {
			throw error(404, 'Article not found');
		}

		// Prevent deletion of published articles
		if (existing.status === 'PUBLISHED') {
			throw error(400, 'Cannot delete a published article. Archive it (PRESERVE) instead.');
		}

		// Delete article (cascade deletes relations)
		await db.article.delete({ where: { id } });

		return json({ success: true });
	} catch (err) {
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error deleting article:', err);
		throw error(500, 'Failed to delete article');
	}
};
