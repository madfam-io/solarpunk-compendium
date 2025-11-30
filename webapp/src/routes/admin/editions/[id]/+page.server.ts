/**
 * Edition Detail Page - Server-side data loading
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	const edition = await db.edition.findUnique({
		where: { id },
		include: {
			articles: {
				include: {
					author: {
						select: { id: true, name: true, slug: true, avatar: true }
					}
				},
				orderBy: { order: 'asc' }
			},
			submissions: {
				include: {
					submitter: {
						select: { id: true, name: true, email: true, avatar: true }
					}
				},
				orderBy: { createdAt: 'desc' }
			},
			promotedPosts: {
				include: {
					author: {
						select: { id: true, name: true, slug: true, avatar: true }
					}
				}
			}
		}
	});

	if (!edition) {
		throw error(404, 'Edition not found');
	}

	return { edition };
};
