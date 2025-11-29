/**
 * Harvest Pipeline Types
 *
 * Types for the content harvesting system
 */

import type { SourceType, ContentType, HarvestStatus } from '@prisma/client';

// Normalized project data structure
export interface NormalizedProject {
	name: string;
	tagline: string;
	description: string;
	website?: string;
	location?: string;
	coordinates?: { lat: number; lng: number };
	coverImage?: string;
	logo?: string;
	categories: string[]; // Category slugs
	sdgs: number[]; // SDG numbers 1-17
	tags: string[];
	contact?: {
		email?: string;
		phone?: string;
		social?: Record<string, string>;
	};
}

// Normalized article data structure
export interface NormalizedArticle {
	title: string;
	subtitle?: string;
	excerpt: string;
	content: string; // MDX/Markdown
	author?: string;
	coverImage?: string;
	section?: string; // ArticleSection
	tags: string[];
	sourceUrl?: string;
	license?: string; // CC-BY, etc.
}

// Source configuration
export interface SourceConfig {
	// Rate limiting
	requestsPerMinute?: number;
	delayBetweenRequests?: number; // ms

	// Authentication
	apiKey?: string;
	authHeader?: string;

	// Pagination
	pageSize?: number;
	maxPages?: number;

	// Filtering
	categories?: string[];
	regions?: string[];
	dateRange?: {
		from?: string;
		to?: string;
	};

	// Custom fields per source
	[key: string]: unknown;
}

// Field mapping configuration
export interface FieldMapping {
	// Map source fields to our schema
	name?: string | string[]; // Can be path like "properties.name" or array for fallbacks
	tagline?: string | string[];
	description?: string | string[];
	website?: string | string[];
	location?: string | string[];
	lat?: string;
	lng?: string;
	coverImage?: string | string[];
	categories?: string | CategoryMapping;
	sdgs?: string | SdgMapping;
	tags?: string;

	// For articles
	title?: string | string[];
	content?: string | string[];
	author?: string | string[];
	excerpt?: string | string[];
}

export interface CategoryMapping {
	field: string;
	map: Record<string, string>; // source value -> our category slug
}

export interface SdgMapping {
	field: string;
	map?: Record<string, number>; // source value -> SDG number
}

// Harvester interface
export interface Harvester {
	type: SourceType;
	harvest(source: HarvestSourceData): AsyncGenerator<HarvestResult>;
	normalize(rawData: unknown, mapping?: FieldMapping): NormalizedProject | NormalizedArticle | null;
}

export interface HarvestSourceData {
	id: string;
	slug: string;
	name: string;
	type: SourceType;
	url?: string | null;
	config?: SourceConfig | null;
	mapping?: FieldMapping | null;
}

export interface HarvestResult {
	externalId: string;
	externalUrl?: string;
	rawData: unknown;
	normalized?: NormalizedProject | NormalizedArticle;
	contentType: ContentType;
	quality: number; // 0-100
}

// Quality scoring weights
export interface QualityWeights {
	hasName: number;
	hasDescription: number;
	hasWebsite: number;
	hasLocation: number;
	hasImage: number;
	hasCategories: number;
	hasSdgs: number;
	descriptionLength: number; // per 100 chars, up to limit
}

export const DEFAULT_QUALITY_WEIGHTS: QualityWeights = {
	hasName: 15,
	hasDescription: 20,
	hasWebsite: 10,
	hasLocation: 10,
	hasImage: 10,
	hasCategories: 15,
	hasSdgs: 10,
	descriptionLength: 10 // Max 10 points for 500+ chars
};
