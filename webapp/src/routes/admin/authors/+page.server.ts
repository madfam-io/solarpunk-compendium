/**
 * Authors List Page - Server-side data loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const url = event.url;
	const search = url.searchParams.get('search') as string | null;
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 12;
	const offset = (page - 1) * limit;

	// Build where clause
	const where: Record<string, unknown> = {};
	if (search) {
		where.OR = [
			{ name: { contains: search, mode: 'insensitive' } },
			{ bio: { contains: search, mode: 'insensitive' } },
			{ location: { contains: search, mode: 'insensitive' } }
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
			take: limit,
			skip: offset
		}),
		db.author.count({ where })
	]);

	return {
		authors: authors.map((a) => ({
			...a,
			counts: a._count
		})),
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit)
		},
		filters: {
			search
		}
	};
};
