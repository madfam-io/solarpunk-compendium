/**
 * Harvest Service
 *
 * Main service for running content harvests
 */

import { db } from '../db';
import type { HarvestResult, HarvestSourceData, NormalizedProject, SourceType } from './types';

// These types will come from @prisma/client when generated
// For now, using the DB result types directly
type HarvestSource = Awaited<ReturnType<typeof db.harvestSource.findFirst>>;
type HarvestItem = Awaited<ReturnType<typeof db.harvestItem.findFirst>>;
import { harvestRss } from './harvesters/rss';
import { harvestManual } from './harvesters/manual';
import { generateSlug } from './normalize';
import { ALL_SOURCES, type SourceDefinition } from './sources';

export interface HarvestStats {
	sourceId: string;
	sourceName: string;
	startedAt: Date;
	completedAt?: Date;
	itemsProcessed: number;
	itemsCreated: number;
	itemsSkipped: number;
	itemsDuplicate: number;
	errors: string[];
}

/**
 * Run harvest for a specific source
 */
export async function runHarvest(sourceId: string): Promise<HarvestStats> {
	const source = await db.harvestSource.findUnique({
		where: { id: sourceId }
	});

	if (!source) {
		throw new Error(`Source not found: ${sourceId}`);
	}

	if (!source.isActive) {
		throw new Error(`Source is not active: ${source.name}`);
	}

	return executeHarvest(source);
}

/**
 * Run harvest for a source by slug
 */
export async function runHarvestBySlug(slug: string): Promise<HarvestStats> {
	const source = await db.harvestSource.findUnique({
		where: { slug }
	});

	if (!source) {
		throw new Error(`Source not found: ${slug}`);
	}

	return executeHarvest(source);
}

/**
 * Run all active harvests
 */
export async function runAllHarvests(): Promise<HarvestStats[]> {
	const sources = await db.harvestSource.findMany({
		where: { isActive: true },
		orderBy: { priority: 'desc' }
	});

	const results: HarvestStats[] = [];

	for (const source of sources) {
		try {
			const stats = await executeHarvest(source);
			results.push(stats);
		} catch (error) {
			results.push({
				sourceId: source.id,
				sourceName: source.name,
				startedAt: new Date(),
				completedAt: new Date(),
				itemsProcessed: 0,
				itemsCreated: 0,
				itemsSkipped: 0,
				itemsDuplicate: 0,
				errors: [error instanceof Error ? error.message : String(error)]
			});
		}
	}

	return results;
}

/**
 * Execute harvest for a source
 */
