/**
 * RSS/Atom Feed Harvester
 *
 * Fetches and parses RSS/Atom feeds for article content
 */

import type { HarvestResult, HarvestSourceData, FieldMapping } from '../types';
import { normalizeToArticle } from '../normalize';
import { scoreArticle } from '../quality';

interface FeedItem {
	title?: string;
	link?: string;
	description?: string;
	content?: string;
	'content:encoded'?: string;
	author?: string;
	'dc:creator'?: string;
	pubDate?: string;
	published?: string;
	id?: string;
	guid?: string;
	enclosure?: { url?: string };
	'media:content'?: { url?: string };
}

/**
 * Parse XML to simple object (basic implementation)
 * In production, use a proper XML parser like fast-xml-parser
 */
function parseXml(xml: string): Record<string, unknown> {
	// This is a simplified parser. For production, use fast-xml-parser
	const result: Record<string, unknown> = {};

	// Extract channel/feed items
	const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>|<entry[^>]*>[\s\S]*?<\/entry>/gi);

	if (itemMatches) {
		result.items = itemMatches.map((itemXml) => {
			const item: Record<string, string> = {};

			// Extract common fields
			const fields = [
				'title',
				'link',
				'description',
				'content',
				'content:encoded',
				'author',
				'dc:creator',
				'pubDate',
				'published',
				'id',
				'guid'
			];

			for (const field of fields) {
				const regex = new RegExp(`<${field}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${field}>|<${field}[^>]*>([\\s\\S]*?)<\\/${field}>`, 'i');
				const match = itemXml.match(regex);
				if (match) {
					item[field] = (match[1] || match[2] || '').trim();
				}
			}

			// Extract href from link tags (Atom format)
			const linkMatch = itemXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
			if (linkMatch && !item.link) {
				item.link = linkMatch[1];
			}

			// Extract media/enclosure
			const mediaMatch = itemXml.match(/url=["']([^"']+\.(jpg|jpeg|png|gif|webp)[^"']*)["']/i);
			if (mediaMatch) {
				item.coverImage = mediaMatch[1];
			}

			return item;
		});
	}

	return result;
}

export async function* harvestRss(source: HarvestSourceData): AsyncGenerator<HarvestResult> {
	if (!source.url) {
		throw new Error(`RSS source ${source.slug} has no URL`);
	}

	try {
		const response = await fetch(source.url, {
			headers: {
				'User-Agent': 'SolarpunkAlmanac/1.0 (content harvester)',
				Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
		}

		const xml = await response.text();
		const feed = parseXml(xml);

		if (!feed.items || !Array.isArray(feed.items)) {
			return;
		}

		const mapping = source.mapping as FieldMapping || {};

		for (const item of feed.items as FeedItem[]) {
			// Create external ID from guid, id, or link
			const externalId = item.guid || item.id || item.link;
			if (!externalId) continue;

			// Prepare raw data with content field resolution
			const rawData = {
				...item,
				content: item['content:encoded'] || item.content || item.description,
				author: item['dc:creator'] || item.author,
				published: item.pubDate || item.published
			};

			// Normalize to article
			const normalized = normalizeToArticle(rawData, {
				title: 'title',
				content: 'content',
				excerpt: 'description',
				author: 'author',
				coverImage: 'coverImage',
				website: 'link',
				...mapping
			});

			if (!normalized) continue;

			// Add source URL
			normalized.sourceUrl = item.link;

			const quality = scoreArticle(normalized);

			yield {
				externalId,
				externalUrl: item.link,
				rawData,
				normalized,
				contentType: 'ARTICLE',
				quality
			};
		}
	} catch (error) {
		console.error(`Error harvesting RSS from ${source.slug}:`, error);
		throw error;
	}
}
