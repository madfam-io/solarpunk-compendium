/**
 * New Post Page - Server-side data loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const authors = await db.author.findMany({
		select: { id: true, name: true, slug: true },
		orderBy: { name: 'asc' }
	});

	return { authors };
};
