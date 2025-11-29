<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SEO from '$lib/components/SEO.svelte';

	export let data;

	$: ({ projects, categories, pagination, filters } = data);

	let searchQuery = filters.search;
	let selectedCategory = filters.category;
	let selectedSDG = filters.sdg;

	function updateFilters() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (selectedCategory) params.set('category', selectedCategory);
		if (selectedSDG) params.set('sdg', selectedSDG);

		goto(`/directory?${params.toString()}`, { replaceState: true });
	}

	function clearFilters() {
		searchQuery = '';
		selectedCategory = '';
		selectedSDG = '';
		goto('/directory', { replaceState: true });
	}

	function handleSearch(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			updateFilters();
		}
	}

	function selectCategory(slug: string) {
		selectedCategory = selectedCategory === slug ? '' : slug;
		updateFilters();
	}

	function goToPage(pageNum: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`/directory?${params.toString()}`);
	}
</script>

<SEO
	title="Project Directory"
	description="Discover solarpunk projects, ecovillages, makerspaces, and regenerative organizations worldwide."
	keywords="solarpunk projects, ecovillages, makerspaces, regenerative organizations, sustainable communities, green projects"
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<!-- Header -->
	<div class="text-center mb-12">
		<h1 class="font-orbitron text-4xl md:text-5xl font-bold mb-4">
			Global <span class="gradient-text">Directory</span>
		</h1>
		<p class="text-lg text-slate-400 max-w-2xl mx-auto">
			Discover projects, organizations, and communities building regenerative futures around the
			world.
		</p>
	</div>

	<!-- Search and Filters -->
	<div class="card mb-8">
		<div class="flex flex-col lg:flex-row gap-4">
			<!-- Search -->
			<div class="flex-1 relative">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					on:keydown={handleSearch}
					placeholder="Search projects..."
					class="input pl-12"
				/>
			</div>

			<!-- Category filter -->
			<select
				bind:value={selectedCategory}
				on:change={updateFilters}
				class="input w-full lg:w-48"
			>
				<option value="">All Categories</option>
				{#each categories as cat}
					<option value={cat.slug}>{cat.icon} {cat.name}</option>
				{/each}
			</select>

			<!-- SDG filter -->
			<select bind:value={selectedSDG} on:change={updateFilters} class="input w-full lg:w-40">
				<option value="">All SDGs</option>
				{#each Array(17) as _, i}
					<option value={i + 1}>SDG {i + 1}</option>
				{/each}
			</select>

			<!-- Clear filters -->
			{#if searchQuery || selectedCategory || selectedSDG}
				<button on:click={clearFilters} class="btn-ghost"> Clear </button>
			{/if}
		</div>
	</div>

	<!-- Category pills (quick filters) -->
	<div class="flex flex-wrap gap-2 mb-8">
		{#each categories as cat}
			<button
				on:click={() => selectCategory(cat.slug)}
				class="px-4 py-2 rounded-full text-sm font-medium transition-all
					{selectedCategory === cat.slug
					? 'bg-solarpunk-teal text-slate-900'
					: 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}"
			>
				{cat.icon}
				{cat.name}
				{#if cat.projectCount > 0}
					<span class="ml-1 opacity-60">({cat.projectCount})</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Results count -->
	<p class="text-sm text-slate-500 mb-6">
		Showing {projects.length} of {pagination.total} projects
		{#if pagination.totalPages > 1}
			(Page {pagination.page} of {pagination.totalPages})
		{/if}
	</p>

	<!-- Projects Grid -->
	{#if projects.length > 0}
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each projects as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>

		<!-- Pagination -->
		{#if pagination.totalPages > 1}
			<div class="flex justify-center gap-2 mt-12">
				<button
					on:click={() => goToPage(pagination.page - 1)}
					disabled={pagination.page <= 1}
					class="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Previous
				</button>

				{#each Array(pagination.totalPages) as _, i}
					<button
						on:click={() => goToPage(i + 1)}
						class="w-10 h-10 rounded-lg font-medium transition-colors
							{pagination.page === i + 1
							? 'bg-solarpunk-teal text-slate-900'
							: 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
					>
						{i + 1}
					</button>
				{/each}

				<button
					on:click={() => goToPage(pagination.page + 1)}
					disabled={pagination.page >= pagination.totalPages}
					class="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Next
				</button>
			</div>
		{/if}
	{:else}
		<div class="text-center py-16">
			<div class="text-6xl mb-4">🔍</div>
			<h3 class="text-xl font-semibold mb-2">No projects found</h3>
			<p class="text-slate-400 mb-4">Try adjusting your search or filters</p>
			<button on:click={clearFilters} class="btn-primary"> Clear all filters </button>
		</div>
	{/if}

	<!-- Submit CTA -->
	<div class="mt-16 text-center">
		<div class="card inline-block max-w-md">
			<h3 class="font-orbitron font-bold text-xl mb-2">Know a project that should be listed?</h3>
			<p class="text-slate-400 mb-4">
				Help us grow the directory by submitting projects building regenerative futures.
			</p>
			<a href="/directory/submit" class="btn-primary"> Submit a Project </a>
		</div>
	</div>
</div>
