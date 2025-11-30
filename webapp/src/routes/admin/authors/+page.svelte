<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ authors, pagination, filters } = data);

	function updateFilters(key: string, value: string) {
		const params = new URLSearchParams($page.url.searchParams);
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		params.delete('page');
		goto(`/admin/authors?${params.toString()}`);
	}
</script>

<svelte:head>
	<title>Authors | Solstice CMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="font-orbitron text-3xl font-bold">Authors</h1>
			<p class="text-slate-400">Manage contributor profiles</p>
		</div>
		<a href="/admin/authors/new" class="btn-primary">
			+ New Author
		</a>
	</div>

	<!-- Search -->
	<div class="mb-6">
		<input
			type="text"
			placeholder="Search authors..."
			value={filters.search || ''}
			on:input={(e) => updateFilters('search', e.currentTarget.value)}
			class="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg w-full max-w-md"
		/>
	</div>

	<!-- Authors Grid -->
	<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each authors as author (author.id)}
			<a
				href="/admin/authors/{author.id}"
				class="card hover:border-slate-600 transition-colors group"
			>
				<div class="flex items-start gap-4">
					<!-- Avatar -->
					<div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
						{#if author.avatar}
							<img src={author.avatar} alt={author.name} class="w-full h-full object-cover" />
						{:else}
							<span class="text-2xl text-slate-500">
								{author.name.charAt(0).toUpperCase()}
							</span>
						{/if}
					</div>

					<div class="flex-1 min-w-0">
						<h3 class="font-medium text-white group-hover:text-solarpunk-teal transition-colors">
							{author.name}
						</h3>
						{#if author.location}
							<p class="text-sm text-slate-500">{author.location}</p>
						{/if}
						{#if author.bio}
							<p class="text-sm text-slate-400 mt-2 line-clamp-2">{author.bio}</p>
						{/if}
					</div>
				</div>

				<!-- Stats -->
				<div class="flex gap-4 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500">
					<span>{author.counts.articles} articles</span>
					<span>{author.counts.posts} posts</span>
					{#if author.user}
						<span class="text-green-400">Linked account</span>
					{/if}
				</div>
			</a>
		{:else}
			<div class="col-span-full text-center py-12">
				<p class="text-slate-500 mb-4">No authors found</p>
				<a href="/admin/authors/new" class="btn-primary">Create your first author</a>
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
						goto(`/admin/authors?${params.toString()}`);
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
