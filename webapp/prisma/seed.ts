/**
 * Database Seed Script
 *
 * Populates the database with initial data:
 * - Categories
 * - SDGs (Sustainable Development Goals)
 * - Harvest sources
 * - Flagship projects
 * - Sample edition with articles
 *
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import { ALL_SOURCES } from '../src/lib/server/harvest/sources';
import { FLAGSHIP_PROJECTS } from '../src/lib/server/harvest/harvesters/manual';

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
	// HARVEST SOURCES
	// ============================================
	console.log('Creating harvest sources...');

	for (const source of ALL_SOURCES) {
		await prisma.harvestSource.upsert({
			where: { slug: source.slug },
			update: {
				name: source.name,
				url: source.url,
				description: source.description,
				config: source.config,
				mapping: source.mapping,
				priority: source.priority,
				schedule: source.schedule
			},
			create: {
				slug: source.slug,
				name: source.name,
				type: source.type,
				url: source.url,
				description: source.description,
				config: source.config,
				mapping: source.mapping,
				priority: source.priority,
				schedule: source.schedule,
				isActive: true
			}
		});
	}

	console.log(`Created ${ALL_SOURCES.length} harvest sources`);

	// ============================================
	// SYSTEM USER (for harvested content)
	// ============================================
	console.log('Creating system user...');

	const systemUser = await prisma.user.upsert({
		where: { email: 'system@solarpunkalmanac.org' },
		update: {},
		create: {
			email: 'system@solarpunkalmanac.org',
			name: 'Solarpunk Almanac',
			bio: 'System account for harvested content',
			emailVerified: new Date()
		}
	});

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
	// FLAGSHIP PROJECTS (from curated list)
	// ============================================
	console.log('Creating flagship projects...');

	for (const project of FLAGSHIP_PROJECTS) {
		if (!project.name) continue;

		const slug = project.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		const existing = await prisma.project.findUnique({ where: { slug } });
		if (existing) continue;

		const createdProject = await prisma.project.create({
			data: {
				slug,
				name: project.name,
				tagline: project.tagline || '',
				description: project.description || '',
				website: project.website,
				location: project.location,
				coordinates: project.coordinates,
				coverImage: project.coverImage,
				status: 'PUBLISHED',
				featured: true,
				submittedById: systemUser.id
			}
		});

		// Link categories
		if (project.categories) {
			for (const catSlug of project.categories) {
				const category = await prisma.category.findUnique({ where: { slug: catSlug } });
				if (category) {
					await prisma.projectCategory.create({
						data: { projectId: createdProject.id, categoryId: category.id }
					}).catch(() => {});
				}
			}
		}

		// Link SDGs
		if (project.sdgs) {
			for (const sdgId of project.sdgs) {
				await prisma.projectSDG.create({
					data: { projectId: createdProject.id, sdgId }
				}).catch(() => {});
			}
		}

		// Create tags
		if (project.tags) {
			for (const tagName of project.tags) {
				const tag = await prisma.tag.upsert({
					where: { name: tagName },
					update: {},
					create: { name: tagName }
				});
				await prisma.projectTag.create({
					data: { projectId: createdProject.id, tagId: tag.id }
				}).catch(() => {});
			}
		}
	}

	console.log(`Created ${FLAGSHIP_PROJECTS.length} flagship projects`);

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
		where: { slug: 'winter-solstice-2025' },
		update: {},
		create: {
			slug: 'winter-solstice-2025',
			title: 'The Seed Edition',
			season: 'WINTER',
			year: 2025,
			tagline: 'The return of the light',
			description:
				'Our inaugural edition launches on the Winter Solstice—the darkest day, when the light begins its return. A fitting moment to plant seeds for regenerative futures.',
			status: 'PUBLISHED',
			publishedAt: new Date('2025-12-21')
		}
	});

	// Articles for Winter Solstice 2025 - The Seed Edition
	const articlesData = [
		{
			slug: 'the-return-of-the-light',
			title: 'The Return of the Light',
			subtitle: 'Welcome to The Solarpunk Almanac',
			excerpt:
				'On the darkest day of the year, we launch something new—a quarterly publication dedicated to the practical work of building regenerative futures.',
			content: `# The Return of the Light

Today is the Winter Solstice. The shortest day. The longest night. And from this moment forward, the light returns.

There's no better day to begin.

## Why We're Here

The Solarpunk Almanac exists because we believe the future is something we build, not something that happens to us. While mainstream culture oscillates between techno-utopianism and climate despair, a global movement is quietly doing the work: planting food forests, forming housing cooperatives, installing community solar, repairing what's broken, and reimagining what's possible.

This movement has many names. Transition Towns. Degrowth. Regenerative design. Appropriate technology. Commons-based economics. We call it solarpunk—not because the name matters, but because it captures something essential: the marriage of ecological wisdom and technological possibility, wrapped in stubborn, radical hope.

## What You'll Find Here

The Almanac is published quarterly, aligned with the solstices and equinoxes. Each edition offers:

**GROW** — Food sovereignty, from soil health to seed saving. Urban farms, food forests, and fermentation. Growing abundance in any space.

**BUILD** — Sustainable shelter and infrastructure. Passive solar, natural building, repair culture. Creating comfort with minimal footprint.

**POWER** — Energy democracy and appropriate technology. Solar, wind, micro-hydro—and the wisdom to use less.

**CONNECT** — Community resilience and mutual aid. Mapping your neighborhood, building networks, organizing for change.

**THRIVE** — Wellbeing in alignment with natural rhythms. Seasonal practices, ancestral wisdom, and modern insights for flourishing.

**CREATE** — Art, stories, and culture that imagine regenerative futures. Because we can't build what we can't envision.

**LEARN** — Skills, workshops, and resources. The ongoing education that resilient living requires.

## The Seed Edition

This inaugural issue is intentionally compact—a seed, not a harvest. We offer a foundation: an introduction to solarpunk philosophy, practical guides you can use immediately, and a preview of what's to come.

In March, with the Spring Equinox, we'll publish our first full quarterly edition. The growing season begins.

## An Invitation

The Almanac is open infrastructure. We're building in public, sharing freely, and inviting participation. Submit your project to our directory. Contribute to future editions. Start a local chapter. Use what's useful.

The work of building regenerative futures doesn't wait for permission. It's happening now, in communities around the world. The Almanac exists to connect, amplify, and support that work.

The light returns today. Let's grow something.

*— The Solarpunk Almanac Team*
*Winter Solstice, 2025*`,
			author: 'Almanac Team',
			readTime: 5,
			section: 'OVERVIEW',
			order: 1
		},
		{
			slug: 'what-is-solarpunk',
			title: 'What is Solarpunk?',
			subtitle: 'A movement for regenerative futures',
			excerpt:
				'Solarpunk is more than an aesthetic—it\'s a vision of futures where technology and nature work together, and where communities build the world they want to live in.',
			content: `# What is Solarpunk?

You might have seen the images: cities draped in vertical gardens, solar panels gleaming on every rooftop, people cycling through car-free streets lined with fruit trees. But solarpunk is more than an aesthetic. It's a movement, a philosophy, and most importantly, a practice.

## Beyond Dystopia

For decades, our visions of the future have been dominated by dystopia. Blade Runner. Mad Max. The Hunger Games. These stories serve a purpose—they warn us of paths to avoid. But somewhere along the way, we forgot to imagine where we actually want to go.

Solarpunk fills that gap. It asks: What if we got it right? What would a future look like where we solved the climate crisis, rebuilt community, and created abundance for all—not through magic or denial, but through the practical application of technology, wisdom, and cooperation?

## The Roots

Solarpunk draws from many traditions:

**Appropriate Technology**: The 1970s movement led by thinkers like E.F. Schumacher ("Small is Beautiful") that emphasized human-scale, locally-controlled technology.

**Permaculture**: Bill Mollison and David Holmgren's design science for creating human systems that work with natural patterns.

**Transition Towns**: Rob Hopkins' movement of communities proactively preparing for climate change and energy descent.

**Solarpunk Fiction**: A literary genre that emerged in the 2010s, imagining hopeful, ecological futures.

**Indigenous Wisdom**: Many solarpunk principles echo knowledge that indigenous communities have practiced for millennia.

**Open Source Culture**: The ethic of sharing knowledge, designs, and tools freely for collective benefit.

## Core Principles

### 1. Ecological Integration

Solarpunk doesn't see nature as something to conquer or even just protect—it sees human systems as part of nature. Our buildings should be ecosystems. Our cities should be habitats. Our agriculture should build soil, not deplete it.

### 2. Appropriate Technology

Technology isn't inherently good or bad—it depends on scale, ownership, and purpose. Solarpunk favors technology that:
- Is understandable and repairable by users
- Operates at human and community scales
- Uses renewable resources
- Enhances rather than replaces human capability
- Is freely shared rather than locked behind patents

### 3. Community Resilience

Resilience comes from diversity, redundancy, and strong relationships. Solarpunk communities grow their own food, generate their own power, make their own decisions—not because they're isolationist, but because local self-reliance creates genuine security.

### 4. Prefigurative Politics

Rather than waiting for revolution or policy change, solarpunks build the world they want to live in now. Every community garden is a food system prototype. Every housing cooperative is economic democracy in practice. Every repair café is resistance to throwaway culture.

### 5. Radical Hope

Not naive optimism that ignores real challenges, but the stubborn conviction that better worlds are possible—and that building them is the work that matters.

## What Solarpunk Isn't

**It's not techno-utopianism**: We can't technology our way out of every problem. Wisdom, restraint, and social change matter as much as solar panels.

**It's not primitivism**: We don't reject technology—we want to choose it consciously and deploy it appropriately.

**It's not just aesthetics**: The green-and-gold imagery is beautiful, but solarpunk without practice is just pictures.

**It's not a finished blueprint**: Solarpunk futures will be diverse, local, and emergent—not centrally planned.

## Solarpunk in Practice

What does this look like in daily life?

- Growing food, even a windowsill herb garden
- Learning repair skills; attending a Repair Café
- Joining or starting a mutual aid network
- Installing solar panels or joining community solar
- Building with natural materials
- Participating in local governance
- Sharing tools, skills, and resources
- Creating art that imagines better futures
- Teaching others what you've learned

None of these alone is solarpunk. All of them together, practiced in community with intention and hope, is the movement in action.

## Getting Started

You don't need to live in an ecovillage or go off-grid to practice solarpunk. Start where you are:

1. **Learn one practical skill** this season—fermentation, basic electrical, seed saving, anything useful.

2. **Meet your neighbors**. Resilience is relational.

3. **Join something**—a community garden, a tool library, a transition group, a housing cooperative.

4. **Consume less, repair more**. Question every purchase.

5. **Share what you learn**. Knowledge wants to be free.

The future isn't something that happens to us. It's something we make, together, starting now.

*Welcome to solarpunk.*`,
			author: 'Almanac Team',
			readTime: 10,
			section: 'LEARN',
			order: 2
		},
		{
			slug: 'passive-solar-retrofit',
			title: 'Passive Solar Retrofit Guide',
			subtitle: 'Prepare your home for winter without fossil fuels',
			excerpt:
				'Simple modifications to capture and retain solar heat can dramatically reduce heating needs.',
			content: `# Passive Solar Retrofit Guide

Most existing buildings were designed assuming cheap, abundant fossil fuels for heating. But with basic understanding of heat flow and some strategic modifications, you can dramatically reduce energy needs—often without major construction.

## Understanding Heat Flow

Heat moves in three ways:

1. **Conduction**: Heat traveling through materials (like through a cold window)
2. **Convection**: Heat carried by moving air (drafts, ventilation)
3. **Radiation**: Heat traveling as infrared light (sunlight through windows, radiators)

Effective passive solar design manages all three.

## The Basics: Stop Heat Loss First

Before adding solar gain, reduce heat loss. It's almost always more cost-effective.

### Air Sealing (Convection)

**Priority areas:**
- Windows and doors (weatherstripping)
- Electrical outlets on exterior walls
- Where walls meet floors and ceilings
- Plumbing and wiring penetrations
- Fireplace dampers

**Simple test**: On a windy day, hold a lit incense stick near suspected leaks. Watch the smoke for air movement.

### Insulation (Conduction)

**Priority order:**
1. Attic/roof (heat rises, biggest impact)
2. Basement/crawlspace
3. Walls (harder to address in existing buildings)

**Easy wins:**
- Add loose-fill insulation to attic
- Insulate hot water pipes
- Add door draft stoppers
- Use thermal curtains

### Windows (All Three)

Windows are thermal holes in your walls. Options:

- **Repair/weatherstrip** existing windows
- **Add interior storm windows** (DIY-friendly)
- **Install insulating window quilts** for nighttime
- **Replace with high-performance glazing** (expensive but effective)

## Adding Solar Gain

Once you've reduced heat loss, add controlled solar heating.

### South-Facing Windows

In the Northern Hemisphere, south-facing windows receive the most winter sun while being easier to shade in summer.

**Optimize existing windows:**
- Remove obstacles blocking winter sun
- Trim deciduous trees/shrubs to allow winter light (they'll shade in summer)
- Keep windows clean
- Open curtains during sunny hours

**Add window area:**
- Enlarge south windows (major renovation)
- Add a sun-space or enclosed porch

### Thermal Mass

Mass absorbs heat during the day and releases it at night, smoothing temperature swings.

**Effective mass materials:**
- Water (highest heat capacity)
- Concrete/stone/tile
- Brick
- Earth (rammed earth, adobe)

**Simple additions:**
- Water containers in sunny areas (painted dark colors)
- Tile or stone flooring in sunny zones
- Masonry or stone on interior walls receiving sun

### Trombe Walls

A Trombe wall is a south-facing masonry wall with glazing in front of it. Sun heats the wall, which radiates heat to the interior.

**DIY version:**
- Build a simple glazed frame against a south-facing masonry wall
- Include vents at top and bottom for convection
- Close vents at night to retain heat

## Zoning and Behavior

Design and behavior changes are free:

- **Close off unused rooms** in winter
- **Live in the sunny part** of your home during the day
- **Sleep in the warmest room** (heat rises—consider upper floors)
- **Use thermal curtains** and open/close them with the sun
- **Dress warmly** and lower thermostat
- **Gather people and animals** (each human outputs ~100W of heat)

## Measuring Success

**Track your progress:**
- Monitor energy bills month-to-month and year-to-year
- Use a thermometer to track indoor temperatures
- Note comfort levels at different thermostat settings

## Getting Started

1. **Audit your current situation**: Where are the drafts? Which rooms are coldest? Where does the sun reach?

2. **Start with air sealing**: Biggest bang for buck, requires minimal investment.

3. **Add thermal mass to sunny areas**: Even a few water jugs can help.

4. **Improve window performance**: Weatherstrip, add inserts, use thermal curtains.

5. **Track results**: Measure before and after.

Each improvement builds on the last. Over time, your home becomes more comfortable while requiring less heating energy. That's the solarpunk approach: not just surviving winter, but thriving in it.`,
			author: 'Alex Rivera',
			readTime: 15,
			section: 'BUILD',
			order: 3
		},
		{
			slug: 'community-resilience-mapping',
			title: 'Mapping Community Resilience',
			subtitle: 'Know your neighbors before you need them',
			excerpt:
				'Building social infrastructure is the foundation of community resilience. Start by understanding what resources and skills already exist in your neighborhood.',
			content: `# Mapping Community Resilience

The most resilient communities aren't those with the most supplies or the fanciest technology. They're the ones where people know each other, trust each other, and have practiced working together before crisis hits.

## Why Mapping Matters

Every community has hidden assets—skills, tools, knowledge, and relationships that become visible only when you look for them. Asset mapping reveals:

- Who knows how to fix things?
- Who has tools they'd share?
- Who has medical training?
- Who has extra garden space?
- Who checks on elderly neighbors?
- Who has experience with emergencies?

This knowledge, documented and shared, becomes infrastructure as real as any physical system.

## The Mapping Process

### 1. Define Your Community

Start with a manageable geographic area:
- A single block or apartment building
- A few surrounding streets
- A neighborhood with clear boundaries

Smaller is better for starting. You can always expand.

### 2. Gather Initial Data

**Walk the neighborhood:**
- Note businesses, institutions, gathering places
- Observe who's around at different times
- Identify visible resources (gardens, solar panels, workshops)

**Check existing records:**
- Neighborhood associations
- Community groups
- Local directories
- Social media groups

### 3. Connect with People

The heart of mapping is conversation. Methods:

**Door-knocking**: Simple and direct. "Hi, I'm [name], I live at [address]. I'm trying to get to know neighbors better and understand what skills and resources we have in our community. Would you have a few minutes to chat?"

**Community events**: Host a potluck, block party, or skills-share. Combine socializing with light information gathering.

**Surveys**: Physical or digital, distributed through existing channels. Keep them short and respect privacy.

### 4. What to Map

**People assets:**
- Professional skills (medical, construction, teaching)
- Practical skills (gardening, repair, cooking)
- Languages spoken
- Willingness to help in emergencies
- Vulnerabilities (mobility, medical needs)

**Physical assets:**
- Tools and equipment
- Space (for meetings, storage, gardens)
- Vehicles
- Water sources
- Energy systems

**Organizational assets:**
- Churches/temples/mosques
- Schools
- Businesses
- Clubs and groups

**Relationship assets:**
- Who knows whom?
- What connections exist to outside resources?
- Who has influence or organizing experience?

### 5. Store and Share Information

Create systems that:
- Are accessible when power is out (paper backup)
- Respect privacy (get consent for what's shared)
- Stay updated (assign someone to maintain)
- Are actionable (organized for quick reference)

**Simple format:**
- A neighborhood directory with skills/resources
- A physical map with key locations marked
- A list of who to contact for specific needs

### 6. Build on What You Find

Mapping is just the beginning. Use findings to:

- Form neighborhood response teams
- Organize skill-sharing events
- Create mutual aid networks
- Identify gaps and work to fill them
- Connect isolated neighbors with community

## Privacy and Trust

**Be transparent** about why you're collecting information and how it will be used.

**Get consent** before including anyone in shared documents.

**Start with relationships**, not data collection. People share with those they trust.

**Protect sensitive information**. Some details (medical conditions, vulnerabilities) should be held by trusted coordinators, not published broadly.

## Start Small, Build Relationships

Don't try to map everything at once. Start with your immediate neighbors. Build real relationships before asking for detailed information. Let the mapping process itself become a relationship-building activity.

The goal isn't a perfect database. It's a community that knows itself—people who will look out for each other because they actually know each other.

That social infrastructure, more than any physical preparation, is what gets communities through hard times.`,
			author: 'Jordan Williams',
			readTime: 14,
			section: 'CONNECT',
			order: 4
		},
		{
			slug: 'seasonal-wellness-rituals',
			title: 'Seasonal Wellness Rituals',
			subtitle: 'Thriving through the darkening days',
			excerpt:
				'As daylight shortens, intentional practices can help maintain energy, mood, and connection through the fall and winter months.',
			content: `# Seasonal Wellness Rituals

The transition from long summer days to shorter fall and winter ones affects us more than we often acknowledge. Reduced daylight impacts circadian rhythms, energy levels, and mood. Rather than fighting this change, we can work with it—honoring the season's invitation to slow down while maintaining wellbeing.

## Understanding Seasonal Changes

**Light affects everything:**
- Melatonin production (sleep hormone) increases with darkness
- Serotonin production (mood regulator) decreases with less light
- Circadian rhythms shift, affecting sleep and energy patterns
- Vitamin D synthesis drops without sun exposure

These are natural responses to environmental change, not disorders to be cured. But in a world designed around year-round productivity, they can feel like problems.

## Morning Light Rituals

Light exposure in the first hour after waking has powerful effects on circadian regulation and mood.

**Practices:**
- Get outside within an hour of waking, even briefly
- If going out isn't possible, sit near the brightest window
- Consider a light therapy lamp (10,000 lux, 20-30 minutes)
- Eat breakfast in the brightest part of your home

**Why it works:** Morning light suppresses melatonin, signals alertness, and anchors your circadian rhythm for the day.

## Movement and Body Practices

When it's cold and dark outside, motivation to move decreases. But movement is crucial for energy and mood.

**Indoor options:**
- Yoga (particularly warming practices like vinyasa)
- Bodyweight exercises
- Dancing to favorite music
- Stretching while watching something
- Indoor cycling or rowing

**Bundled outdoor options:**
- Brisk walks (even 15 minutes helps)
- Cold-weather gardening and yard work
- Outdoor games and activities with others

**Key insight:** Some movement is infinitely better than no movement. Don't let perfect be the enemy of good.

## Nourishment Practices

What we eat affects energy, mood, and immune function—especially important in cold and flu season.

**Seasonal eating:**
- Root vegetables, squash, and hearty greens
- Warming spices (ginger, turmeric, cinnamon)
- Fermented foods (see our fermentation article)
- Bone broths and soups
- Mushrooms for immune support

**Mindful eating:**
- Eat meals at regular times
- Take time to sit and enjoy food
- Share meals with others when possible

## Evening Wind-Down

Natural darkness signals rest. Work with it rather than against it.

**Practices:**
- Dim lights in the evening (or use warm-toned bulbs)
- Reduce screen time, especially blue light, after sunset
- Create a consistent bedtime routine
- Accept earlier bedtimes as seasonal, not lazy

**Tech adjustments:**
- Enable night mode on devices
- Consider blue-light blocking glasses
- Keep bedroom as dark as possible

## Connection Rituals

Isolation worsens seasonal challenges. Intentionally maintain connection.

**Ideas:**
- Regular check-ins with friends (calls, video chats)
- Neighborhood gatherings and potlucks
- Join or start a winter activity group
- Volunteer with organizations serving others

## Creative and Reflective Practices

Darkness invites introspection. Embrace it.

**Options:**
- Journaling and reflection
- Reading (physical books, not screens)
- Crafts and hands-on projects
- Learning new skills during indoor time
- Art and creative expression

## Honoring the Season

The modern expectation of constant productivity regardless of season is relatively new—and arguably harmful. Most traditional cultures had built-in winter slowdowns: shorter work days, more rest, more celebration.

Consider that perhaps:
- Sleeping more in winter is natural, not lazy
- Wanting to stay home is self-protective, not antisocial
- Feeling reflective is healthy, not depressive
- Needing more warmth and comfort is human, not weak

## When to Seek Help

Seasonal changes are normal. But significant depression, anxiety, or inability to function warrant professional attention. If symptoms are severe or interfering with life, please consult a healthcare provider.

## Starting Small

Don't try to overhaul everything at once. Pick one practice that resonates. Try it for a week. Notice how you feel. Add another practice if helpful.

The goal isn't to conquer winter but to move through it with intention, maintaining wellbeing while honoring the season's gifts: rest, reflection, and preparation for the light's return.`,
			author: 'Dr. Kenji Tanaka',
			readTime: 11,
			section: 'THRIVE',
			order: 5
		},
		{
			slug: 'biophilic-design-guide',
			title: 'Biophilic Design for Your Home',
			subtitle: 'Bringing nature indoors for health and harmony',
			excerpt:
				'Biophilic design integrates natural elements into built environments, improving wellbeing, air quality, and our connection to the living world.',
			content: `# Biophilic Design for Your Home

We evolved surrounded by nature—forests, rivers, open skies. Our bodies and minds are calibrated for natural environments. Yet most of us spend 90% of our time indoors, in spaces designed for efficiency rather than human flourishing.

Biophilic design bridges this gap, intentionally integrating natural elements into buildings to support health, productivity, and wellbeing. The science is clear: spaces with biophilic elements reduce stress, improve cognitive function, accelerate healing, and increase happiness.

## The Science of Biophilia

"Biophilia" means love of life. The biophilia hypothesis, developed by biologist E.O. Wilson, suggests humans have an innate need to connect with other living things—a need shaped by millions of years of evolution.

**Research shows biophilic design:**
- Reduces cortisol (stress hormone) levels by up to 15%
- Improves cognitive performance by 6-12%
- Speeds hospital patient recovery by 8-10%
- Increases workplace productivity and satisfaction
- Lowers blood pressure and heart rate
- Improves air quality and humidity

These aren't aesthetic preferences—they're physiological responses embedded in our biology.

## The 14 Patterns of Biophilic Design

Researchers have identified 14 patterns that create meaningful nature connections. Here's how to apply them at home:

### Direct Nature Connection

**1. Visual Connection with Nature**
Having plants, water, or animals visible from regular living spaces.

*Practical applications:*
- Position seating to face windows with outdoor views
- Create indoor gardens or plant collections in living areas
- Add an aquarium or indoor pond
- Install a bird feeder visible from commonly used rooms

**2. Non-Visual Connection with Nature**
Sounds, smells, textures, and tastes that remind us of nature.

*Practical applications:*
- Open windows for natural sounds and airflow
- Use natural scents (real flowers, herbs, essential oils)
- Incorporate textures like stone, wood, wool, linen
- Grow herbs and edibles for the taste connection

**3. Non-Rhythmic Sensory Stimuli**
Random, unpredictable natural movements that briefly capture attention.

*Practical applications:*
- Wind-responsive elements (mobiles, curtains, plants)
- Moving water features
- Visible flames (fireplace, candles)
- Windows overlooking active outdoor areas

**4. Thermal and Airflow Variability**
Subtle changes in temperature and air movement mimicking outdoor conditions.

*Practical applications:*
- Open windows strategically for cross-ventilation
- Allow some seasonal temperature variation
- Use ceiling fans for gentle air movement
- Create microclimates (cooler sleeping areas, warmer gathering spaces)

**5. Presence of Water**
Visual, auditory, or tactile water experiences.

*Practical applications:*
- Small fountains or water features
- Aquariums or indoor ponds
- Rain chains visible from windows
- Shower/bath design emphasizing water experience

**6. Dynamic and Diffuse Light**
Varying light intensities and patterns that change with time and weather.

*Practical applications:*
- Maximize natural daylight
- Use sheer curtains for diffused light
- Create dappled light with plants or screens
- Install skylights or light tubes
- Allow light to move through spaces during the day

**7. Connection with Natural Systems**
Awareness of seasonal, ecological, and natural processes.

*Practical applications:*
- Views of weather, seasons, and time of day
- Visible food growing (windowsill herbs, sprouts)
- Composting systems
- Rain collection visible from inside
- Clocks and calendars emphasizing natural cycles

### Indirect Nature Connection

**8. Biomorphic Forms and Patterns**
Shapes and patterns found in nature, incorporated into design.

*Practical applications:*
- Organic-shaped furniture and objects
- Patterns inspired by leaves, shells, fractals
- Curved rather than angular forms
- Textiles with botanical or natural patterns

**9. Material Connection with Nature**
Natural materials that reflect local ecology and geology.

*Practical applications:*
- Exposed wood (structural or decorative)
- Stone and tile from natural sources
- Natural fiber textiles (wool, cotton, linen, hemp)
- Clay, ceramics, and earthen elements
- Leather and other animal-derived materials (ethically sourced)

**10. Complexity and Order**
Rich sensory information organized in a coherent spatial pattern.

*Practical applications:*
- Collections displayed with visual rhythm
- Layered textures and materials with unifying theme
- Details that reward closer inspection
- Balance of variety and coherence

### Space Configuration

**11. Prospect**
Unimpeded views over distance for surveillance and planning.

*Practical applications:*
- Windows with distant views
- Open floor plans with sight lines
- Elevated seating areas
- Balconies and upper floors

**12. Refuge**
Protective, enclosed spaces for rest and withdrawal.

*Practical applications:*
- Reading nooks and window seats
- Canopy beds or alcoves
- Lowered ceilings in intimate areas
- Cozy corners with overhead shelter

**13. Mystery**
Promise of more information, drawing us further in.

*Practical applications:*
- Partially obscured views that invite exploration
- Curved pathways that don't reveal everything
- Light from unseen sources
- Varying ceiling heights and room proportions

**14. Risk/Peril**
Identifiable threat with reliable safeguard.

*Practical applications:*
- Heights with secure railings
- Fire contained in fireplace
- Views of dramatic weather from protected spaces
- Play structures for children

## Starting Your Biophilic Retrofit

You don't need to renovate. Start with these high-impact, low-cost interventions:

### Indoor Plants (Immediate Impact)

**Air-purifying champions:**
- Snake plant (Sansevieria) - extremely low maintenance
- Pothos - trails beautifully, tolerates low light
- Spider plant - produces oxygen, removes toxins
- Peace lily - flowers in low light
- Rubber plant - striking foliage

**Create plant layers:**
- Floor plants (fiddle leaf fig, monstera)
- Table plants (succulents, herbs)
- Hanging plants (pothos, string of pearls)
- Wall-mounted plants (air plants, mounted ferns)

**Living walls (DIY options):**
- Pocket planters on wall-mounted fabric
- Vertical pallet gardens
- Modular wall-mounted pot systems
- Moss walls (preserved or living)

### Natural Materials

**Replace synthetic with natural:**
- Cotton or linen bedding instead of polyester
- Wool rugs instead of synthetic
- Wood cutting boards and utensils
- Ceramic dishes instead of plastic
- Natural fiber curtains

**Add natural elements:**
- Driftwood, stones, shells from outdoor adventures
- Woven baskets for storage
- Cork boards and accessories
- Bamboo in bathroom and kitchen

### Light and Views

**Maximize daylight:**
- Remove heavy curtains, use sheer alternatives
- Keep windows clean
- Place mirrors to reflect natural light deeper
- Paint walls in light, warm colors
- Trim outdoor vegetation blocking windows

**Frame your views:**
- Arrange furniture to face windows
- Remove visual clutter from window areas
- Add window boxes for closer nature
- Hang prisms or crystals for light play

### Water Features

**Simple additions:**
- Tabletop fountain (under $50)
- Glass vase with floating plants
- Fish bowl or small aquarium
- Bowl of water with floating flowers

### Sound

**Natural soundscape:**
- Open windows when possible
- Wind chimes (tuned to pleasant notes)
- Small water features
- Bird feeders near windows to attract birdsong

## Room-by-Room Guide

**Living Room:**
- Large floor plants as focal points
- Natural fiber rug and cushions
- Seating facing windows/garden
- Fire (real or high-quality electric)

**Bedroom:**
- Plants that release oxygen at night (orchids, succulents, snake plant)
- Natural fiber bedding
- Views of sky or trees from bed
- Refuge elements (canopy, low lighting)

**Kitchen:**
- Herb garden on windowsill or under grow lights
- Natural stone or wood counters
- Views of outdoor food production
- Water sounds (even from running tap, mindfully)

**Bathroom:**
- Humidity-loving plants (fern, pothos, tillandsia)
- Natural stone and wood elements
- Skylight or frosted window for daylight
- Rainfall showerhead for water experience

**Home Office:**
- Plants within view while working
- Position desk to face window if possible
- Natural materials on desk surface
- Dynamic daylight rather than constant artificial

## The Deeper Practice

Biophilic design isn't just about adding plants and wood. At its heart, it's about remembering that we are part of nature, not separate from it. Our homes can remind us of this fundamental truth.

As you make changes, notice how you feel. Pay attention to which spaces draw you in and which ones repel. Follow your biological intuition—it knows what environments support your flourishing.

Over time, a biophilic home becomes a living system, changing with seasons, growing and adapting. The boundary between inside and outside softens. You find yourself more attuned to weather, seasons, and the living world beyond your walls.

This is the solarpunk vision made personal: homes that connect us to nature rather than isolating us from it, buildings that support not just survival but genuine thriving.`,
			author: 'Elena Mori',
			readTime: 14,
			section: 'BUILD',
			order: 6
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

	console.log(`Created Winter Solstice 2025 edition with ${articlesData.length} articles`);

	// ============================================
	// SPRING 2026 EDITION (Framework)
	// ============================================
	console.log('Creating Spring 2026 edition framework...');

	const springEdition = await prisma.edition.upsert({
		where: { slug: 'spring-2026' },
		update: {},
		create: {
			slug: 'spring-2026',
			title: 'Awakening',
			season: 'SPRING',
			year: 2026,
			tagline: 'The growing season begins',
			description:
				'Our first full quarterly edition celebrates the Spring Equinox—a time of new beginnings, soil preparation, and planting seeds for the seasons ahead.',
			status: 'DRAFT',
			publishedAt: new Date('2026-03-20')
		}
	});

	console.log('Created Spring 2026 edition (draft)');

	// ============================================
	// FALL 2026 EDITION (Framework with saved articles)
	// ============================================
	console.log('Creating Fall 2026 edition framework...');

	const fallEdition = await prisma.edition.upsert({
		where: { slug: 'fall-2026' },
		update: {},
		create: {
			slug: 'fall-2026',
			title: 'Harvest & Preserve',
			season: 'FALL',
			year: 2026,
			tagline: 'Abundance through community resilience',
			description:
				'This edition focuses on the abundance of fall—harvesting, preserving, and building community resilience for the seasons ahead.',
			status: 'DRAFT',
			publishedAt: new Date('2026-09-22')
		}
	});

	// Articles saved for Fall 2026
	const fallArticlesData = [
		{
			slug: 'fermentation-fundamentals',
			title: 'Fermentation Fundamentals',
			subtitle: 'Transform seasonal abundance into year-round nutrition',
			excerpt:
				'Learn the ancient art of fermentation to preserve the harvest while boosting nutrition and flavor.',
			content: `# Fermentation Fundamentals

Long before refrigeration, humans discovered that certain microorganisms could transform perishable foods into stable, nutritious, and delicious preserved products. Fermentation remains one of the most energy-efficient preservation methods—requiring no electricity, minimal equipment, and producing foods that are often more nutritious than their fresh counterparts.

## Why Ferment?

**Preservation**: Lactic acid bacteria produce acids that prevent spoilage, keeping vegetables edible for months or years.

**Nutrition**: Fermentation increases vitamin content, produces beneficial enzymes, and makes nutrients more bioavailable.

**Flavor**: Complex, tangy, umami-rich flavors develop that can't be achieved any other way.

**Gut Health**: Live fermented foods contain probiotics that support digestive health.

**Low Energy**: Unlike canning, freezing, or dehydrating, fermentation requires no external energy input.

## Basic Vegetable Fermentation

### The Simple Salt Method

Almost any vegetable can be fermented using nothing but salt and time. Here's the basic process:

1. **Prepare vegetables**: Chop, slice, or shred. Smaller pieces ferment faster.

2. **Salt**: Use 2-3% salt by weight. For 1kg of vegetables, that's 20-30g of salt.

3. **Massage**: Work the salt into the vegetables until they release their juices. This creates the brine.

4. **Pack**: Press vegetables tightly into a jar, submerging them under their own liquid.

5. **Weight**: Keep vegetables submerged. Exposure to air causes mold.

6. **Wait**: Fermentation takes 3-14 days depending on temperature and desired sourness.

7. **Refrigerate**: Once fermented to your taste, cold storage slows the process.

### Classic Sauerkraut

**Ingredients:**
- 1 medium cabbage (about 1kg)
- 20-25g sea salt (non-iodized)

**Method:**
1. Remove outer leaves. Quarter cabbage and slice thinly.
2. Toss with salt in a large bowl.
3. Massage vigorously for 5-10 minutes until liquid pools in the bottom.
4. Pack into a clean jar, pressing down firmly after each handful.
5. Liquid should cover cabbage. If not, add a bit of brine (1 tsp salt per cup of water).
6. Weight down with a smaller jar filled with water, or a dedicated fermentation weight.
7. Cover loosely to allow gases to escape.
8. Ferment at room temperature (18-22°C ideal) for 1-4 weeks.
9. Taste periodically. Refrigerate when sourness is to your liking.

## Troubleshooting

**Mold on surface**: Skim it off. If vegetables below the brine are fine, they're safe to eat.

**Soft/mushy texture**: Too warm, too long, or not enough salt. Still safe but less pleasant.

**Not sour enough**: Give it more time, or ferment at a slightly warmer temperature.

**Too salty**: Reduce salt percentage next time, or rinse before eating.

## Beyond Vegetables

Once you've mastered basic vegetable fermentation, explore:

- **Kimchi**: Korea's spicy fermented cabbage
- **Miso**: Fermented soybean paste (longer process)
- **Kombucha**: Fermented tea
- **Kefir**: Fermented milk
- **Sourdough**: Fermented bread dough

## Start Small

Don't try to ferment your entire harvest at once. Start with a single jar of sauerkraut. Once you've tasted your own creation and witnessed the magic of microbial transformation, you'll be hooked.

The jars lining your pantry shelves will become a source of pride—evidence of your ability to capture summer's abundance and carry it into winter.

*Happy fermenting!*`,
			author: 'Maya Chen',
			readTime: 12,
			section: 'GROW',
			order: 1
		},
		{
			slug: 'seed-saving-fundamentals',
			title: 'Seed Saving Fundamentals',
			subtitle: "Closing the loop on your garden's lifecycle",
			excerpt:
				'Saving seeds from your best plants ensures adapted varieties, food sovereignty, and connection to the cycle of growing.',
			content: `# Seed Saving Fundamentals

Every vegetable you grow started as a seed. When you save seeds from your own garden, you close the loop—no longer dependent on annual purchases, instead participating in the continuous cycle of life that has sustained human agriculture for 10,000 years.

## Why Save Seeds?

**Adaptation**: Plants grown from saved seeds gradually adapt to your specific conditions—your soil, climate, and microclimate. Over generations, they become increasingly suited to your garden.

**Resilience**: Maintaining diverse seed stocks distributed among many growers is more resilient than centralized commercial production.

**Sovereignty**: When you save seeds, you control a crucial input to food production. You're not dependent on corporations or supply chains.

**Connection**: Seed saving connects you to the full lifecycle of plants and to the long chain of gardeners who came before.

**Cost**: Once established, saved seeds are free.

## Beginner-Friendly Crops

Start with self-pollinating annuals that are easy to select and store:

**Easiest:**
- Tomatoes
- Peppers
- Beans
- Peas
- Lettuce

**Moderate:**
- Squash/pumpkins (need isolation or hand-pollination)
- Cucumbers (same)
- Corn (needs isolation)

**Advanced:**
- Biennials (carrots, beets, onions) - require overwintering
- Brassicas (kale, cabbage) - complex pollination, cross easily

## Basic Process

### 1. Select Plants

**Choose your best:**
- Healthiest, most vigorous plants
- True to type (showing variety characteristics)
- First to produce, or most productive
- Most disease-resistant

**Never save from:**
- Weak or diseased plants
- Off-type specimens
- F1 hybrids (offspring won't be true to type)

### 2. Let Seeds Mature

Seeds need to fully mature on the plant:
- Beans/peas: Let pods dry brown on vine
- Tomatoes: Allow to fully ripen (even overripe)
- Peppers: Let fruit color fully and start to wrinkle
- Lettuce: Let plant bolt and flowers dry to fluff
- Squash: Leave until vine dies, skin is hard

### 3. Harvest and Clean

**Dry seeds (beans, peas, lettuce, flowers):**
1. Remove from pods/heads
2. Winnow or pick out debris
3. Spread to dry completely

**Wet seeds (tomatoes, cucumbers, squash):**
1. Scoop seeds with pulp
2. Ferment in water 2-3 days (tomatoes) or rinse clean (squash)
3. Dry thoroughly on plates or screens

### 4. Dry Thoroughly

Seeds must be completely dry for storage:
- Spread on plates or screens
- Air dry in warm, well-ventilated area
- 1-2 weeks for most seeds
- Seed should snap, not bend

### 5. Store Properly

**Enemies of stored seeds:**
- Heat
- Moisture
- Light

**Good storage:**
- Airtight containers (glass jars, sealed bags)
- Cool, dark location
- Add silica gel packets for moisture control
- Label with variety and date

**Storage life (properly stored):**
- 1-2 years: Onion, parsley, parsnip
- 3-4 years: Beans, peas, carrots, peppers
- 5+ years: Tomatoes, brassicas, squash

## Isolation and Purity

Some plants cross-pollinate easily. To maintain variety purity:

**Isolation by distance:**
- Squash family: 1/2 to 1 mile
- Corn: 1/4 mile
- Peppers: 50-300 feet (depending on local insect population)

**Isolation by timing:**
- Grow only one variety
- Stagger plantings so flowering doesn't overlap

**Hand pollination:**
- Cover female flowers before opening
- Transfer pollen from same variety
- Re-cover until fruit sets

## Building a Seed Library

Once you're saving seeds, you have more than you need. Share!

**Options:**
- Start a neighborhood seed swap
- Contribute to a local seed library
- Trade with other gardeners online
- Gift seeds to new gardeners

## The Long View

Seed saving is a long game. One year's seeds are next year's plants, whose seeds become the following year's plants. Over time, you develop relationships with particular varieties—learning their quirks, selecting for desired traits, adapting them to your conditions.

This is how our ancestors created all the vegetable varieties we grow today. Every heirloom tomato exists because countless gardeners before us selected and saved seeds, passing their favorites down through generations.

When you save seeds, you join that unbroken chain. You become a steward of genetic diversity and an active participant in the ongoing evolution of our food plants.

Start small. Save seeds from one crop this year. Next year, add another. Within a few seasons, you'll be well on your way to seed sovereignty.`,
			author: 'Sara Martinez',
			readTime: 13,
			section: 'GROW',
			order: 2
		}
	];

	for (const articleData of fallArticlesData) {
		const existing = await prisma.article.findUnique({ where: { slug: articleData.slug } });
		if (existing) continue;

		await prisma.article.create({
			data: {
				...articleData,
				status: 'DRAFT',
				editionId: fallEdition.id
			}
		});
	}

	console.log(`Created Fall 2026 edition (draft) with ${fallArticlesData.length} articles`);

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
