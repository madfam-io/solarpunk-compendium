<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ editions, pagination, filters } = data);

	const seasonColors: Record<string, string> = {
		WINTER: 'text-blue-400 border-blue-500/30',
		SPRING: 'text-green-400 border-green-500/30',
		SUMMER: 'text-yellow-400 border-yellow-500/30',
		FALL: 'text-orange-400 border-orange-500/30'
	};

	const statusColors: Record<string, string> = {
		PLANNING: 'bg-slate-500/20 text-slate-400',
		ACCEPTING: 'bg-green-500/20 text-green-400',
		REVIEWING: 'bg-yellow-500/20 text-yellow-400',
		LAYOUT: 'bg-purple-500/20 text-purple-400',
		PUBLISHED: 'bg-blue-500/20 text-blue-400',
		ARCHIVED: 'bg-slate-600/20 text-slate-500'
	};

	const workflowStages = ['PLANNING', 'ACCEPTING', 'REVIEWING', 'LAYOUT', 'PUBLISHED'];

	function updateFilters(key: string, value: string) {
		const params = new URLSearchParams($page.url.searchParams);
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		goto(`/admin/editions?${params.toString()}`);
	}

	function getWorkflowProgress(status: string): number {
		const index = workflowStages.indexOf(status);
		return index >= 0 ? ((index + 1) / workflowStages.length) * 100 : 0;
	}
</script>

<svelte:head>
	<title>Editions | Solstice CMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="font-orbitron text-3xl font-bold">Editions</h1>
			<p class="text-slate-400">Manage seasonal flagship publications</p>
		</div>
		<a href="/admin/editions/new" class="btn-primary">
			+ New Edition
		</a>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-4 mb-6">
		<div class="flex gap-2">
			{#each ['', 'PLANNING', 'ACCEPTING', 'REVIEWING', 'LAYOUT', 'PUBLISHED', 'ARCHIVED'] as status}
				<button
					on:click={() => updateFilters('status', status)}
					class="px-3 py-1.5 text-sm rounded-lg transition-colors
						{filters.status === status || (!filters.status && status === '')
						? 'bg-slate-700 text-white'
						: 'text-slate-400 hover:text-white hover:bg-slate-800'}"
				>
					{status || 'All'}
				</button>
			{/each}
		</div>
	</div>

	<!-- Editions Grid -->
	<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each editions as edition}
			<a
				href="/admin/editions/{edition.id}"
				class="card hover:border-slate-600 transition-colors group {seasonColors[edition.season]}"
			>
				<!-- Season/Year Header -->
				<div class="flex items-center justify-between mb-3">
					<div>
						<span class="font-orbitron font-bold text-lg">{edition.season}</span>
						<span class="text-slate-400 ml-2">{edition.year}</span>
					</div>
					<span class="text-xs px-2 py-1 rounded-full {statusColors[edition.status]}">
						{edition.status}
					</span>
				</div>

				<!-- Title -->
				<h3 class="font-medium text-white mb-2">{edition.title}</h3>

				{#if edition.tagline}
					<p class="text-sm text-slate-400 mb-4 line-clamp-2">{edition.tagline}</p>
				{/if}

				<!-- Stats -->
				<div class="flex gap-4 text-xs text-slate-500 mb-4">
					<span>{edition.counts.articles} articles</span>
					<span>{edition.counts.submissions} submissions</span>
					{#if edition.counts.promotedPosts > 0}
						<span class="text-orange-400">{edition.counts.promotedPosts} promoted</span>
					{/if}
				</div>

				<!-- Workflow Progress -->
				{#if edition.status !== 'ARCHIVED'}
					<div class="mt-auto">
						<div class="flex justify-between text-xs text-slate-500 mb-1">
							<span>Workflow Progress</span>
							<span>{Math.round(getWorkflowProgress(edition.status))}%</span>
						</div>
						<div class="h-1 bg-slate-800 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-solarpunk-teal to-solarpunk-gold transition-all"
								style="width: {getWorkflowProgress(edition.status)}%"
							></div>
						</div>
					</div>
				{/if}

				<!-- Dates -->
				<div class="mt-4 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500">
					{#if edition.launchDate}
						<span>Launch: {new Date(edition.launchDate).toLocaleDateString()}</span>
					{:else}
						<span>No launch date set</span>
					{/if}
					{#if edition.publishedAt}
						<span class="text-green-400">Published</span>
					{/if}
				</div>
			</a>
		{:else}
			<div class="col-span-full text-center py-12">
				<p class="text-slate-500 mb-4">No editions found</p>
				<a href="/admin/editions/new" class="btn-primary">Create your first edition</a>
			</div>
		{/each}
	</div>

	<!-- Pagination -->
	{#if pagination.totalPages > 1}
		<div class="flex justify-center gap-2 mt-8">
			{#each Array(pagination.totalPages) as _, i}
				<button
					on:click={() => {
						const params = new URLSearchParams($page.url.searchParams);
						params.set('page', String(i + 1));
						goto(`/admin/editions?${params.toString()}`);
					}}
					class="w-8 h-8 rounded text-sm
						{pagination.page === i + 1
						? 'bg-solarpunk-teal text-slate-900'
						: 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
				>
					{i + 1}
				</button>
			{/each}
		</div>
	{/if}
</div>
