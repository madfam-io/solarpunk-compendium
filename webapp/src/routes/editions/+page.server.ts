/**
 * Editions Page Server-Side Data Loading
 *
 * Fetches editions from the database
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const editions = await db.edition.findMany({
		include: {
			_count: {
				select: { articles: true }
			}
		},
		orderBy: [{ year: 'desc' }, { season: 'desc' }]
	});

	// Transform data for the frontend
	const transformedEditions = editions.map((e) => ({
		id: e.id,
		slug: e.slug,
		season: e.season.toLowerCase(),
		year: e.year,
		title: e.title,
		tagline: e.tagline,
		description: e.description,
		status: e.status.toLowerCase(),
		publishedAt: e.publishedAt?.toISOString() || null,
		articleCount: e._count.articles
	}));

	// Find current (latest) and past editions
	const currentEdition = transformedEditions[0] || null;
	const pastEditions = transformedEditions.slice(1);

	return {
		currentEdition,
		pastEditions
	};
};
