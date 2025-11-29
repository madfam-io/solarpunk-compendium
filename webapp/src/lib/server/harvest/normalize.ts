/**
 * Data Normalization Utilities
 *
 * Transform raw data from various sources into our schema
 */

import type { FieldMapping, NormalizedProject, NormalizedArticle, CategoryMapping, SdgMapping } from './types';

/**
 * Get a value from an object using dot notation path
 * Supports arrays of paths for fallbacks
 */
export function getPath(obj: unknown, path: string | string[]): unknown {
	if (Array.isArray(path)) {
		for (const p of path) {
			const value = getPath(obj, p);
			if (value !== undefined && value !== null && value !== '') {
				return value;
			}
		}
		return undefined;
	}

	const parts = path.split('.');
	let current: unknown = obj;

	for (const part of parts) {
		if (current === null || current === undefined) {
			return undefined;
		}
		if (typeof current !== 'object') {
			return undefined;
		}
		current = (current as Record<string, unknown>)[part];
	}

	return current;
}

/**
 * Normalize raw data to a project using field mapping
 */
export function normalizeToProject(
	rawData: unknown,
	mapping: FieldMapping
): NormalizedProject | null {
	if (!rawData || typeof rawData !== 'object') {
		return null;
	}

	const data = rawData as Record<string, unknown>;

	// Extract basic fields
	const name = extractString(data, mapping.name);
	if (!name) {
		return null; // Name is required
	}

	const project: NormalizedProject = {
		name,
		tagline: extractString(data, mapping.tagline) || '',
		description: extractString(data, mapping.description) || '',
		website: extractUrl(data, mapping.website),
		location: extractLocation(data, mapping.location),
		coverImage: extractUrl(data, mapping.coverImage),
		categories: extractCategories(data, mapping.categories),
		sdgs: extractSdgs(data, mapping.sdgs),
		tags: extractTags(data, mapping.tags)
	};

	// Extract coordinates if mapping exists
	if (mapping.lat && mapping.lng) {
		const lat = parseFloat(String(getPath(data, mapping.lat) || ''));
		const lng = parseFloat(String(getPath(data, mapping.lng) || ''));
		if (!isNaN(lat) && !isNaN(lng)) {
			project.coordinates = { lat, lng };
		}
	}

	return project;
}

/**
 * Normalize raw data to an article using field mapping
 */
export function normalizeToArticle(
	rawData: unknown,
	mapping: FieldMapping
): NormalizedArticle | null {
	if (!rawData || typeof rawData !== 'object') {
		return null;
	}

	const data = rawData as Record<string, unknown>;

	const title = extractString(data, mapping.title);
	if (!title) {
		return null; // Title is required
	}

	const content = extractString(data, mapping.content);
	if (!content) {
		return null; // Content is required
	}

	return {
		title,
		subtitle: extractString(data, mapping.tagline), // Reuse tagline mapping for subtitle
		excerpt: extractString(data, mapping.excerpt) || generateExcerpt(content),
		content: cleanHtmlContent(content),
		author: extractString(data, mapping.author),
		coverImage: extractUrl(data, mapping.coverImage),
		tags: extractTags(data, mapping.tags),
		sourceUrl: extractUrl(data, mapping.website)
	};
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractString(data: Record<string, unknown>, path?: string | string[]): string | undefined {
	if (!path) return undefined;
	const value = getPath(data, path);
	if (typeof value === 'string') {
		return value.trim();
	}
	if (typeof value === 'number') {
		return String(value);
	}
	return undefined;
}

function extractUrl(data: Record<string, unknown>, path?: string | string[]): string | undefined {
	const value = extractString(data, path);
	if (!value) return undefined;

	// Basic URL validation
	if (value.startsWith('http://') || value.startsWith('https://')) {
		return value;
	}

	// Try adding https
	if (value.includes('.') && !value.includes(' ')) {
		return `https://${value}`;
	}

	return undefined;
}

function extractLocation(
	data: Record<string, unknown>,
	path?: string | string[]
): string | undefined {
	if (!path) return undefined;

	// If path is an array, join non-empty values
	if (Array.isArray(path)) {
		const parts = path
			.map((p) => extractString(data, p))
			.filter((p): p is string => !!p);
		return parts.length > 0 ? parts.join(', ') : undefined;
	}

	return extractString(data, path);
}

function extractCategories(
	data: Record<string, unknown>,
	mapping?: string | CategoryMapping
): string[] {
	if (!mapping) return [];

	if (typeof mapping === 'string') {
		// Direct field reference
		const value = getPath(data, mapping);
		if (Array.isArray(value)) {
			return value.filter((v): v is string => typeof v === 'string');
		}
		if (typeof value === 'string') {
			return [value];
		}
		return [];
	}

	// Mapping object with field and map
	const value = getPath(data, mapping.field);
	const categories: string[] = [];

	const processValue = (v: unknown) => {
		if (typeof v === 'string') {
			const mapped = mapping.map[v.toLowerCase()] || mapping.map[v];
			if (mapped) {
				categories.push(mapped);
			}
		}
	};

	if (Array.isArray(value)) {
		value.forEach(processValue);
	} else {
		processValue(value);
	}

	return [...new Set(categories)]; // Dedupe
}

function extractSdgs(data: Record<string, unknown>, mapping?: string | SdgMapping): number[] {
	if (!mapping) return [];

	if (typeof mapping === 'string') {
		const value = getPath(data, mapping);
		if (Array.isArray(value)) {
			return value
				.map((v) => (typeof v === 'number' ? v : parseInt(String(v), 10)))
				.filter((n) => !isNaN(n) && n >= 1 && n <= 17);
		}
		return [];
	}

	// Mapping object
	const value = getPath(data, mapping.field);
	const sdgs: number[] = [];

	if (mapping.map) {
		const processValue = (v: unknown) => {
			if (typeof v === 'string') {
				const mapped = mapping.map![v.toLowerCase()] || mapping.map![v];
				if (mapped) {
					sdgs.push(mapped);
				}
			}
		};

		if (Array.isArray(value)) {
			value.forEach(processValue);
		} else {
			processValue(value);
		}
	}

	return [...new Set(sdgs)].filter((n) => n >= 1 && n <= 17);
}

function extractTags(data: Record<string, unknown>, path?: string): string[] {
	if (!path) return [];

	const value = getPath(data, path);
	if (Array.isArray(value)) {
		return value.filter((v): v is string => typeof v === 'string').map((t) => t.toLowerCase());
	}
	if (typeof value === 'string') {
		// Split by common delimiters
		return value
			.split(/[,;|]/)
			.map((t) => t.trim().toLowerCase())
			.filter((t) => t.length > 0);
	}
	return [];
}

function generateExcerpt(content: string, maxLength = 200): string {
	// Strip HTML
	const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

	if (text.length <= maxLength) {
		return text;
	}

	// Find last space before maxLength
	const truncated = text.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');

	return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

function cleanHtmlContent(html: string): string {
	// For now, do basic cleanup. Could convert to MDX later.
	return html
		.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
		.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
		.replace(/<!--[\s\S]*?-->/g, '')
		.trim();
}

/**
 * Generate a URL-safe slug from text
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.substring(0, 100);
}

/**
 * Create external ID from source and unique identifier
 */
export function createExternalId(source: string, id: string | number): string {
	return `${source}:${id}`;
}
