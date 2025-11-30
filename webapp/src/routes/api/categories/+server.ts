/**
 * Categories API
 *
 * GET /api/categories - List all categories
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

/**
 * GET /api/categories
 * List all categories with project counts
 */
export const GET: RequestHandler = async () => {
	const categories = await db.category.findMany({
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
	});

	const data = categories.map((c: typeof categories[number]) => ({
		id: c.id,
		slug: c.slug,
		name: c.name,
		description: c.description,
		icon: c.icon,
		color: c.color,
		projectCount: c._count.projects
	}));

	return json({ data });
};
