/**
 * Solstice CMS - Posts Admin API (The Greenhouse)
 *
 * GET /api/admin/posts - List all posts with filters
 * POST /api/admin/posts - Create new post
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import { z } from 'zod';

// Query params schema
const querySchema = z.object({
	type: z.enum(['COMMUNITY', 'GUIDE', 'NEWS', 'EVENT', 'RESOURCE', 'PROFILE']).optional(),
	status: z.enum(['SEED', 'GROWING', 'HARVEST', 'PRESERVE']).optional(),
	seasonalAffinity: z.enum(['SPRING', 'SUMMER', 'FALL', 'WINTER']).optional(),
	authorId: z.string().optional(),
	promotedToId: z.string().optional(),
	search: z.string().optional(),
	featured: z.coerce.boolean().optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0)
});

// Create post schema
const createPostSchema = z.object({
	title: z.string().min(2).max(300),
	excerpt: z.string().max(1000).optional().nullable(),
	content: z.string().min(1),
	coverImage: z.string().url().optional().nullable(),
	type: z.enum(['COMMUNITY', 'GUIDE', 'NEWS', 'EVENT', 'RESOURCE', 'PROFILE']).default('COMMUNITY'),
	seasonalAffinity: z.enum(['SPRING', 'SUMMER', 'FALL', 'WINTER']).optional().nullable(),
	authorId: z.string().optional().nullable(),
	featured: z.boolean().optional(),
	tags: z.array(z.string().max(50)).max(10).optional()
});

/**
 * GET /api/admin/posts
 * List all posts with filters (admin only)
 */
export const GET: RequestHandler = async (event) => {
	requireAdmin(event);

	try {
		const params = Object.fromEntries(event.url.searchParams);
		const query = querySchema.parse(params);

		// Build where clause
		const where: Record<string, unknown> = {};
		if (query.type) where.type = query.type;
		if (query.status) where.status = query.status;
		if (query.seasonalAffinity) where.seasonalAffinity = query.seasonalAffinity;
		if (query.authorId) where.authorId = query.authorId;
		if (query.promotedToId) where.promotedToId = query.promotedToId;
		if (query.featured !== undefined) where.featured = query.featured;
		if (query.search) {
			where.OR = [
				{ title: { contains: query.search, mode: 'insensitive' } },
				{ excerpt: { contains: query.search, mode: 'insensitive' } }
			];
		}

		// Fetch posts
		const [posts, total] = await Promise.all([
			db.post.findMany({
				where,
				include: {
					author: {
						select: { id: true, name: true, slug: true, avatar: true }
					},
					submitter: {
						select: { id: true, name: true, email: true, avatar: true }
					},
					promotedTo: {
						select: { id: true, slug: true, title: true, season: true, year: true }
					},
					tags: {
						include: { tag: true }
					},
					_count: {
						select: { relationsFrom: true, relationsTo: true }
					}
				},
				orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
				take: query.limit,
				skip: query.offset
			}),
			db.post.count({ where })
		]);

		const data = posts.map((p) => ({
			id: p.id,
			slug: p.slug,
			title: p.title,
			excerpt: p.excerpt,
			coverImage: p.coverImage,
			type: p.type,
			status: p.status,
			seasonalAffinity: p.seasonalAffinity,
			featured: p.featured,
			readTime: p.readTime,
			publishedAt: p.publishedAt,
			promotedAt: p.promotedAt,
			createdAt: p.createdAt,
			updatedAt: p.updatedAt,
			author: p.author,
			submitter: p.submitter,
			promotedTo: p.promotedTo,
			tags: p.tags.map((t) => t.tag.name),
			relationsCount: p._count.relationsFrom + p._count.relationsTo
		}));

		return json({
			data,
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
		console.error('Error fetching posts:', err);
		throw error(500, 'Failed to fetch posts');
	}
};

/**
 * POST /api/admin/posts
 * Create a new post (admin only)
 */
export const POST: RequestHandler = async (event) => {
	requireAdmin(event);

	try {
		const body = await event.request.json();
		const data = createPostSchema.parse(body);

		// Verify author exists if provided
		if (data.authorId) {
			const author = await db.author.findUnique({ where: { id: data.authorId } });
			if (!author) {
				throw error(404, 'Author not found');
			}
		}

		// Generate slug from title
		const baseSlug = data.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		// Ensure unique slug
		let slug = baseSlug;
		let counter = 1;
		while (await db.post.findUnique({ where: { slug } })) {
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		// Calculate reading time
		const wordCount = data.content.split(/\s+/).length;
		const readTime = Math.max(1, Math.ceil(wordCount / 200));

		// Create post with tags
		const post = await db.post.create({
			data: {
				slug,
				title: data.title,
				excerpt: data.excerpt,
				content: data.content,
				coverImage: data.coverImage,
				type: data.type,
				seasonalAffinity: data.seasonalAffinity,
				authorId: data.authorId,
				readTime,
				featured: data.featured ?? false,
				status: 'SEED',
				tags: data.tags
					? {
							create: await Promise.all(
								data.tags.map(async (tagName) => {
									const tag = await db.tag.upsert({
										where: { name: tagName.toLowerCase() },
										create: { name: tagName.toLowerCase() },
										update: {}
									});
									return { tagId: tag.id };
								})
							)
						}
					: undefined
			},
			include: {
				author: {
					select: { id: true, name: true, slug: true, avatar: true }
				},
				tags: {
					include: { tag: true }
				}
			}
		});

		return json({ data: post }, { status: 201 });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid post data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error creating post:', err);
		throw error(500, 'Failed to create post');
	}
};
