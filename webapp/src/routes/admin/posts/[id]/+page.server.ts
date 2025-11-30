/**
 * Post Detail Page - Server-side data loading
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	const [post, editions, authors] = await Promise.all([
		db.post.findUnique({
			where: { id },
			include: {
				author: {
					select: { id: true, name: true, slug: true, avatar: true, bio: true }
				},
				submitter: {
					select: { id: true, name: true, email: true }
				},
				promotedTo: {
					select: { id: true, slug: true, title: true, season: true, year: true }
				},
				tags: {
					include: { tag: true }
				}
			}
		}),
		db.edition.findMany({
			where: { status: { not: 'ARCHIVED' } },
			select: { id: true, slug: true, season: true, year: true },
			orderBy: [{ year: 'desc' }, { season: 'desc' }]
		}),
		db.author.findMany({
			select: { id: true, name: true, slug: true },
			orderBy: { name: 'asc' }
		})
	]);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post: {
			...post,
			tags: post.tags.map((t) => t.tag.name)
		},
		editions,
		authors
	};
};
