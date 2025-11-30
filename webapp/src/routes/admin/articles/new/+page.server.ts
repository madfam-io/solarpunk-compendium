/**
 * New Article Page - Server-side data loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const [editions, authors] = await Promise.all([
		db.edition.findMany({
			where: {
				status: { not: 'ARCHIVED' }
			},
			select: { id: true, slug: true, title: true, season: true, year: true, status: true },
			orderBy: [{ year: 'desc' }, { season: 'desc' }]
		}),
		db.author.findMany({
			select: { id: true, name: true, slug: true },
			orderBy: { name: 'asc' }
		})
	]);

	return { editions, authors };
};
