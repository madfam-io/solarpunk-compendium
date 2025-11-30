/**
 * Author Detail Page - Server-side data loading
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	const author = await db.author.findUnique({
		where: { id },
		include: {
			user: {
				select: { id: true, email: true, name: true }
			},
			_count: {
				select: { articles: true, posts: true }
			}
		}
	});

	if (!author) {
		throw error(404, 'Author not found');
	}

	return { author };
};
