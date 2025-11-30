/**
 * Solstice CMS - Authors Admin API
 *
 * GET /api/admin/authors - List all authors
 * POST /api/admin/authors - Create new author
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import { z } from 'zod';

// Query params schema
const querySchema = z.object({
	search: z.string().optional(),
	limit: z.coerce.number().min(1).max(100).default(50),
	offset: z.coerce.number().min(0).default(0)
});

// Create author schema
const createAuthorSchema = z.object({
	name: z.string().min(2).max(200),
	bio: z.string().max(2000).optional().nullable(),
	avatar: z.string().url().optional().nullable(),
	website: z.string().url().optional().nullable(),
	location: z.string().max(200).optional().nullable(),
	social: z.object({
		twitter: z.string().optional(),
		mastodon: z.string().optional(),
		instagram: z.string().optional(),
		linkedin: z.string().optional()
	}).optional().nullable(),
	userId: z.string().optional().nullable()
});

/**
 * GET /api/admin/authors
 * List all authors with content counts
 */
export const GET: RequestHandler = async (event) => {
	requireAdmin(event);

	try {
		const params = Object.fromEntries(event.url.searchParams);
		const query = querySchema.parse(params);

		// Build where clause
		const where: Record<string, unknown> = {};
		if (query.search) {
			where.OR = [
				{ name: { contains: query.search, mode: 'insensitive' } },
				{ bio: { contains: query.search, mode: 'insensitive' } }
			];
		}

		// Fetch authors
		const [authors, total] = await Promise.all([
			db.author.findMany({
				where,
				include: {
					user: {
						select: { id: true, email: true, name: true }
					},
					_count: {
						select: { articles: true, posts: true }
					}
				},
				orderBy: { name: 'asc' },
				take: query.limit,
				skip: query.offset
			}),
			db.author.count({ where })
		]);

		const data = authors.map((a) => ({
			id: a.id,
			slug: a.slug,
			name: a.name,
			bio: a.bio,
			avatar: a.avatar,
			website: a.website,
			location: a.location,
			social: a.social,
			createdAt: a.createdAt,
			user: a.user,
			counts: {
				articles: a._count.articles,
				posts: a._count.posts
			}
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
		console.error('Error fetching authors:', err);
		throw error(500, 'Failed to fetch authors');
	}
};

/**
 * POST /api/admin/authors
 * Create a new author (admin only)
 */
export const POST: RequestHandler = async (event) => {
	requireAdmin(event);

	try {
		const body = await event.request.json();
		const data = createAuthorSchema.parse(body);

		// Verify user exists if linking
		if (data.userId) {
			const user = await db.user.findUnique({ where: { id: data.userId } });
			if (!user) {
				throw error(404, 'User not found');
			}
			// Check if user already has an author profile
			const existingAuthor = await db.author.findUnique({ where: { userId: data.userId } });
			if (existingAuthor) {
				throw error(409, 'User already has an author profile');
			}
		}

		// Generate slug from name
		const baseSlug = data.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		// Ensure unique slug
		let slug = baseSlug;
		let counter = 1;
		while (await db.author.findUnique({ where: { slug } })) {
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		// Create author
		const author = await db.author.create({
			data: {
				slug,
				name: data.name,
				bio: data.bio,
				avatar: data.avatar,
				website: data.website,
				location: data.location,
				social: data.social,
				userId: data.userId
			},
			include: {
				user: {
					select: { id: true, email: true, name: true }
				}
			}
		});

		return json({ data: author }, { status: 201 });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid author data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error creating author:', err);
		throw error(500, 'Failed to create author');
	}
};
