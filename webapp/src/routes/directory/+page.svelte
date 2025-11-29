<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	// Mock data - will come from database
	const categories = [
		{ slug: 'energy', name: 'Energy', icon: '⚡' },
		{ slug: 'food', name: 'Food & Agriculture', icon: '🌾' },
		{ slug: 'housing', name: 'Housing', icon: '🏠' },
		{ slug: 'transport', name: 'Transport', icon: '🚲' },
		{ slug: 'community', name: 'Community', icon: '🤝' },
		{ slug: 'tech', name: 'Technology', icon: '💻' },
		{ slug: 'education', name: 'Education', icon: '📚' },
		{ slug: 'art', name: 'Art & Culture', icon: '🎨' }
	];

	const mockProjects = [
		{
			id: '1',
			slug: 'solar-village-collective',
			name: 'Solar Village Collective',
			tagline: 'Community-owned solar microgrids powering rural villages across Southeast Asia.',
			location: 'Thailand',
			coverImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
			categories: ['Energy', 'Community'],
			sdgs: [7, 11, 13],
			featured: true
		},
		{
			id: '2',
			slug: 'urban-food-forest',
			name: 'Urban Food Forest Network',
			tagline: 'Transforming vacant city lots into productive food forests for neighborhood food security.',
			location: 'Detroit, USA',
			coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
			categories: ['Food & Agriculture', 'Community'],
			sdgs: [2, 11, 15],
			featured: true
		},
		{
			id: '3',
			slug: 'repair-cafe-international',
			name: 'Repair Café International',
			tagline: 'Global network of community repair events fighting planned obsolescence.',
			location: 'Global',
			categories: ['Community', 'Technology'],
			sdgs: [12, 13, 17],
			featured: false
		},
		{
			id: '4',
			slug: 'earthship-academy',
			name: 'Earthship Academy',
			tagline: 'Teaching sustainable building techniques using recycled materials and passive solar design.',
			location: 'New Mexico, USA',
			coverImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop',
			categories: ['Housing', 'Education'],
			sdgs: [4, 11, 12, 13],
			featured: false
		},
		{
			id: '5',
			slug: 'cargo-bike-coop',
			name: 'Cargo Bike Cooperative',
			tagline: 'Worker-owned last-mile delivery service using electric cargo bikes.',
			location: 'Amsterdam, Netherlands',
			coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			categories: ['Transport', 'Community'],
			sdgs: [8, 11, 13],
			featured: false
		},
		{
			id: '6',
			slug: 'solarpunk-art-collective',
			name: 'Solarpunk Art Collective',
			tagline: 'Artists imagining and visualizing regenerative futures through murals, installations, and digital art.',
			location: 'São Paulo, Brazil',
			categories: ['Art & Culture'],
			sdgs: [11, 17],
			featured: false
		}
	];

	let searchQuery = '';
	let selectedCategory = '';
	let selectedSDG = '';

	$: filteredProjects = mockProjects.filter(project => {
		const matchesSearch = !searchQuery ||
			project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			project.tagline.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesCategory = !selectedCategory ||
			project.categories.some(c => c.toLowerCase() === selectedCategory.toLowerCase());

		const matchesSDG = !selectedSDG ||
			project.sdgs.includes(parseInt(selectedSDG));

		return matchesSearch && matchesCategory && matchesSDG;
	});

	function clearFilters() {
		searchQuery = '';
		selectedCategory = '';
		selectedSDG = '';
	}
</script>

<svelte:head>
	<title>Project Directory | The Solarpunk Almanac</title>
	<meta name="description" content="Discover solarpunk projects, ecovillages, makerspaces, and regenerative organizations worldwide." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<!-- Header -->
	<div class="text-center mb-12">
		<h1 class="font-orbitron text-4xl md:text-5xl font-bold mb-4">
			Global <span class="gradient-text">Directory</span>
		</h1>
		<p class="text-lg text-slate-400 max-w-2xl mx-auto">
			Discover projects, organizations, and communities building regenerative futures around the world.
		</p>
	</div>

	<!-- Search and Filters -->
	<div class="card mb-8">
		<div class="flex flex-col lg:flex-row gap-4">
			<!-- Search -->
			<div class="flex-1 relative">
				<svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search projects..."
					class="input pl-12"
				/>
			</div>

			<!-- Category filter -->
			<select bind:value={selectedCategory} class="input w-full lg:w-48">
				<option value="">All Categories</option>
				{#each categories as cat}
					<option value={cat.name}>{cat.icon} {cat.name}</option>
				{/each}
			</select>

			<!-- SDG filter -->
			<select bind:value={selectedSDG} class="input w-full lg:w-40">
				<option value="">All SDGs</option>
				{#each Array(17) as _, i}
					<option value={i + 1}>SDG {i + 1}</option>
				{/each}
			</select>

			<!-- Clear filters -->
			{#if searchQuery || selectedCategory || selectedSDG}
				<button on:click={clearFilters} class="btn-ghost">
					Clear
				</button>
			{/if}
		</div>
	</div>

	<!-- Category pills (quick filters) -->
	<div class="flex flex-wrap gap-2 mb-8">
		{#each categories as cat}
			<button
				on:click={() => selectedCategory = selectedCategory === cat.name ? '' : cat.name}
				class="px-4 py-2 rounded-full text-sm font-medium transition-all
					{selectedCategory === cat.name
						? 'bg-solarpunk-teal text-slate-900'
						: 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}"
			>
				{cat.icon} {cat.name}
			</button>
		{/each}
	</div>

	<!-- Results count -->
	<p class="text-sm text-slate-500 mb-6">
		Showing {filteredProjects.length} of {mockProjects.length} projects
	</p>

	<!-- Projects Grid -->
	{#if filteredProjects.length > 0}
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredProjects as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-16">
			<div class="text-6xl mb-4">🔍</div>
			<h3 class="text-xl font-semibold mb-2">No projects found</h3>
			<p class="text-slate-400 mb-4">Try adjusting your search or filters</p>
			<button on:click={clearFilters} class="btn-primary">
				Clear all filters
			</button>
		</div>
	{/if}

	<!-- Submit CTA -->
	<div class="mt-16 text-center">
		<div class="card inline-block max-w-md">
			<h3 class="font-orbitron font-bold text-xl mb-2">Know a project that should be listed?</h3>
			<p class="text-slate-400 mb-4">Help us grow the directory by submitting projects building regenerative futures.</p>
			<a href="/directory/submit" class="btn-primary">
				Submit a Project
			</a>
		</div>
	</div>
</div>
