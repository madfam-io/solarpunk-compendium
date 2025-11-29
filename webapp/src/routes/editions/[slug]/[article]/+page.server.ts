/**
 * Article Detail Page Server-Side Data Loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	// Fetch the article with its edition
	const article = await db.article.findFirst({
		where: {
			slug: params.article,
			edition: { slug: params.slug }
		},
		include: {
			edition: {
				select: {
					id: true,
					slug: true,
					title: true,
					season: true,
					year: true,
					status: true
				}
			}
		}
	});

	if (!article) {
		throw error(404, 'Article not found');
	}

	// Only show published articles from published editions
	if (article.status !== 'PUBLISHED' || article.edition.status !== 'PUBLISHED') {
		throw error(404, 'Article not found');
	}

	// Get adjacent articles for navigation
	const allArticles = await db.article.findMany({
		where: {
			editionId: article.editionId,
			status: 'PUBLISHED'
		},
		orderBy: { order: 'asc' },
		select: {
			id: true,
			slug: true,
			title: true,
			order: true
		}
	});

	const currentIndex = allArticles.findIndex((a) => a.id === article.id);
	const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
	const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

	return {
		article: {
			id: article.id,
			slug: article.slug,
			title: article.title,
			subtitle: article.subtitle,
			content: article.content,
			excerpt: article.excerpt,
			coverImage: article.coverImage,
			author: article.author,
			readTime: article.readTime,
			section: article.section,
			publishedAt: article.publishedAt?.toISOString() || null
		},
		edition: {
			slug: article.edition.slug,
			title: article.edition.title,
			season: article.edition.season.toLowerCase(),
			year: article.edition.year
		},
		navigation: {
			prev: prevArticle,
			next: nextArticle,
			total: allArticles.length,
			current: currentIndex + 1
		}
	};
};
