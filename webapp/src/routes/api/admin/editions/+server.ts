/**
 * Solstice CMS - Editions Admin API
 *
 * GET /api/admin/editions - List all editions with stats
 * POST /api/admin/editions - Create new edition
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import { z } from 'zod';

// Query params schema
const querySchema = z.object({
	status: z.enum(['PLANNING', 'ACCEPTING', 'REVIEWING', 'LAYOUT', 'PUBLISHED', 'ARCHIVED']).optional(),
	year: z.coerce.number().min(2020).max(2100).optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0)
});

// Create edition schema
const createEditionSchema = z.object({
	title: z.string().min(2).max(200),
	season: z.enum(['SPRING', 'SUMMER', 'FALL', 'WINTER']),
	year: z.number().min(2020).max(2100),
	tagline: z.string().max(300).optional().nullable(),
	description: z.string().max(5000).optional().nullable(),
	coverImage: z.string().url().optional().nullable(),
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
	}).optional().nullable()
});

/**
 * GET /api/admin/editions
 * List all editions with stats (admin only)
 */
export const GET: RequestHandler = async (event) => {
	requireAdmin(event);

	try {
		const params = Object.fromEntries(event.url.searchParams);
		const query = querySchema.parse(params);

		// Build where clause
		const where: Record<string, unknown> = {};
		if (query.status) where.status = query.status;
		if (query.year) where.year = query.year;

		// Fetch editions with counts
		const [editions, total] = await Promise.all([
			db.edition.findMany({
				where,
				include: {
					_count: {
						select: {
							articles: true,
							submissions: true,
							promotedPosts: true
						}
					}
				},
				orderBy: [{ year: 'desc' }, { season: 'desc' }],
				take: query.limit,
				skip: query.offset
			}),
			db.edition.count({ where })
		]);

		// Get article stats per edition
		const data = await Promise.all(
			editions.map(async (e) => {
				const articleStats = await db.article.groupBy({
					by: ['status'],
					where: { editionId: e.id },
					_count: true
				});

				const submissionStats = await db.editionSubmission.groupBy({
					by: ['status'],
					where: { editionId: e.id },
					_count: true
				});

				return {
					id: e.id,
					slug: e.slug,
					title: e.title,
					season: e.season,
					year: e.year,
					tagline: e.tagline,
					description: e.description,
					coverImage: e.coverImage,
					status: e.status,
					callOpenAt: e.callOpenAt,
					callCloseAt: e.callCloseAt,
					launchDate: e.launchDate,
					publishedAt: e.publishedAt,
					printEnabled: e.printEnabled,
					printFileUrl: e.printFileUrl,
					createdAt: e.createdAt,
					updatedAt: e.updatedAt,
					counts: {
						articles: e._count.articles,
						submissions: e._count.submissions,
						promotedPosts: e._count.promotedPosts
					},
					articlesByStatus: Object.fromEntries(
						articleStats.map((s) => [s.status, s._count])
					),
					submissionsByStatus: Object.fromEntries(
						submissionStats.map((s) => [s.status, s._count])
					)
				};
			})
		);

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
		console.error('Error fetching editions:', err);
		throw error(500, 'Failed to fetch editions');
	}
};

/**
 * POST /api/admin/editions
 * Create a new edition (admin only)
 */
export const POST: RequestHandler = async (event) => {
	requireAdmin(event);

	try {
		const body = await event.request.json();
		const data = createEditionSchema.parse(body);

		// Check for existing edition with same season/year
		const existing = await db.edition.findUnique({
			where: {
				season_year: {
					season: data.season,
					year: data.year
				}
			}
		});

		if (existing) {
			throw error(409, `An edition for ${data.season} ${data.year} already exists`);
		}

		// Generate slug
		const slug = `${data.season.toLowerCase()}-${data.year}`;

		// Create edition
		const edition = await db.edition.create({
			data: {
				slug,
				title: data.title,
				season: data.season,
				year: data.year,
				tagline: data.tagline,
				description: data.description,
				coverImage: data.coverImage,
				callOpenAt: data.callOpenAt ? new Date(data.callOpenAt) : null,
				callCloseAt: data.callCloseAt ? new Date(data.callCloseAt) : null,
				launchDate: data.launchDate ? new Date(data.launchDate) : null,
				printEnabled: data.printEnabled ?? false,
				printConfig: data.printConfig,
				status: 'PLANNING'
			}
		});

		return json({ data: edition }, { status: 201 });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid edition data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error creating edition:', err);
		throw error(500, 'Failed to create edition');
	}
};
