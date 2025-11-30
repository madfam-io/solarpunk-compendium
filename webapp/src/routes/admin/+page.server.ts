/**
 * Solstice CMS Admin Dashboard
 * Server-side data loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	// Fetch recent editions with counts
	const editions = await db.edition.findMany({
		include: {
			_count: {
				select: { articles: true, submissions: true }
			}
		},
		orderBy: [{ year: 'desc' }, { season: 'desc' }],
		take: 5
	});

	// Fetch recent articles
	const articles = await db.article.findMany({
		include: {
			edition: {
				select: { id: true, slug: true, season: true, year: true }
			},
			author: {
				select: { id: true, name: true, slug: true }
			}
		},
		orderBy: { updatedAt: 'desc' },
		take: 5
	});

	// Fetch recent posts
	const posts = await db.post.findMany({
		include: {
			author: {
				select: { id: true, name: true, slug: true }
			},
			promotedTo: {
				select: { id: true, slug: true, season: true, year: true }
			}
		},
		orderBy: { updatedAt: 'desc' },
		take: 5
	});

	// Fetch pending submissions
	const submissions = await db.editionSubmission.findMany({
		where: { status: 'PENDING' },
		include: {
			edition: {
				select: { id: true, slug: true, season: true, year: true }
			},
			submitter: {
				select: { id: true, name: true, email: true }
			}
		},
		orderBy: { createdAt: 'desc' },
		take: 5
	});

	// Get stats
	const [
		editionStats,
		articleStats,
		postStats,
		submissionStats
	] = await Promise.all([
		db.edition.groupBy({
			by: ['status'],
			_count: true
		}),
		db.article.groupBy({
			by: ['status'],
			_count: true
		}),
		db.post.groupBy({
			by: ['status'],
			_count: true
		}),
		db.editionSubmission.groupBy({
			by: ['status'],
			_count: true
		})
	]);

	const stats = {
		editions: {
			total: editionStats.reduce((sum, s) => sum + s._count, 0),
			published: editionStats.find((s) => s.status === 'PUBLISHED')?._count || 0
		},
		articles: {
			total: articleStats.reduce((sum, s) => sum + s._count, 0),
			growing: articleStats.find((s) => s.status === 'GROWING')?._count || 0
		},
		posts: {
			total: postStats.reduce((sum, s) => sum + s._count, 0),
			harvest: postStats.find((s) => s.status === 'HARVEST')?._count || 0
		},
		submissions: {
			total: submissionStats.reduce((sum, s) => sum + s._count, 0),
			pending: submissionStats.find((s) => s.status === 'PENDING')?._count || 0
		}
	};

	return {
		editions: editions.map((e) => ({
			...e,
			counts: e._count
		})),
		articles,
		posts,
		submissions,
		stats
	};
};
