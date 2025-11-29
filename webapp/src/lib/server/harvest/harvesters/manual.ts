/**
 * Manual/Import Harvester
 *
 * Processes manually curated content and bulk imports
 */

import type { HarvestResult, HarvestSourceData, NormalizedProject, FieldMapping } from '../types';
import { normalizeToProject, normalizeToArticle, generateSlug } from '../normalize';
import { scoreProject, scoreArticle } from '../quality';

// Curated flagship projects for initial seed
export const FLAGSHIP_PROJECTS: Partial<NormalizedProject>[] = [
	{
		name: 'Earthship Biotecture',
		tagline: 'Radically sustainable buildings made from recycled materials',
		description: `Earthship Biotecture designs and builds self-sufficient homes using recycled materials like tires, bottles, and cans. These off-grid structures provide their own heating/cooling through thermal mass, generate electricity from solar/wind, harvest rainwater, treat sewage on-site, and produce food in indoor greenhouses. Founded by architect Michael Reynolds in the 1970s, Earthships have been built in over 30 countries, proving that comfortable modern living can coexist with zero environmental impact.`,
		website: 'https://earthshipglobal.com',
		location: 'Taos, New Mexico, USA',
		coordinates: { lat: 36.4072, lng: -105.5731 },
		coverImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
		categories: ['housing', 'education'],
		sdgs: [4, 7, 11, 12, 13],
		tags: ['earthship', 'sustainable-building', 'off-grid', 'recycled-materials']
	},
	{
		name: 'Transition Town Totnes',
		tagline: 'The birthplace of the global Transition movement',
		description: `Transition Town Totnes (TTT) was the first Transition initiative, founded in 2006 by Rob Hopkins. This Devon market town became a living laboratory for community-led responses to climate change and resource depletion. TTT pioneered local currency (Totnes Pound), community energy projects, local food networks, and skill-sharing programs. Their model has inspired over 1,000 Transition initiatives worldwide, proving that grassroots community action can create meaningful change.`,
		website: 'https://www.transitiontowntotnes.org',
		location: 'Totnes, Devon, UK',
		coordinates: { lat: 50.4319, lng: -3.6849 },
		categories: ['community', 'food', 'energy'],
		sdgs: [2, 7, 11, 12, 13, 17],
		tags: ['transition-town', 'community-resilience', 'local-economy']
	},
	{
		name: 'Findhorn Ecovillage',
		tagline: "One of the world's largest intentional communities and a UN-recognized NGO",
		description: `Founded in 1962 in Scotland, Findhorn has grown from a caravan park into one of the most established ecovillages in the world. Home to 400+ residents, it features ecological housing, a wind park, biological sewage treatment, local food production, and education programs that have trained thousands in sustainable living. Findhorn's ecological footprint is half the UK average, demonstrating that community-scale sustainability is achievable.`,
		website: 'https://www.findhorn.org',
		location: 'Moray, Scotland, UK',
		coordinates: { lat: 57.6571, lng: -3.6061 },
		coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
		categories: ['community', 'housing', 'education'],
		sdgs: [4, 7, 11, 12, 13, 17],
		tags: ['ecovillage', 'intentional-community', 'sustainability-education']
	},
	{
		name: 'Open Source Ecology',
		tagline: 'Building the Global Village Construction Set',
		description: `Open Source Ecology (OSE) is developing the Global Village Construction Set — 50 industrial machines that can be used to build a small, sustainable civilization with modern comforts. All designs are open-source, allowing anyone to build them from locally available materials. Their tractors, brick presses, and solar concentrators cost a fraction of commercial equivalents. OSE demonstrates how open-source principles can democratize access to essential technology.`,
		website: 'https://www.opensourceecology.org',
		location: 'Missouri, USA',
		coordinates: { lat: 38.7595, lng: -93.7360 },
		categories: ['tech', 'community'],
		sdgs: [8, 9, 12, 17],
		tags: ['open-source', 'appropriate-technology', 'maker', 'fabrication']
	},
	{
		name: 'Incredible Edible Todmorden',
		tagline: 'Growing food on every available public space',
		description: `What started in 2008 as a few residents planting vegetables on neglected public land in Todmorden, UK, has become a global movement. Incredible Edible transformed this former mill town by planting food everywhere — outside the police station, the health center, along the canal. The initiative has inspired 100+ groups worldwide, proving that "propaganda gardening" can transform communities, reduce food miles, and reconnect people with where their food comes from.`,
		website: 'https://www.incredible-edible-todmorden.co.uk',
		location: 'Todmorden, West Yorkshire, UK',
		coordinates: { lat: 53.7140, lng: -2.0974 },
		categories: ['food', 'community'],
		sdgs: [2, 3, 11, 12, 15],
		tags: ['urban-agriculture', 'community-garden', 'food-sovereignty']
	},
	{
		name: 'Precious Plastic',
		tagline: 'Open-source machines and knowledge to recycle plastic locally',
		description: `Precious Plastic provides blueprints for building plastic recycling machines from locally available materials, plus business models and community support. Started by Dave Hakkens in 2013, it has grown into a global network of 40,000+ members running local recycling workspaces. Their machines shred, extrude, inject, and compress plastic waste into new products. By decentralizing recycling, Precious Plastic proves that communities can solve the plastic crisis themselves.`,
		website: 'https://preciousplastic.com',
		location: 'Global (originated Netherlands)',
		categories: ['tech', 'community'],
		sdgs: [9, 12, 14, 17],
		tags: ['recycling', 'circular-economy', 'open-source', 'maker']
	},
	{
		name: 'Solar Foods',
		tagline: 'Making protein from air, water, and electricity',
		description: `Solar Foods has developed Solein, a protein produced from CO2, water, and renewable electricity using a fermentation process. This revolutionary technology could produce food without agriculture, dramatically reducing land use, water consumption, and emissions. A single factory the size of a few city blocks could produce as much protein as a farm the size of New York. Solar Foods represents the cutting edge of sustainable food technology.`,
		website: 'https://solarfoods.com',
		location: 'Helsinki, Finland',
		coordinates: { lat: 60.1699, lng: 24.9384 },
		categories: ['food', 'tech'],
		sdgs: [2, 7, 12, 13],
		tags: ['food-tech', 'alternative-protein', 'clean-energy']
	},
	{
		name: 'Repair Café International',
		tagline: 'Free meeting places to repair things together',
		description: `Repair Café started in Amsterdam in 2009 and has grown to 2,500+ locations in 35 countries. These community events bring together volunteer repair experts and people with broken items. Visitors bring lamps, toasters, bicycles, toys, and clothes to fix together, keeping items out of landfills and preserving repair skills. Each café prevents hundreds of kilos of waste annually while building community connections.`,
		website: 'https://repaircafe.org',
		location: 'Global (originated Amsterdam, Netherlands)',
		categories: ['community', 'tech'],
		sdgs: [4, 12, 13, 17],
		tags: ['repair', 'circular-economy', 'right-to-repair', 'skill-sharing']
	},
	{
		name: 'Auroville',
		tagline: 'The city the Earth needs',
		description: `Founded in 1968 in southern India, Auroville is an experimental township dedicated to human unity and sustainable living. Home to 3,000 residents from 60+ countries, Auroville has transformed 3,000 acres of barren land into thriving forest, developed sustainable architecture and renewable energy systems, and pioneered alternative education. UNESCO recognizes Auroville as an important ongoing experiment in international living.`,
		website: 'https://auroville.org',
		location: 'Tamil Nadu, India',
		coordinates: { lat: 12.0071, lng: 79.8078 },
		coverImage: 'https://images.unsplash.com/photo-1590577512604-e92ce26a3cb4?w=800',
		categories: ['community', 'housing', 'education'],
		sdgs: [4, 7, 11, 15, 16, 17],
		tags: ['intentional-community', 'reforestation', 'alternative-education']
	},
	{
		name: 'Low-Tech Lab',
		tagline: 'Documenting and sharing low-tech solutions for a sustainable lifestyle',
		description: `Low-Tech Lab is a French organization that documents and openly shares low-tech solutions — technologies that are useful, durable, accessible, and made from local materials. Their projects include solar cookers, biogas digesters, water filters, and more. Through expeditions, workshops, and an online encyclopedia, they prove that meaningful technology doesn't require high-tech — it requires appropriate tech.`,
		website: 'https://lowtechlab.org/en',
		location: 'Concarneau, France',
		coordinates: { lat: 47.8743, lng: -3.9187 },
		categories: ['tech', 'education'],
		sdgs: [4, 6, 7, 12, 17],
		tags: ['low-tech', 'appropriate-technology', 'open-source', 'diy']
	}
];

