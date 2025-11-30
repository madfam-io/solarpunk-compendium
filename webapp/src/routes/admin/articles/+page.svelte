<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ articles, editions, pagination, filters } = data);

	const statusColors: Record<string, string> = {
		SEED: 'bg-amber-500/20 text-amber-400',
		GROWING: 'bg-green-500/20 text-green-400',
		HARVEST: 'bg-orange-500/20 text-orange-400',
		PUBLISHED: 'bg-blue-500/20 text-blue-400',
		PRESERVE: 'bg-slate-500/20 text-slate-400'
	};

	const sectionColors: Record<string, string> = {
		OVERVIEW: 'text-slate-400',
		GROW: 'text-green-400',
		BUILD: 'text-orange-400',
		POWER: 'text-yellow-400',
		CONNECT: 'text-blue-400',
		THRIVE: 'text-pink-400',
		CREATE: 'text-purple-400',
		LEARN: 'text-cyan-400'
	};

	const seasonColors: Record<string, string> = {
		WINTER: 'text-blue-400',
		SPRING: 'text-green-400',
		SUMMER: 'text-yellow-400',
		FALL: 'text-orange-400'
	};

	function updateFilters(key: string, value: string) {
		const params = new URLSearchParams($page.url.searchParams);
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		params.delete('page');
		goto(`/admin/articles?${params.toString()}`);
	}
</script>

<svelte:head>
	<title>Articles | Solstice CMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="font-orbitron text-3xl font-bold">Articles</h1>
			<p class="text-slate-400">Manage flagship edition articles</p>
		</div>
		<a href="/admin/articles/new" class="btn-primary">
			+ New Article
		</a>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-4 mb-6">
		<!-- Status Filter -->
		<div class="flex gap-2">
			{#each ['', 'SEED', 'GROWING', 'HARVEST', 'PUBLISHED', 'PRESERVE'] as status}
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

		<!-- Edition Filter -->
		<select
			on:change={(e) => updateFilters('editionId', e.currentTarget.value)}
			class="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg"
		>
			<option value="">All Editions</option>
			{#each editions as edition}
				<option value={edition.id} selected={filters.editionId === edition.id}>
					{edition.season} {edition.year}
				</option>
			{/each}
		</select>

		<!-- Search -->
		<input
			type="text"
			placeholder="Search articles..."
			value={filters.search || ''}
			on:input={(e) => updateFilters('search', e.currentTarget.value)}
			class="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg w-64"
		/>
	</div>

	<!-- Articles Table -->
	<div class="card overflow-hidden">
		<table class="w-full">
			<thead class="bg-slate-800/50">
				<tr>
					<th class="p-3 text-left text-sm font-medium text-slate-400">Article</th>
					<th class="p-3 text-left text-sm font-medium text-slate-400">Edition</th>
					<th class="p-3 text-left text-sm font-medium text-slate-400">Section</th>
					<th class="p-3 text-left text-sm font-medium text-slate-400">Author</th>
					<th class="p-3 text-left text-sm font-medium text-slate-400">Status</th>
					<th class="p-3 text-left text-sm font-medium text-slate-400">Updated</th>
				</tr>
			</thead>
			<tbody>
				{#each articles as article (article.id)}
					<tr class="border-t border-slate-800 hover:bg-slate-800/30">
						<td class="p-3">
							<a href="/admin/articles/{article.id}" class="block hover:text-solarpunk-teal">
								<div class="font-medium">{article.title}</div>
								{#if article.subtitle}
									<div class="text-sm text-slate-500 truncate max-w-md">{article.subtitle}</div>
								{/if}
								<div class="text-xs text-slate-600 mt-1">
									{#if article.readTime}
										{article.readTime} min read
									{/if}
									{#if article.featured}
										<span class="text-solarpunk-gold ml-2">★ Featured</span>
									{/if}
								</div>
							</a>
						</td>
						<td class="p-3">
							{#if article.edition}
								<a
									href="/admin/editions/{article.edition.id}"
									class="text-sm {seasonColors[article.edition.season]} hover:underline"
								>
									{article.edition.season} {article.edition.year}
								</a>
							{/if}
						</td>
						<td class="p-3">
							{#if article.section}
								<span class="text-xs px-2 py-1 bg-slate-800 rounded {sectionColors[article.section]}">
									{article.section}
								</span>
							{/if}
						</td>
						<td class="p-3">
							{#if article.author}
								<div class="flex items-center gap-2">
									{#if article.author.avatar}
										<img src={article.author.avatar} alt="" class="w-6 h-6 rounded-full" />
									{/if}
									<span class="text-sm text-slate-300">{article.author.name}</span>
								</div>
							{:else}
								<span class="text-sm text-slate-500">No author</span>
							{/if}
						</td>
						<td class="p-3">
							<span class="text-xs px-2 py-1 rounded-full {statusColors[article.status]}">
								{article.status}
							</span>
						</td>
						<td class="p-3 text-sm text-slate-500">
							{new Date(article.updatedAt).toLocaleDateString()}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="p-8 text-center text-slate-500">
							No articles found
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if pagination.totalPages > 1}
		<div class="flex justify-center gap-2 mt-6">
			{#each Array(pagination.totalPages) as _, i}
				<button
					on:click={() => {
						const params = new URLSearchParams($page.url.searchParams);
						params.set('page', String(i + 1));
						goto(`/admin/articles?${params.toString()}`);
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
