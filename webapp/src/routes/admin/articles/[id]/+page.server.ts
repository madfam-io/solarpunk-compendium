/**
 * Article Detail Page - Server-side data loading
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	const [article, editions, authors] = await Promise.all([
		db.article.findUnique({
			where: { id },
			include: {
				edition: {
					select: { id: true, slug: true, title: true, season: true, year: true, status: true }
				},
				author: {
					select: { id: true, name: true, slug: true, avatar: true, bio: true }
				},
				relationsFrom: {
					include: {
						articleTo: { select: { id: true, slug: true, title: true } },
						postTo: { select: { id: true, slug: true, title: true } }
					}
				},
				relationsTo: {
					include: {
						articleFrom: { select: { id: true, slug: true, title: true } },
						postFrom: { select: { id: true, slug: true, title: true } }
					}
				}
			}
		}),
		db.edition.findMany({
			select: { id: true, slug: true, season: true, year: true },
			orderBy: [{ year: 'desc' }, { season: 'desc' }]
		}),
		db.author.findMany({
			select: { id: true, name: true, slug: true },
			orderBy: { name: 'asc' }
		})
	]);

	if (!article) {
		throw error(404, 'Article not found');
	}

	return { article, editions, authors };
};