/**
 * Harvest from manual/curated sources
 */
export async function* harvestManual(source: HarvestSourceData): AsyncGenerator<HarvestResult> {
	if (source.slug === 'curated-flagship') {
		// Yield flagship projects
		for (const project of FLAGSHIP_PROJECTS) {
			const normalized: NormalizedProject = {
				name: project.name || '',
				tagline: project.tagline || '',
				description: project.description || '',
				website: project.website,
				location: project.location,
				coordinates: project.coordinates,
				coverImage: project.coverImage,
				categories: project.categories || [],
				sdgs: project.sdgs || [],
				tags: project.tags || []
			};

			const quality = scoreProject(normalized);

			yield {
				externalId: generateSlug(normalized.name),
				externalUrl: normalized.website,
				rawData: project,
				normalized,
				contentType: 'PROJECT',
				quality
			};
		}
	}
}

/**
 * Import projects from a JSON array
 */
export async function* importProjects(
	source: HarvestSourceData,
	data: unknown[]
): AsyncGenerator<HarvestResult> {
	const mapping = (source.mapping as FieldMapping) || {};

	for (const item of data) {
		if (!item || typeof item !== 'object') continue;

		const record = item as Record<string, unknown>;
		const normalized = normalizeToProject(record, mapping);

		if (!normalized) continue;

		const externalId =
			(record.id as string) ||
			(record.slug as string) ||
			generateSlug(normalized.name);

		const quality = scoreProject(normalized);

		yield {
			externalId,
			externalUrl: normalized.website,
			rawData: item,
			normalized,
			contentType: 'PROJECT',
			quality
		};
	}
}

/**
 * Import articles from a JSON array
 */
export async function* importArticles(
	source: HarvestSourceData,
	data: unknown[]
): AsyncGenerator<HarvestResult> {
	const mapping = (source.mapping as FieldMapping) || {};

	for (const item of data) {
		if (!item || typeof item !== 'object') continue;

		const record = item as Record<string, unknown>;
		const normalized = normalizeToArticle(record, mapping);

		if (!normalized) continue;

		const externalId =
			(record.id as string) ||
			(record.slug as string) ||
			generateSlug(normalized.title);

		const quality = scoreArticle(normalized);

		yield {
			externalId,
			externalUrl: normalized.sourceUrl,
			rawData: item,
			normalized,
			contentType: 'ARTICLE',
			quality
		};
	}
}
