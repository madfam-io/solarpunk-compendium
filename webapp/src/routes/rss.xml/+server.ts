/**
 * RSS Feed for Editions
 *
 * Generates an RSS 2.0 feed of published editions and their articles.
 */

import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

const SITE_URL = 'https://solarpunkalmanac.org';
const SITE_TITLE = 'The Solarpunk Almanac';
const SITE_DESCRIPTION =
	'A quarterly publication for the global solarpunk movement. Practical guides for regenerative living, community resilience, and building hopeful futures.';

function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function formatDate(date: Date): string {
	return date.toUTCString();
}

export const GET: RequestHandler = async () => {
	const editions = await db.edition.findMany({
		where: { status: 'PUBLISHED' },
		include: {
			articles: {
				where: { status: 'PUBLISHED' },
				orderBy: { order: 'asc' },
				select: {
					slug: true,
					title: true,
					excerpt: true,
					author: true,
					publishedAt: true
				}
			}
		},
		orderBy: [{ year: 'desc' }, { publishedAt: 'desc' }]
	});

	const items: string[] = [];

	for (const edition of editions) {
		// Add edition as an item
		const editionUrl = `${SITE_URL}/editions/${edition.slug}`;
		const pubDate = edition.publishedAt ? formatDate(new Date(edition.publishedAt)) : '';

		items.push(`
    <item>
      <title>${escapeXml(edition.title)} - ${edition.season.charAt(0).toUpperCase() + edition.season.slice(1)} ${edition.year}</title>
      <link>${editionUrl}</link>
      <description>${escapeXml(edition.tagline || edition.description || '')}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${editionUrl}</guid>
      <category>Edition</category>
    </item>`);

		// Add each article as an item
		for (const article of edition.articles) {
			const articleUrl = `${SITE_URL}/editions/${edition.slug}/${article.slug}`;
			const articlePubDate = article.publishedAt
				? formatDate(new Date(article.publishedAt))
				: pubDate;

			items.push(`
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <description>${escapeXml(article.excerpt || '')}</description>
      <pubDate>${articlePubDate}</pubDate>
      <guid isPermaLink="true">${articleUrl}</guid>
      <author>${escapeXml(article.author || 'The Solarpunk Almanac')}</author>
      <category>Article</category>
    </item>`);
		}
	}

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${formatDate(new Date())}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/og-image.png</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}</link>
    </image>
    ${items.join('')}
  </channel>
</rss>`;

	return new Response(rss, {
		headers: {
			'Content-Type': 'application/rss+xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
