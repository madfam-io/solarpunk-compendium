/**
 * Homepage Server-Side Data Loading
 *
 * Fetches the current/upcoming edition and featured content
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	// Get the latest published edition (or upcoming if none published)
	const currentEdition = await db.edition.findFirst({
		where: {
			OR: [{ status: 'PUBLISHED' }, { status: 'DRAFT' }]
		},
		include: {
			articles: {
				where: { status: 'PUBLISHED' },
				orderBy: { order: 'asc' },
				take: 6,
				select: {
					id: true,
					slug: true,
					title: true,
					subtitle: true,
					excerpt: true,
					author: true,
					readTime: true,
					section: true
				}
			},
			_count: { select: { articles: true } }
		},
		orderBy: [{ year: 'desc' }, { publishedAt: 'desc' }]
	});

	// Get featured projects
	const featuredProjects = await db.project.findMany({
		where: {
			status: 'PUBLISHED',
			featured: true
		},
		take: 3,
		select: {
			id: true,
			slug: true,
			name: true,
			tagline: true,
			coverImage: true,
			location: true
		}
	});

	// Calculate days until launch (Dec 21, 2025)
	const launchDate = new Date('2025-12-21T00:00:00');
	const now = new Date();
	const daysUntilLaunch = Math.max(
		0,
		Math.ceil((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
	);

	// Normalize 'fall' -> 'autumn' for Codex design system compatibility
	const normalizeSeason = (season: string) => {
		const s = season.toLowerCase();
		return s === 'fall' ? 'autumn' : s;
	};

	return {
		currentEdition: currentEdition
			? {
					id: currentEdition.id,
					slug: currentEdition.slug,
					title: currentEdition.title,
					season: normalizeSeason(currentEdition.season),
					year: currentEdition.year,
					tagline: currentEdition.tagline,
					description: currentEdition.description,
					status: currentEdition.status.toLowerCase(),
					publishedAt: currentEdition.publishedAt?.toISOString() || null,
					articleCount: currentEdition._count.articles,
					articles: currentEdition.articles
				}
			: null,
		featuredProjects,
		launchDate: launchDate.toISOString(),
		daysUntilLaunch
	};
};
