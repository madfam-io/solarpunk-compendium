/**
 * Editions API
 *
 * GET /api/editions - List all editions
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

/**
 * GET /api/editions
 * List all published editions
 */
export const GET: RequestHandler = async ({ url }) => {
	const includeArticles = url.searchParams.get('include') === 'articles';

	const editions = await db.edition.findMany({
		where: { status: 'PUBLISHED' },
		include: includeArticles
			? {
					articles: {
						where: { status: 'PUBLISHED' },
						orderBy: { order: 'asc' },
						select: {
							id: true,
							slug: true,
							title: true,
							subtitle: true,
							excerpt: true,
							coverImage: true,
							author: true,
							readTime: true,
							section: true
						}
					},
					_count: { select: { articles: true } }
				}
			: {
					_count: { select: { articles: true } }
				},
		orderBy: [{ year: 'desc' }, { season: 'desc' }]
	});

	const data = editions.map((e: typeof editions[number]) => ({
		id: e.id,
		slug: e.slug,
		title: e.title,
		season: e.season,
		year: e.year,
		tagline: e.tagline,
		description: e.description,
		coverImage: e.coverImage,
		publishedAt: e.publishedAt,
		articleCount: e._count.articles,
		...(includeArticles && { articles: (e as typeof editions[number] & { articles?: unknown[] }).articles })
	}));

	return json({ data });
};
