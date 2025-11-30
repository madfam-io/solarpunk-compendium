/**
 * Editions List Page - Server-side data loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const url = event.url;
	const status = url.searchParams.get('status') as string | null;
	const year = url.searchParams.get('year');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 12;
	const offset = (page - 1) * limit;

	// Build where clause
	const where: Record<string, unknown> = {};
	if (status) where.status = status;
	if (year) where.year = parseInt(year);

	// Fetch editions
	const [editions, total] = await Promise.all([
		db.edition.findMany({
			where,
			include: {
				_count: {
					select: { articles: true, submissions: true, promotedPosts: true }
				}
			},
			orderBy: [{ year: 'desc' }, { season: 'desc' }],
			take: limit,
			skip: offset
		}),
		db.edition.count({ where })
	]);

	return {
		editions: editions.map((e) => ({
			...e,
			counts: e._count
		})),
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit)
		},
		filters: {
			status,
			year
		}
	};
};
