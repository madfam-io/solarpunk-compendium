/**
 * Articles List Page - Server-side data loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const url = event.url;
	const status = url.searchParams.get('status') as string | null;
	const editionId = url.searchParams.get('editionId') as string | null;
	const section = url.searchParams.get('section') as string | null;
	const search = url.searchParams.get('search') as string | null;
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 20;
	const offset = (page - 1) * limit;

	// Build where clause
	const where: Record<string, unknown> = {};
	if (status) where.status = status;
	if (editionId) where.editionId = editionId;
	if (section) where.section = section;
	if (search) {
		where.OR = [
			{ title: { contains: search, mode: 'insensitive' } },
			{ subtitle: { contains: search, mode: 'insensitive' } },
			{ excerpt: { contains: search, mode: 'insensitive' } }
		];
	}

	// Fetch articles and editions in parallel
	const [articles, total, editions] = await Promise.all([
		db.article.findMany({
			where,
			include: {
				edition: {
					select: { id: true, slug: true, season: true, year: true, status: true }
				},
				author: {
					select: { id: true, name: true, slug: true, avatar: true }
				}
			},
			orderBy: [{ updatedAt: 'desc' }],
			take: limit,
			skip: offset
		}),
		db.article.count({ where }),
		db.edition.findMany({
			select: { id: true, season: true, year: true },
			orderBy: [{ year: 'desc' }, { season: 'desc' }]
		})
	]);

	return {
		articles,
		editions,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit)
		},
		filters: {
			status,
			editionId,
			section,
			search
		}
	};
};
