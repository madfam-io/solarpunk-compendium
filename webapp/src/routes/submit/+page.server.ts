/**
 * Public Submission Portal - Server-side data loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async (event) => {
	// Get editions that are accepting submissions
	const editions = await db.edition.findMany({
		where: {
			status: 'ACCEPTING'
		},
		select: {
			id: true,
			slug: true,
			title: true,
			season: true,
			year: true,
			tagline: true,
			description: true,
			callCloseAt: true
		},
		orderBy: [{ year: 'asc' }, { season: 'asc' }]
	});

	return {
		editions,
		user: event.locals.user || null
	};
};
