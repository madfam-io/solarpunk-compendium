/**
 * Projects API
 *
 * GET /api/projects - List projects with search/filter
 * POST /api/projects - Create new project (auth required)
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { z } from 'zod';

// Query params schema
const querySchema = z.object({
	search: z.string().optional(),
	category: z.string().optional(),
	sdg: z.coerce.number().min(1).max(17).optional(),
	status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED']).optional(),
	featured: z.coerce.boolean().optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0)
});

// Create project schema
const createProjectSchema = z.object({
	name: z.string().min(2).max(100),
	tagline: z.string().min(10).max(200),
	description: z.string().min(50).max(5000),
	website: z.string().url().optional().nullable(),
	location: z.string().max(100).optional().nullable(),
	coordinates: z
		.object({
			lat: z.number().min(-90).max(90),
			lng: z.number().min(-180).max(180)
		})
		.optional()
		.nullable(),
	logo: z.string().url().optional().nullable(),
	coverImage: z.string().url().optional().nullable(),
	categoryIds: z.array(z.string()).min(1).max(5),
	sdgIds: z.array(z.number().min(1).max(17)).min(1).max(17),
	tags: z.array(z.string().max(30)).max(10).optional()
});

/**
 * GET /api/projects
 * List projects with optional search and filters
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse query params
		const params = Object.fromEntries(url.searchParams);
		const query = querySchema.parse(params);

		// Build where clause
		const where: any = {
			status: query.status || 'PUBLISHED'
		};

		if (query.search) {
			where.OR = [
				{ name: { contains: query.search, mode: 'insensitive' } },
				{ tagline: { contains: query.search, mode: 'insensitive' } },
				{ description: { contains: query.search, mode: 'insensitive' } }
			];
		}

		if (query.category) {
			where.categories = {
				some: {
					category: {
						slug: query.category
					}
				}
			};
		}

		if (query.sdg) {
			where.sdgs = {
				some: {
					sdgId: query.sdg
				}
			};
		}

		if (query.featured !== undefined) {
			where.featured = query.featured;
		}

		// Fetch projects
		const [projects, total] = await Promise.all([
			db.project.findMany({
				where,
				include: {
					categories: {
						include: { category: true }
					},
					sdgs: {
						include: { sdg: true }
					},
					submittedBy: {
						select: { id: true, name: true, avatar: true }
					}
				},
				orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
				take: query.limit,
				skip: query.offset
			}),
			db.project.count({ where })
		]);

		// Transform response
		const data = projects.map((p: typeof projects[number]) => ({
			id: p.id,
			slug: p.slug,
			name: p.name,
			tagline: p.tagline,
			location: p.location,
			coverImage: p.coverImage,
			featured: p.featured,
			categories: p.categories.map((c: typeof p.categories[number]) => c.category.name),
			sdgs: p.sdgs.map((s: typeof p.sdgs[number]) => s.sdgId),
			submittedBy: p.submittedBy
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
		console.error('Error fetching projects:', err);
		throw error(500, 'Failed to fetch projects');
	}
};

/**
 * POST /api/projects
 * Create a new project (requires authentication)
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Authentication required');
	}

	try {
		const body = await request.json();
		const data = createProjectSchema.parse(body);

		// Generate slug from name
		const baseSlug = data.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		// Ensure unique slug
		let slug = baseSlug;
		let counter = 1;
		while (await db.project.findUnique({ where: { slug } })) {
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		// Create project with relations
		const project = await db.project.create({
			data: {
				slug,
				name: data.name,
				tagline: data.tagline,
				description: data.description,
				website: data.website,
				location: data.location,
				coordinates: data.coordinates,
				logo: data.logo,
				coverImage: data.coverImage,
				status: 'PENDING', // Requires approval
				submittedById: locals.user.id,
				categories: {
					create: data.categoryIds.map((categoryId) => ({
						categoryId
					}))
				},
				sdgs: {
					create: data.sdgIds.map((sdgId) => ({
						sdgId
					}))
				},
				tags: data.tags
					? {
							create: await Promise.all(
								data.tags.map(async (tagName) => {
									// Find or create tag
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
				categories: { include: { category: true } },
				sdgs: { include: { sdg: true } },
				tags: { include: { tag: true } }
			}
		});

		return json({ data: project }, { status: 201 });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid project data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		console.error('Error creating project:', err);
		throw error(500, 'Failed to create project');
	}
};
