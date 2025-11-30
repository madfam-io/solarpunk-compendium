/**
 * Directory Page Server-Side Data Loading
 *
 * Fetches projects and categories from the database
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
	const searchQuery = url.searchParams.get('q') || '';
	const categorySlug = url.searchParams.get('category') || '';
	const sdgNumber = url.searchParams.get('sdg') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 12;

	// Build where clause for projects
	const where: any = {
		status: 'PUBLISHED'
	};

	if (searchQuery) {
		where.OR = [
			{ name: { contains: searchQuery, mode: 'insensitive' } },
			{ tagline: { contains: searchQuery, mode: 'insensitive' } },
			{ description: { contains: searchQuery, mode: 'insensitive' } }
		];
	}

	if (categorySlug) {
		where.categories = {
			some: {
				category: { slug: categorySlug }
			}
		};
	}

	if (sdgNumber) {
		where.sdgs = {
			some: {
				sdg: { number: parseInt(sdgNumber) }
			}
		};
	}

	// Fetch projects and categories in parallel
	const [projects, totalCount, categories] = await Promise.all([
		db.project.findMany({
			where,
			include: {
				categories: {
					include: { category: true }
				},
				sdgs: {
					include: { sdg: true }
				}
			},
			orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
			skip: (page - 1) * limit,
			take: limit
		}),
		db.project.count({ where }),
		db.category.findMany({
			include: {
				_count: {
					select: {
						projects: {
							where: { project: { status: 'PUBLISHED' } }
						}
					}
				}
			},
			orderBy: { name: 'asc' }
		})
	]);

	// Transform data for the frontend
	const transformedProjects = projects.map((p: typeof projects[number]) => ({
		id: p.id,
		slug: p.slug,
		name: p.name,
		tagline: p.tagline,
		location: p.location,
		coverImage: p.coverImage,
		featured: p.featured,
		categories: p.categories.map((c: typeof p.categories[number]) => c.category.name),
		sdgs: p.sdgs.map((s: typeof p.sdgs[number]) => s.sdg.id)
	}));

	const transformedCategories = categories.map((c: typeof categories[number]) => ({
		slug: c.slug,
		name: c.name,
		icon: c.icon,
		projectCount: c._count.projects
	}));

	return {
		projects: transformedProjects,
		categories: transformedCategories,
		pagination: {
			page,
			limit,
			total: totalCount,
			totalPages: Math.ceil(totalCount / limit)
		},
		filters: {
			search: searchQuery,
			category: categorySlug,
			sdg: sdgNumber
		}
	};
};
