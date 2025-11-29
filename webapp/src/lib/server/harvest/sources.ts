/**
 * Harvest Source Configurations
 *
 * Pre-configured sources for initial content seeding
 */

import type { SourceType } from '@prisma/client';
import type { SourceConfig, FieldMapping } from './types';

export interface SourceDefinition {
	slug: string;
	name: string;
	type: SourceType;
	url?: string;
	description: string;
	config: SourceConfig;
	mapping: FieldMapping;
	priority: number;
	schedule?: string; // Cron expression
}

// ============================================
// ECOVILLAGE & COMMUNITY SOURCES
// ============================================

export const GEN_ECOVILLAGES: SourceDefinition = {
	slug: 'gen-ecovillages',
	name: 'Global Ecovillage Network',
	type: 'API',
	url: 'https://ecovillage.org/projects/', // Public directory
	description: 'Global network of sustainable communities and ecovillages',
	config: {
		requestsPerMinute: 10,
		pageSize: 50,
		maxPages: 100
	},
	mapping: {
		name: 'title',
		tagline: 'excerpt',
		description: 'content',
		website: 'website',
		location: ['location.country', 'location.region'],
		lat: 'location.lat',
		lng: 'location.lng',
		coverImage: 'featured_image',
		categories: {
			field: 'categories',
			map: {
				ecovillage: 'community',
				permaculture: 'food',
				'renewable-energy': 'energy',
				education: 'education'
			}
		}
	},
	priority: 100,
	schedule: '0 3 * * 0' // Weekly on Sunday at 3am
};

export const TRANSITION_TOWNS: SourceDefinition = {
	slug: 'transition-network',
	name: 'Transition Network',
	type: 'API',
	url: 'https://transitionnetwork.org/transition-near-me/',
	description: 'Community-led responses to climate change and economic challenges',
	config: {
		requestsPerMinute: 10,
		pageSize: 100
	},
	mapping: {
		name: 'name',
		tagline: 'short_description',
		description: 'description',
		website: 'website',
		location: 'location',
		lat: 'latitude',
		lng: 'longitude',
		categories: {
			field: 'type',
			map: {
				hub: 'community',
				initiative: 'community',
				group: 'community'
			}
		}
	},
	priority: 90
};

export const FIC_COMMUNITIES: SourceDefinition = {
	slug: 'fic-communities',
	name: 'Foundation for Intentional Community',
	type: 'API',
	url: 'https://www.ic.org/directory/',
	description: 'Directory of intentional communities worldwide',
	config: {
		requestsPerMinute: 5,
		pageSize: 50
	},
	mapping: {
		name: 'name',
		tagline: 'mission',
		description: 'description',
		website: 'website',
		location: ['city', 'state', 'country'],
		lat: 'lat',
		lng: 'lng',
		coverImage: 'image'
	},
	priority: 85
};

// ============================================
// REPAIR & MAKER SOURCES
// ============================================

export const REPAIR_CAFE: SourceDefinition = {
	slug: 'repair-cafe',
	name: 'Repair Café International',
	type: 'API',
	url: 'https://www.repaircafe.org/en/visit/',
	description: 'Global network of community repair events',
	config: {
		requestsPerMinute: 10
	},
	mapping: {
		name: 'name',
		tagline: 'subtitle',
		description: 'description',
		website: 'url',
		location: ['city', 'country'],
		lat: 'lat',
		lng: 'lng',
		categories: {
			field: '_type',
			map: {
				repaircafe: 'community'
			}
		}
	},
	priority: 80
};

export const HACKERSPACES: SourceDefinition = {
	slug: 'hackerspaces-org',
	name: 'Hackerspaces.org',
	type: 'API',
	url: 'https://wiki.hackerspaces.org/w/api.php',
	description: 'Directory of hackerspaces, makerspaces, and fablabs',
	config: {
		requestsPerMinute: 10,
		pageSize: 100
	},
	mapping: {
		name: 'name',
		description: 'description',
		website: 'website',
		location: ['city', 'country'],
		lat: 'lat',
		lng: 'lon',
		categories: {
			field: 'type',
			map: {
				hackerspace: 'tech',
				makerspace: 'tech',
				fablab: 'tech'
			}
		}
	},
	priority: 75
};

// ============================================
// FOOD & AGRICULTURE SOURCES
// ============================================

export const OPEN_FOOD_NETWORK: SourceDefinition = {
	slug: 'open-food-network',
	name: 'Open Food Network',
	type: 'API',
	url: 'https://openfoodnetwork.org/',
	description: 'Platform connecting food producers and consumers',
	config: {
		requestsPerMinute: 10
	},
	mapping: {
		name: 'name',
		tagline: 'tagline',
		description: 'description',
		website: 'website',
		location: 'address',
		lat: 'latitude',
		lng: 'longitude',
		categories: {
			field: 'type',
			map: {
				producer: 'food',
				hub: 'food',
				'buying-group': 'community'
			}
		}
	},
	priority: 70
};

