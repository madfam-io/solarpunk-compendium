/**
 * Solstice CMS - Single Post Admin API
 *
 * GET /api/admin/posts/[id] - Get post details
 * PATCH /api/admin/posts/[id] - Update post
 * DELETE /api/admin/posts/[id] - Delete post
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import { z } from 'zod';

// Update post schema
const updatePostSchema = z.object({
	title: z.string().min(2).max(300).optional(),
	excerpt: z.string().max(1000).optional().nullable(),
	content: z.string().min(1).optional(),
	coverImage: z.string().url().optional().nullable(),
	type: z.enum(['COMMUNITY', 'GUIDE', 'NEWS', 'EVENT', 'RESOURCE', 'PROFILE']).optional(),
	status: z.enum(['SEED', 'GROWING', 'HARVEST', 'PRESERVE']).optional(),
	seasonalAffinity: z.enum(['SPRING', 'SUMMER', 'FALL', 'WINTER']).optional().nullable(),
	authorId: z.string().optional().nullable(),
	featured: z.boolean().optional(),
	tags: z.array(z.string().max(50)).max(10).optional(),
	// Promotion to edition
	promoteToEditionId: z.string().optional().nullable()
});

/**
 * GET /api/admin/posts/[id]
 * Get full post details with content
 */
export const GET: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	const post = await db.post.findUnique({
		where: { id },
		include: {
			author: {
				select: { id: true, name: true, slug: true, avatar: true, bio: true }
			},
			submitter: {
				select: { id: true, name: true, email: true, avatar: true }
			},
			promotedTo: {
				select: { id: true, slug: true, title: true, season: true, year: true, status: true }
			},
			tags: {
				include: { tag: true }
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

	if (!post) {
		throw error(404, 'Post not found');
	}

	return json({ data: post });
};

/**
 * PATCH /api/admin/posts/[id]
 * Update post (admin only)
 */
export const PATCH: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	try {
		// Check if post exists
		const existing = await db.post.findUnique({
			where: { id },
			include: { tags: true }
		});
		if (!existing) {
			throw error(404, 'Post not found');
		}

		const body = await event.request.json();
		const data = updatePostSchema.parse(body);

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
		if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
		if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
		if (data.type !== undefined) updateData.type = data.type;
		if (data.seasonalAffinity !== undefined) updateData.seasonalAffinity = data.seasonalAffinity;
		if (data.authorId !== undefined) updateData.authorId = data.authorId;
		if (data.featured !== undefined) updateData.featured = data.featured;

		if (data.content !== undefined) {
			updateData.content = data.content;
			// Recalculate reading time
			const wordCount = data.content.split(/\s+/).length;
			updateData.readTime = Math.max(1, Math.ceil(wordCount / 200));
		}

		if (data.status !== undefined) {
			updateData.status = data.status;
			// Set publishedAt when publishing to HARVEST
			if (data.status === 'HARVEST' && !existing.publishedAt) {
				updateData.publishedAt = new Date();
			}
		}

		// Handle promotion to edition
		if (data.promoteToEditionId !== undefined) {
			if (data.promoteToEditionId) {
				// Verify edition exists
				const edition = await db.edition.findUnique({ where: { id: data.promoteToEditionId } });
				if (!edition) {
					throw error(404, 'Edition not found');
				}
				updateData.promotedToId = data.promoteToEditionId;
				updateData.promotedAt = new Date();
			} else {
				// Remove from edition
				updateData.promotedToId = null;
				updateData.promotedAt = null;
			}
		}

		// Handle tags update
		if (data.tags !== undefined) {
			// Delete existing tags
			await db.postTag.deleteMany({ where: { postId: id } });

			// Create new tags
			if (data.tags.length > 0) {
				for (const tagName of data.tags) {
					const tag = await db.tag.upsert({
						where: { name: tagName.toLowerCase() },
						create: { name: tagName.toLowerCase() },
						update: {}
					});
					await db.postTag.create({
						data: { postId: id, tagId: tag.id }
					});
				}
			}
		}

		const post = await db.post.update({
			where: { id },
			data: updateData,
			include: {
				author: {
					select: { id: true, name: true, slug: true, avatar: true }
				},
				promotedTo: {
					select: { id: true, slug: true, title: true, season: true, year: true }
				},
				tags: {
					include: { tag: true }
				}
			}
		});

		return json({ data: post });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid post data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error updating post:', err);
		throw error(500, 'Failed to update post');
	}
};

/**
 * DELETE /api/admin/posts/[id]
 * Delete post (admin only)
 */
export const DELETE: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	try {
		// Check if post exists
		const existing = await db.post.findUnique({ where: { id } });
		if (!existing) {
			throw error(404, 'Post not found');
		}

		// Delete post (cascade deletes tags and relations)
		await db.post.delete({ where: { id } });

		return json({ success: true });
	} catch (err) {
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error deleting post:', err);
		throw error(500, 'Failed to delete post');
	}
};
