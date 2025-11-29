/**
 * Edition Detail Page Server-Side Data Loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const edition = await db.edition.findUnique({
		where: { slug: params.slug },
		include: {
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
					section: true,
					publishedAt: true
				}
			}
		}
	});

	if (!edition) {
		throw error(404, 'Edition not found');
	}

	// Only show published editions (or drafts to admins - future enhancement)
	if (edition.status !== 'PUBLISHED') {
		throw error(404, 'Edition not found');
	}

	// Normalize 'fall' -> 'autumn' for Codex design system compatibility
	const normalizeSeason = (season: string) => {
		const s = season.toLowerCase();
		return s === 'fall' ? 'autumn' : s;
	};

	return {
		edition: {
			id: edition.id,
			slug: edition.slug,
			season: normalizeSeason(edition.season),
			year: edition.year,
			title: edition.title,
			tagline: edition.tagline,
			description: edition.description,
			coverImage: edition.coverImage,
			publishedAt: edition.publishedAt?.toISOString() || null
		},
		articles: edition.articles.map((a) => ({
			...a,
			publishedAt: a.publishedAt?.toISOString() || null
		}))
	};
};
