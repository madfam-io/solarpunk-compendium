/**
 * Solstice CMS - Articles Admin API
 *
 * GET /api/admin/articles - List all articles with filters
 * POST /api/admin/articles - Create new article
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import { z } from 'zod';

// Query params schema
const querySchema = z.object({
	editionId: z.string().optional(),
	status: z.enum(['SEED', 'GROWING', 'HARVEST', 'PUBLISHED', 'PRESERVE']).optional(),
	section: z.enum(['OVERVIEW', 'GROW', 'BUILD', 'POWER', 'CONNECT', 'THRIVE', 'CREATE', 'LEARN']).optional(),
	authorId: z.string().optional(),
	search: z.string().optional(),
	featured: z.coerce.boolean().optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0)
});

// Create article schema
const createArticleSchema = z.object({
	editionId: z.string(),
	title: z.string().min(2).max(300),
	subtitle: z.string().max(500).optional().nullable(),
	excerpt: z.string().max(1000).optional().nullable(),
	content: z.string().min(1),
	coverImage: z.string().url().optional().nullable(),
	authorId: z.string().optional().nullable(),
	section: z.enum(['OVERVIEW', 'GROW', 'BUILD', 'POWER', 'CONNECT', 'THRIVE', 'CREATE', 'LEARN']).optional().nullable(),
	order: z.number().min(0).optional(),
	featured: z.boolean().optional()
});

/**
 * GET /api/admin/articles
 * List all articles with filters (admin only)
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
		if (query.section) where.section = query.section;
		if (query.authorId) where.authorId = query.authorId;
		if (query.featured !== undefined) where.featured = query.featured;
		if (query.search) {
			where.OR = [
				{ title: { contains: query.search, mode: 'insensitive' } },
				{ subtitle: { contains: query.search, mode: 'insensitive' } },
				{ excerpt: { contains: query.search, mode: 'insensitive' } }
			];
		}

		// Fetch articles
		const [articles, total] = await Promise.all([
			db.article.findMany({
				where,
				include: {
					edition: {
						select: { id: true, slug: true, title: true, season: true, year: true, status: true }
					},
					author: {
						select: { id: true, name: true, slug: true, avatar: true }
					},
					_count: {
						select: { relationsFrom: true, relationsTo: true }
					}
				},
				orderBy: [{ editionId: 'desc' }, { order: 'asc' }],
				take: query.limit,
				skip: query.offset
			}),
			db.article.count({ where })
		]);

		const data = articles.map((a) => ({
			id: a.id,
			slug: a.slug,
			title: a.title,
			subtitle: a.subtitle,
			excerpt: a.excerpt,
			coverImage: a.coverImage,
			section: a.section,
			status: a.status,
			featured: a.featured,
			order: a.order,
			readTime: a.readTime,
			publishedAt: a.publishedAt,
			createdAt: a.createdAt,
			updatedAt: a.updatedAt,
			edition: a.edition,
			author: a.author,
			relationsCount: a._count.relationsFrom + a._count.relationsTo
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
		console.error('Error fetching articles:', err);
		throw error(500, 'Failed to fetch articles');
	}
};

/**
 * POST /api/admin/articles
 * Create a new article (admin only)
 */
export const POST: RequestHandler = async (event) => {
	requireAdmin(event);

	try {
		const body = await event.request.json();
		const data = createArticleSchema.parse(body);

		// Verify edition exists
		const edition = await db.edition.findUnique({ where: { id: data.editionId } });
		if (!edition) {
			throw error(404, 'Edition not found');
		}

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
		while (await db.article.findUnique({ where: { slug } })) {
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		// Calculate reading time (rough estimate: 200 words per minute)
		const wordCount = data.content.split(/\s+/).length;
		const readTime = Math.max(1, Math.ceil(wordCount / 200));

		// Get next order if not provided
		let order = data.order;
		if (order === undefined) {
			const lastArticle = await db.article.findFirst({
				where: { editionId: data.editionId },
				orderBy: { order: 'desc' }
			});
			order = (lastArticle?.order ?? -1) + 1;
		}

		// Create article
		const article = await db.article.create({
			data: {
				slug,
				title: data.title,
				subtitle: data.subtitle,
				excerpt: data.excerpt,
				content: data.content,
				coverImage: data.coverImage,
				authorId: data.authorId,
				editionId: data.editionId,
				section: data.section,
				order,
				readTime,
				featured: data.featured ?? false,
				status: 'SEED'
			},
			include: {
				edition: {
					select: { id: true, slug: true, title: true, season: true, year: true }
				},
				author: {
					select: { id: true, name: true, slug: true, avatar: true }
				}
			}
		});

		return json({ data: article }, { status: 201 });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid article data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error creating article:', err);
		throw error(500, 'Failed to create article');
	}
};