async function executeHarvest(source: HarvestSource): Promise<HarvestStats> {
	const stats: HarvestStats = {
		sourceId: source.id,
		sourceName: source.name,
		startedAt: new Date(),
		itemsProcessed: 0,
		itemsCreated: 0,
		itemsSkipped: 0,
		itemsDuplicate: 0,
		errors: []
	};

	try {
		const sourceData: HarvestSourceData = {
			id: source.id,
			slug: source.slug,
			name: source.name,
			type: source.type,
			url: source.url,
			config: source.config as Record<string, unknown> | null,
			mapping: source.mapping as Record<string, unknown> | null
		};

		const harvester = getHarvester(source.type);

		for await (const result of harvester(sourceData)) {
			stats.itemsProcessed++;

			try {
				// Check for existing item
				const existing = await db.harvestItem.findUnique({
					where: {
						sourceId_externalId: {
							sourceId: source.id,
							externalId: result.externalId
						}
					}
				});

				if (existing) {
					stats.itemsDuplicate++;
					continue;
				}

				// Create harvest item
				await db.harvestItem.create({
					data: {
						sourceId: source.id,
						externalId: result.externalId,
						externalUrl: result.externalUrl,
						rawData: result.rawData as object,
						normalized: result.normalized as object,
						contentType: result.contentType,
						quality: result.quality,
						status: result.quality >= 60 ? 'APPROVED' : 'PENDING'
					}
				});

				stats.itemsCreated++;
			} catch (error) {
				stats.errors.push(
					`Item ${result.externalId}: ${error instanceof Error ? error.message : String(error)}`
				);
				stats.itemsSkipped++;
			}
		}

		// Update source last harvest time
		await db.harvestSource.update({
			where: { id: source.id },
			data: {
				lastHarvest: new Date(),
				lastError: stats.errors.length > 0 ? stats.errors.join('; ') : null
			}
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		stats.errors.push(errorMessage);

		await db.harvestSource.update({
			where: { id: source.id },
			data: { lastError: errorMessage }
		});
	}

	stats.completedAt = new Date();
	return stats;
}

/**
 * Get harvester function for source type
 */
function getHarvester(
	type: SourceType
): (source: HarvestSourceData) => AsyncGenerator<HarvestResult> {
	switch (type) {
		case 'RSS':
			return harvestRss;
		case 'MANUAL':
		case 'IMPORT':
			return harvestManual;
		// Add more harvesters as needed
		case 'API':
		case 'SCRAPE':
		case 'SOCIAL':
		case 'FORM':
		default:
			return async function* () {
				// Placeholder for unimplemented harvesters
				console.warn(`Harvester not implemented for type: ${type}`);
			};
	}
}

/**
 * Initialize harvest sources from definitions
 */
export async function initializeSources(): Promise<void> {
	for (const def of ALL_SOURCES) {
		await db.harvestSource.upsert({
			where: { slug: def.slug },
			create: {
				slug: def.slug,
				name: def.name,
				type: def.type,
				url: def.url,
				description: def.description,
				config: def.config,
				mapping: def.mapping,
				priority: def.priority,
				schedule: def.schedule,
				isActive: true
			},
			update: {
				name: def.name,
				url: def.url,
				description: def.description,
				config: def.config,
				mapping: def.mapping,
				priority: def.priority,
				schedule: def.schedule
			}
		});
	}
}

/**
 * Publish approved harvest items to the main content tables
 */
export async function publishApprovedItems(): Promise<{ published: number; errors: string[] }> {
	const approved = await db.harvestItem.findMany({
		where: {
			status: 'APPROVED',
			projectId: null, // Not yet published
			articleId: null
		},
		include: { source: true }
	});

	let published = 0;
	const errors: string[] = [];

	for (const item of approved) {
		try {
			if (item.contentType === 'PROJECT') {
				const normalized = item.normalized as unknown as NormalizedProject;
				if (!normalized) continue;

				// Get or create a system user for harvested content
				const systemUser = await getOrCreateSystemUser();

				// Create the project
				const project = await db.project.create({
					data: {
						slug: generateSlug(normalized.name),
						name: normalized.name,
						tagline: normalized.tagline,
						description: normalized.description,
						website: normalized.website,
						location: normalized.location,
						coordinates: normalized.coordinates,
						coverImage: normalized.coverImage,
						logo: normalized.logo,
						status: 'PUBLISHED',
						submittedById: systemUser.id
					}
				});

				// Link categories
				if (normalized.categories?.length) {
					for (const catSlug of normalized.categories) {
						const category = await db.category.findUnique({ where: { slug: catSlug } });
						if (category) {
							await db.projectCategory.create({
								data: { projectId: project.id, categoryId: category.id }
							});
						}
					}
				}

				// Link SDGs
				if (normalized.sdgs?.length) {
					for (const sdgNum of normalized.sdgs) {
						await db.projectSDG.create({
							data: { projectId: project.id, sdgId: sdgNum }
						}).catch(() => {
							// SDG might not exist
						});
					}
				}

				// Update harvest item
				await db.harvestItem.update({
					where: { id: item.id },
					data: { projectId: project.id, status: 'PUBLISHED' }
				});

				published++;
			}
			// TODO: Handle ARTICLE content type
		} catch (error) {
			errors.push(
				`Item ${item.id}: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	return { published, errors };
}

/**
 * Get or create a system user for harvested content
 */
async function getOrCreateSystemUser() {
	const email = 'system@solarpunkalmanac.org';

	let user = await db.user.findUnique({ where: { email } });

	if (!user) {
		user = await db.user.create({
			data: {
				email,
				name: 'Solarpunk Almanac',
				emailVerified: new Date()
			}
		});
	}

	return user;
}

/**
 * Get harvest queue statistics
 */
export async function getQueueStats() {
	const [pending, approved, rejected, published, total] = await Promise.all([
		db.harvestItem.count({ where: { status: 'PENDING' } }),
		db.harvestItem.count({ where: { status: 'APPROVED' } }),
		db.harvestItem.count({ where: { status: 'REJECTED' } }),
		db.harvestItem.count({ where: { status: 'PUBLISHED' } }),
		db.harvestItem.count()
	]);

	const bySource = await db.harvestItem.groupBy({
		by: ['sourceId', 'status'],
		_count: true
	});

	const sources = await db.harvestSource.findMany({
		select: { id: true, name: true, slug: true, lastHarvest: true }
	});

	return {
		totals: { pending, approved, rejected, published, total },
		bySource: sources.map((s: { id: string; name: string; slug: string; lastHarvest: Date | null }) => ({
			...s,
			counts: bySource
				.filter((b: { sourceId: string; status: string; _count: number }) => b.sourceId === s.id)
				.reduce(
					(acc: Record<string, number>, b: { status: string; _count: number }) => ({
						...acc,
						[b.status.toLowerCase()]: b._count
					}),
					{} as Record<string, number>
				)
		}))
	};
}
