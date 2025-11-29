/**
 * Database Seed Script
 *
 * Populates the database with initial data:
 * - Categories
 * - SDGs (Sustainable Development Goals)
 * - Sample projects
 * - Sample edition with articles
 *
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seeding database...');

	// ============================================
	// CATEGORIES
	// ============================================
	console.log('Creating categories...');

	const categories = await Promise.all([
		prisma.category.upsert({
			where: { slug: 'energy' },
			update: {},
			create: {
				slug: 'energy',
				name: 'Energy',
				description: 'Solar, wind, and renewable energy projects',
				icon: '⚡',
				color: '#F4A020'
			}
		}),
		prisma.category.upsert({
			where: { slug: 'food' },
			update: {},
			create: {
				slug: 'food',
				name: 'Food & Agriculture',
				description: 'Urban farming, permaculture, and food systems',
				icon: '🌾',
				color: '#4CAF50'
			}
		}),
		prisma.category.upsert({
			where: { slug: 'housing' },
			update: {},
			create: {
				slug: 'housing',
				name: 'Housing',
				description: 'Sustainable building, ecovillages, and housing co-ops',
				icon: '🏠',
				color: '#8D6E63'
			}
		}),
		prisma.category.upsert({
			where: { slug: 'transport' },
			update: {},
			create: {
				slug: 'transport',
				name: 'Transport',
				description: 'Bikes, EVs, public transit, and mobility solutions',
				icon: '🚲',
				color: '#2196F3'
			}
		}),
		prisma.category.upsert({
			where: { slug: 'community' },
			update: {},
			create: {
				slug: 'community',
				name: 'Community',
				description: 'Mutual aid, co-ops, and community organizing',
				icon: '🤝',
				color: '#9C27B0'
			}
		}),
		prisma.category.upsert({
			where: { slug: 'tech' },
			update: {},
			create: {
				slug: 'tech',
				name: 'Technology',
				description: 'Open source, right to repair, and appropriate tech',
				icon: '💻',
				color: '#607D8B'
			}
		}),
		prisma.category.upsert({
			where: { slug: 'education' },
			update: {},
			create: {
				slug: 'education',
				name: 'Education',
				description: 'Skills training, workshops, and knowledge sharing',
				icon: '📚',
				color: '#FF5722'
			}
		}),
		prisma.category.upsert({
			where: { slug: 'art' },
			update: {},
			create: {
				slug: 'art',
				name: 'Art & Culture',
				description: 'Solarpunk art, music, and cultural projects',
				icon: '🎨',
				color: '#E91E63'
			}
		})
	]);

	console.log(`Created ${categories.length} categories`);

	// ============================================
	// SDGs (Sustainable Development Goals)
	// ============================================
	console.log('Creating SDGs...');

	const sdgData = [
		{ id: 1, name: 'No Poverty', color: '#E5243B' },
		{ id: 2, name: 'Zero Hunger', color: '#DDA63A' },
		{ id: 3, name: 'Good Health and Well-being', color: '#4C9F38' },
		{ id: 4, name: 'Quality Education', color: '#C5192D' },
		{ id: 5, name: 'Gender Equality', color: '#FF3A21' },
		{ id: 6, name: 'Clean Water and Sanitation', color: '#26BDE2' },
		{ id: 7, name: 'Affordable and Clean Energy', color: '#FCC30B' },
		{ id: 8, name: 'Decent Work and Economic Growth', color: '#A21942' },
		{ id: 9, name: 'Industry, Innovation and Infrastructure', color: '#FD6925' },
		{ id: 10, name: 'Reduced Inequalities', color: '#DD1367' },
		{ id: 11, name: 'Sustainable Cities and Communities', color: '#FD9D24' },
		{ id: 12, name: 'Responsible Consumption and Production', color: '#BF8B2E' },
		{ id: 13, name: 'Climate Action', color: '#3F7E44' },
		{ id: 14, name: 'Life Below Water', color: '#0A97D9' },
		{ id: 15, name: 'Life on Land', color: '#56C02B' },
		{ id: 16, name: 'Peace, Justice and Strong Institutions', color: '#00689D' },
		{ id: 17, name: 'Partnerships for the Goals', color: '#19486A' }
	];

	for (const sdg of sdgData) {
		await prisma.sDG.upsert({
			where: { id: sdg.id },
			update: {},
			create: sdg
		});
	}

	console.log(`Created ${sdgData.length} SDGs`);

	// ============================================
	// SAMPLE USER (for project submissions)
	// ============================================
	console.log('Creating sample user...');

	const sampleUser = await prisma.user.upsert({
		where: { email: 'demo@almanac.solar' },
		update: {},
		create: {
			email: 'demo@almanac.solar',
			name: 'Almanac Team',
			bio: 'The Solarpunk Almanac editorial team',
			emailVerified: new Date()
		}
	});

	// ============================================
	// SAMPLE PROJECTS
	// ============================================
	console.log('Creating sample projects...');

	const projectsData = [
		{
			slug: 'solar-village-collective',
			name: 'Solar Village Collective',
			tagline: 'Community-owned solar microgrids powering rural villages across Southeast Asia.',
			description: `Solar Village Collective is a grassroots organization bringing renewable energy to off-grid communities in Thailand, Cambodia, and Vietnam. Founded in 2019, we've installed over 200 solar microgrids serving more than 5,000 households.

Our model is simple: communities own the infrastructure. We provide technical training, initial funding, and ongoing support while local cooperatives manage operations. This ensures long-term sustainability and keeps economic benefits within the community.

Each installation includes:
- Solar panels sized to community needs
- Battery storage for 24-hour power
- Smart meters for fair usage billing
- Training for local technicians

We're proving that clean energy access doesn't require waiting for grid expansion or corporate investment. Communities can power their own futures.`,
			website: 'https://solarvillage.example.org',
			location: 'Thailand',
			coverImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
			featured: true,
			status: 'PUBLISHED',
			categorySlug: 'energy',
			sdgIds: [7, 11, 13, 1]
		},
		{
			slug: 'urban-food-forest-network',
			name: 'Urban Food Forest Network',
			tagline: 'Transforming vacant city lots into productive food forests for neighborhood food security.',
			description: `The Urban Food Forest Network converts abandoned urban land into thriving food forests that provide free produce to local residents while rebuilding soil health and urban biodiversity.

Since 2018, we've established 15 food forests across Detroit, producing over 50,000 pounds of fresh fruit, nuts, and vegetables annually. Each site is designed using permaculture principles with seven layers of productive plants from canopy trees to ground cover.

Key features:
- Perennial food production requiring minimal maintenance
- Free harvesting for community members
- Educational programs in urban agriculture
- Habitat for pollinators and urban wildlife
- Stormwater management and cooling

Our food forests demonstrate that cities can be productive landscapes, not just consumers of resources shipped from far away.`,
			website: 'https://urbanfoodforest.example.org',
			location: 'Detroit, USA',
			coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
			featured: true,
			status: 'PUBLISHED',
			categorySlug: 'food',
			sdgIds: [2, 11, 15, 3]
		},
		{
			slug: 'repair-cafe-international',
			name: 'Repair Café International',
			tagline: 'Global network of community repair events fighting planned obsolescence.',
			description: `Repair Café International coordinates over 2,500 repair events worldwide where volunteer fixers help community members repair broken items for free—from electronics to clothing to furniture.

Founded in Amsterdam in 2009, the movement has spread to 35 countries. Each café brings together skilled volunteers, tools, and spare parts to give broken items a second life. We estimate our network has prevented over 500,000 kg of waste from reaching landfills.

What happens at a Repair Café:
- Bring your broken item and work alongside a skilled volunteer
- Learn basic repair skills you can use at home
- Enjoy coffee and community while waiting
- Take home a working item (90% success rate)

More than repair: we're rebuilding the culture of fixing things, challenging throwaway consumerism, and creating spaces where skills are shared across generations.`,
			website: 'https://repaircafe.example.org',
			location: 'Global',
			featured: false,
			status: 'PUBLISHED',
			categorySlug: 'community',
			sdgIds: [12, 13, 17, 8]
		},
		{
			slug: 'earthship-academy',
			name: 'Earthship Academy',
			tagline: 'Teaching sustainable building techniques using recycled materials and passive solar design.',
			description: `Earthship Academy offers hands-on training in building radically sustainable homes that heat and cool themselves, harvest their own water, and produce food year-round.

Based on 50 years of Earthship development, our courses teach participants to build homes from recycled tires, bottles, and cans combined with earth. These "garbage warriors" learn systems for:
- Passive solar heating and cooling
- Rainwater harvesting and treatment
- Greywater recycling through indoor planters
- Solar and wind electricity
- Indoor food production

Graduates have built over 3,000 Earthships worldwide in climates from New Mexico deserts to Canadian winters. Our buildings demonstrate that comfortable, modern living is possible with minimal external inputs.`,
			website: 'https://earthship.example.org',
			location: 'New Mexico, USA',
			coverImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
			featured: false,
			status: 'PUBLISHED',
			categorySlug: 'housing',
			sdgIds: [4, 11, 12, 13, 6]
		},
		{
			slug: 'cargo-bike-coop',
			name: 'Cargo Bike Cooperative',
			tagline: 'Worker-owned last-mile delivery service using electric cargo bikes.',
			description: `Cargo Bike Cooperative is a worker-owned delivery service proving that sustainable logistics can be both profitable and fair to workers. Our fleet of 50 electric cargo bikes handles last-mile delivery for businesses across Amsterdam.

Unlike gig economy platforms, our riders are co-owners with living wages, benefits, and democratic workplace control. We've delivered over 500,000 packages since 2020 while eliminating delivery van emissions from partner routes.

Why cargo bikes work:
- Faster than vans in urban traffic
- No parking hassles or fuel costs
- Zero emissions at point of use
- Riders get exercise and fair pay
- Customers love the sustainability story

We're expanding the model to other European cities and open-sourcing our cooperative governance documents for others to replicate.`,
			website: 'https://cargobikecoop.example.org',
			location: 'Amsterdam, Netherlands',
			coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
			featured: false,
			status: 'PUBLISHED',
			categorySlug: 'transport',
			sdgIds: [8, 11, 13, 3]
		},
		{
			slug: 'solarpunk-art-collective',
			name: 'Solarpunk Art Collective',
			tagline: 'Artists imagining and visualizing regenerative futures through murals, installations, and digital art.',
			description: `The Solarpunk Art Collective brings together visual artists, writers, and performers creating work that envisions thriving, sustainable futures. Based in São Paulo, our members have created public art in 20 cities worldwide.

Our work challenges dystopian narratives by showing what's possible: cities where nature and technology harmonize, communities thriving through cooperation, and beautiful futures worth building. Art shapes imagination, and imagination shapes action.

Projects include:
- Large-scale murals depicting solarpunk cityscapes
- Interactive installations exploring renewable energy
- Zines and graphic novels imagining solarpunk futures
- Workshops teaching others to visualize regenerative worlds
- Annual "Futures Festival" celebrating hopeful visions

We believe the futures we imagine are the futures we create. Our art is propaganda for hope.`,
			website: 'https://solarpunkart.example.org',
			location: 'São Paulo, Brazil',
			featured: false,
			status: 'PUBLISHED',
			categorySlug: 'art',
			sdgIds: [11, 17, 4]
		}
	];

	for (const projectData of projectsData) {
		const { categorySlug, sdgIds, ...data } = projectData;

		const category = categories.find((c) => c.slug === categorySlug);
		if (!category) continue;

		const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
		if (existing) continue;

		await prisma.project.create({
			data: {
				...data,
				submittedById: sampleUser.id,
				categories: {
					create: { categoryId: category.id }
				},
				sdgs: {
					create: sdgIds.map((sdgId) => ({ sdgId }))
				}
			}
		});
	}

	console.log(`Created ${projectsData.length} projects`);

	// ============================================
	// SAMPLE EDITION
	// ============================================
	console.log('Creating sample edition...');

	const edition = await prisma.edition.upsert({
		where: { slug: 'fall-2025' },
		update: {},
		create: {
			slug: 'fall-2025',
			title: 'Harvest & Preserve',
			season: 'FALL',
			year: 2025,
			tagline: 'Abundance through community resilience',
			description:
				'This edition focuses on the abundance of fall—harvesting, preserving, and building community resilience for the seasons ahead.',
			status: 'PUBLISHED',
			publishedAt: new Date('2025-09-22')
		}
	});

	// Sample articles
	const articlesData = [
		{
			slug: 'welcome-fall-2025',
			title: 'Welcome to Fall 2025',
			subtitle: 'A season of abundance and preparation',
			excerpt:
				'As the days shorten and the harvest comes in, we turn our attention to preservation, community building, and preparing for the quieter months ahead.',
			content: '# Welcome to Fall 2025\n\nContent here...',
			author: 'Almanac Team',
			readTime: 5,
			section: 'OVERVIEW',
			order: 1
		},
		{
			slug: 'fermentation-basics',
			title: 'Fermentation Basics',
			subtitle: 'Preserve the harvest with living foods',
			excerpt:
				'Learn the ancient art of fermentation to transform seasonal abundance into year-round nutrition.',
			content: '# Fermentation Basics\n\nContent here...',
			author: 'Maya Chen',
			readTime: 12,
			section: 'GROW',
			order: 2
		},
		{
			slug: 'passive-solar-retrofit',
			title: 'Passive Solar Retrofit Guide',
			subtitle: 'Prepare your home for winter without fossil fuels',
			excerpt:
				'Simple modifications to capture and retain solar heat can dramatically reduce heating needs.',
			content: '# Passive Solar Retrofit Guide\n\nContent here...',
			author: 'Alex Rivera',
			readTime: 15,
			section: 'BUILD',
			order: 3
		}
	];

	for (const articleData of articlesData) {
		const existing = await prisma.article.findUnique({ where: { slug: articleData.slug } });
		if (existing) continue;

		await prisma.article.create({
			data: {
				...articleData,
				status: 'PUBLISHED',
				publishedAt: new Date(),
				editionId: edition.id
			}
		});
	}

	console.log(`Created edition with ${articlesData.length} articles`);

	console.log('✅ Seed completed!');
}

main()
	.catch((e) => {
		console.error('Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
