/**
 * Quality Scoring for Harvested Content
 *
 * Scores content 0-100 based on completeness and relevance
 */

import type { NormalizedProject, NormalizedArticle, QualityWeights } from './types';
import { DEFAULT_QUALITY_WEIGHTS } from './types';

/**
 * Calculate quality score for a normalized project
 */
export function scoreProject(
	project: NormalizedProject,
	weights: QualityWeights = DEFAULT_QUALITY_WEIGHTS
): number {
	let score = 0;

	// Required fields
	if (project.name && project.name.length > 2) {
		score += weights.hasName;
	}

	if (project.description && project.description.length > 20) {
		score += weights.hasDescription;

		// Bonus for longer descriptions (up to 500 chars)
		const descBonus = Math.min(project.description.length / 500, 1) * weights.descriptionLength;
		score += descBonus;
	}

	// Optional but valuable fields
	if (project.website) {
		score += weights.hasWebsite;
	}

	if (project.location) {
		score += weights.hasLocation;
	}

	if (project.coverImage || project.logo) {
		score += weights.hasImage;
	}

	if (project.categories && project.categories.length > 0) {
		score += weights.hasCategories;
	}

	if (project.sdgs && project.sdgs.length > 0) {
		score += weights.hasSdgs;
	}

	return Math.min(Math.round(score), 100);
}

/**
 * Calculate quality score for a normalized article
 */
export function scoreArticle(article: NormalizedArticle): number {
	let score = 0;

	// Title is required
	if (article.title && article.title.length > 5) {
		score += 20;
	}

	// Content is required
	if (article.content) {
		score += 25;

		// Bonus for substantial content (1000+ chars)
		if (article.content.length > 1000) {
			score += 15;
		}
		if (article.content.length > 3000) {
			score += 10;
		}
	}

	// Excerpt helps with discoverability
	if (article.excerpt && article.excerpt.length > 50) {
		score += 10;
	}

	// Author attribution
	if (article.author) {
		score += 5;
	}

	// Cover image for visual appeal
	if (article.coverImage) {
		score += 10;
	}

	// License clarity (important for republishing)
	if (article.license) {
		score += 5;
	}

	return Math.min(Math.round(score), 100);
}

/**
 * Check if content meets minimum quality threshold
 */
export function meetsMinimumQuality(score: number, type: 'project' | 'article'): boolean {
	const thresholds = {
		project: 40, // Must have name, description, and at least one other field
		article: 50 // Must have title and substantial content
	};

	return score >= thresholds[type];
}

/**
 * Get quality tier label
 */
export function getQualityTier(score: number): 'low' | 'medium' | 'high' | 'excellent' {
	if (score >= 80) return 'excellent';
	if (score >= 60) return 'high';
	if (score >= 40) return 'medium';
	return 'low';
}

/**
 * Generate quality improvement suggestions
 */
export function getImprovementSuggestions(project: NormalizedProject): string[] {
	const suggestions: string[] = [];

	if (!project.description || project.description.length < 100) {
		suggestions.push('Add a more detailed description (at least 100 characters)');
	}

	if (!project.website) {
		suggestions.push('Add a website URL');
	}

	if (!project.location) {
		suggestions.push('Add location information');
	}

	if (!project.coverImage && !project.logo) {
		suggestions.push('Add a cover image or logo');
	}

	if (!project.categories || project.categories.length === 0) {
		suggestions.push('Assign at least one category');
	}

	if (!project.sdgs || project.sdgs.length === 0) {
		suggestions.push('Link to relevant UN Sustainable Development Goals');
	}

	if (!project.tagline || project.tagline.length < 20) {
		suggestions.push('Add a compelling tagline (20-100 characters)');
	}

	return suggestions;
}

/**
 * Check for potential duplicates based on similarity
 */
export function calculateSimilarity(a: NormalizedProject, b: NormalizedProject): number {
	let score = 0;

	// Name similarity (Jaccard on words)
	const aWords = new Set(a.name.toLowerCase().split(/\s+/));
	const bWords = new Set(b.name.toLowerCase().split(/\s+/));
	const intersection = new Set([...aWords].filter((x) => bWords.has(x)));
	const union = new Set([...aWords, ...bWords]);
	const nameSimilarity = intersection.size / union.size;
	score += nameSimilarity * 40;

	// Website match
	if (a.website && b.website) {
		const aDomain = extractDomain(a.website);
		const bDomain = extractDomain(b.website);
		if (aDomain === bDomain) {
			score += 40;
		}
	}

	// Location match
	if (a.location && b.location && a.location.toLowerCase() === b.location.toLowerCase()) {
		score += 20;
	}

	return Math.min(Math.round(score), 100);
}

function extractDomain(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
}