export const WWOOF: SourceDefinition = {
	slug: 'wwoof-farms',
	name: 'WWOOF (World Wide Opportunities on Organic Farms)',
	type: 'MANUAL', // Requires partnership
	description: 'Network of organic farms offering learning experiences',
	config: {},
	mapping: {
		name: 'farm_name',
		description: 'description',
		location: ['region', 'country'],
		categories: {
			field: '_type',
			map: { farm: 'food' }
		}
	},
	priority: 60
};

// ============================================
// ENERGY & SUSTAINABILITY SOURCES
// ============================================

export const COMMUNITY_ENERGY: SourceDefinition = {
	slug: 'community-energy',
	name: 'Community Energy Projects',
	type: 'MANUAL',
	description: 'Community-owned renewable energy projects',
	config: {},
	mapping: {
		name: 'name',
		description: 'description',
		website: 'website',
		location: 'location',
		categories: {
			field: 'type',
			map: {
				solar: 'energy',
				wind: 'energy',
				hydro: 'energy'
			}
		},
		sdgs: {
			field: '_auto',
			map: { energy: 7 }
		}
	},
	priority: 65
};

// ============================================
// RSS/BLOG SOURCES (for articles)
// ============================================

export const LOW_TECH_MAGAZINE: SourceDefinition = {
	slug: 'low-tech-magazine',
	name: 'Low-Tech Magazine',
	type: 'RSS',
	url: 'https://solar.lowtechmagazine.com/feeds/all-en.atom.xml',
	description: 'Sustainable solutions from the past',
	config: {
		maxPages: 1
	},
	mapping: {
		title: 'title',
		content: 'content',
		excerpt: 'summary',
		author: 'author.name',
		coverImage: 'media_content.url'
	},
	priority: 50,
	schedule: '0 6 * * *' // Daily at 6am
};

export const RESILIENCE_ORG: SourceDefinition = {
	slug: 'resilience-org',
	name: 'Resilience.org',
	type: 'RSS',
	url: 'https://www.resilience.org/feed/',
	description: 'Building a world of resilient communities',
	config: {
		maxPages: 1
	},
	mapping: {
		title: 'title',
		content: 'content:encoded',
		excerpt: 'description',
		author: 'dc:creator'
	},
	priority: 50,
	schedule: '0 6 * * *'
};

export const PERMACULTURE_NEWS: SourceDefinition = {
	slug: 'permaculture-news',
	name: 'Permaculture News',
	type: 'RSS',
	url: 'https://www.permaculturenews.org/feed/',
	description: 'Latest in permaculture design and practice',
	config: {},
	mapping: {
		title: 'title',
		content: 'content:encoded',
		excerpt: 'description',
		author: 'dc:creator',
		coverImage: 'media:content.url'
	},
	priority: 45,
	schedule: '0 6 * * *'
};

// ============================================
// SOCIAL SOURCES
// ============================================

export const MASTODON_SOLARPUNK: SourceDefinition = {
	slug: 'mastodon-solarpunk',
	name: 'Mastodon #solarpunk',
	type: 'SOCIAL',
	url: 'https://mastodon.social/api/v1/timelines/tag/solarpunk',
	description: 'Solarpunk content from the fediverse',
	config: {
		requestsPerMinute: 5,
		pageSize: 40
	},
	mapping: {
		name: 'account.display_name',
		description: 'content',
		website: 'url'
	},
	priority: 30,
	schedule: '0 */4 * * *' // Every 4 hours
};

// ============================================
// CURATED MANUAL SOURCES
// ============================================

export const CURATED_FLAGSHIP: SourceDefinition = {
	slug: 'curated-flagship',
	name: 'Curated Flagship Projects',
	type: 'MANUAL',
	description: 'Hand-picked exemplary solarpunk projects',
	config: {},
	mapping: {},
	priority: 100
};

// Export all sources
export const ALL_SOURCES: SourceDefinition[] = [
	GEN_ECOVILLAGES,
	TRANSITION_TOWNS,
	FIC_COMMUNITIES,
	REPAIR_CAFE,
	HACKERSPACES,
	OPEN_FOOD_NETWORK,
	WWOOF,
	COMMUNITY_ENERGY,
	LOW_TECH_MAGAZINE,
	RESILIENCE_ORG,
	PERMACULTURE_NEWS,
	MASTODON_SOLARPUNK,
	CURATED_FLAGSHIP
];

// Group by type
export const SOURCES_BY_TYPE = {
	directories: [GEN_ECOVILLAGES, TRANSITION_TOWNS, FIC_COMMUNITIES, REPAIR_CAFE, HACKERSPACES],
	food: [OPEN_FOOD_NETWORK, WWOOF],
	energy: [COMMUNITY_ENERGY],
	blogs: [LOW_TECH_MAGAZINE, RESILIENCE_ORG, PERMACULTURE_NEWS],
	social: [MASTODON_SOLARPUNK],
	curated: [CURATED_FLAGSHIP]
};
