/**
 * Posts (Greenhouse) List Page - Server-side data loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const url = event.url;
	const status = url.searchParams.get('status') as string | null;
	const type = url.searchParams.get('type') as string | null;
	const promotedToId = url.searchParams.get('promotedToId') as string | null;
	const search = url.searchParams.get('search') as string | null;
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 12;
	const offset = (page - 1) * limit;

	// Build where clause
	const where: Record<string, unknown> = {};
	if (status) where.status = status;
	if (type) where.type = type;
	if (promotedToId === 'promoted') {
		where.promotedToId = { not: null };
	} else if (promotedToId) {
		where.promotedToId = promotedToId;
	}
	if (search) {
		where.OR = [
			{ title: { contains: search, mode: 'insensitive' } },
			{ excerpt: { contains: search, mode: 'insensitive' } }
		];
	}

	// Fetch posts and editions in parallel
	const [posts, total, editions] = await Promise.all([
		db.post.findMany({
			where,
			include: {
				author: {
					select: { id: true, name: true, slug: true, avatar: true }
				},
				promotedTo: {
					select: { id: true, slug: true, season: true, year: true }
				},
				tags: {
					include: { tag: true }
				}
			},
			orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
			take: limit,
			skip: offset
		}),
		db.post.count({ where }),
		db.edition.findMany({
			where: { status: { not: 'ARCHIVED' } },
			select: { id: true, season: true, year: true },
			orderBy: [{ year: 'desc' }, { season: 'desc' }]
		})
	]);

	return {
		posts: posts.map((p) => ({
			...p,
			tags: p.tags.map((t) => t.tag.name)
		})),
		editions,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit)
		},
		filters: {
			status,
			type,
			promotedToId,
			search
		}
	};
};
