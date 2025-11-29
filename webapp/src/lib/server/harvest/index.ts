/**
 * Harvest Module
 *
 * Content harvesting pipeline for The Solarpunk Almanac
 */

// Types
export type {
	NormalizedProject,
	NormalizedArticle,
	SourceConfig,
	FieldMapping,
	HarvestResult,
	HarvestSourceData
} from './types';

// Sources
export { ALL_SOURCES, SOURCES_BY_TYPE, type SourceDefinition } from './sources';

// Quality scoring
export {
	scoreProject,
	scoreArticle,
	meetsMinimumQuality,
	getQualityTier,
	getImprovementSuggestions,
	calculateSimilarity
} from './quality';

// Normalization
export {
	normalizeToProject,
	normalizeToArticle,
	generateSlug,
	createExternalId,
	getPath
} from './normalize';

// Service
export {
	runHarvest,
	runHarvestBySlug,
	runAllHarvests,
	initializeSources,
	publishApprovedItems,
	getQueueStats,
	type HarvestStats
} from './service';

// Harvesters
export { harvestRss } from './harvesters/rss';
export { harvestManual, FLAGSHIP_PROJECTS, importProjects, importArticles } from './harvesters/manual';
