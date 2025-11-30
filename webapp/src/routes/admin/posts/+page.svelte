<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ posts, editions, pagination, filters } = data);

	const statusColors: Record<string, string> = {
		SEED: 'bg-amber-500/20 text-amber-400',
		GROWING: 'bg-green-500/20 text-green-400',
		HARVEST: 'bg-orange-500/20 text-orange-400',
		PRESERVE: 'bg-slate-500/20 text-slate-400'
	};

	const typeColors: Record<string, string> = {
		COMMUNITY: 'bg-blue-500/20 text-blue-400',
		GUIDE: 'bg-green-500/20 text-green-400',
		NEWS: 'bg-red-500/20 text-red-400',
		EVENT: 'bg-purple-500/20 text-purple-400',
		RESOURCE: 'bg-cyan-500/20 text-cyan-400',
		PROFILE: 'bg-pink-500/20 text-pink-400'
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
		goto(`/admin/posts?${params.toString()}`);
	}
</script>

<svelte:head>
	<title>Greenhouse | Solstice CMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="font-orbitron text-3xl font-bold">
				<span class="text-green-400">❋</span> Greenhouse
			</h1>
			<p class="text-slate-400">Manage evergreen community content</p>
		</div>
		<a href="/admin/posts/new" class="btn-primary">
			+ New Post
		</a>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-4 mb-6">
		<!-- Status Filter -->
		<div class="flex gap-2">
			{#each ['', 'SEED', 'GROWING', 'HARVEST', 'PRESERVE'] as status}
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

		<!-- Type Filter -->
		<select
			on:change={(e) => updateFilters('type', e.currentTarget.value)}
			class="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg"
		>
			<option value="">All Types</option>
			<option value="COMMUNITY" selected={filters.type === 'COMMUNITY'}>Community</option>
			<option value="GUIDE" selected={filters.type === 'GUIDE'}>Guide</option>
			<option value="NEWS" selected={filters.type === 'NEWS'}>News</option>
			<option value="EVENT" selected={filters.type === 'EVENT'}>Event</option>
			<option value="RESOURCE" selected={filters.type === 'RESOURCE'}>Resource</option>
			<option value="PROFILE" selected={filters.type === 'PROFILE'}>Profile</option>
		</select>

		<!-- Promoted Filter -->
		<select
			on:change={(e) => updateFilters('promotedToId', e.currentTarget.value)}
			class="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg"
		>
			<option value="">All Posts</option>
			<option value="promoted" selected={filters.promotedToId === 'promoted'}>Promoted Only</option>
			{#each editions as edition}
				<option value={edition.id} selected={filters.promotedToId === edition.id}>
					Promoted to {edition.season} {edition.year}
				</option>
			{/each}
		</select>

		<!-- Search -->
		<input
			type="text"
			placeholder="Search posts..."
			value={filters.search || ''}
			on:input={(e) => updateFilters('search', e.currentTarget.value)}
			class="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg w-64"
		/>
	</div>

	<!-- Posts Grid -->
	<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each posts as post (post.id)}
			<a
				href="/admin/posts/{post.id}"
				class="card hover:border-slate-600 transition-colors group"
			>
				<!-- Header -->
				<div class="flex items-center justify-between mb-3">
					<span class="text-xs px-2 py-1 rounded-full {typeColors[post.type]}">
						{post.type}
					</span>
					<span class="text-xs px-2 py-1 rounded-full {statusColors[post.status]}">
						{post.status}
					</span>
				</div>

				<!-- Title -->
				<h3 class="font-medium text-white mb-2 group-hover:text-solarpunk-teal transition-colors">
					{post.title}
				</h3>

				{#if post.excerpt}
					<p class="text-sm text-slate-400 mb-3 line-clamp-2">{post.excerpt}</p>
				{/if}

				<!-- Meta -->
				<div class="flex items-center gap-2 text-xs text-slate-500 mb-3">
					{#if post.author}
						<span>{post.author.name}</span>
						<span>·</span>
					{/if}
					{#if post.readTime}
						<span>{post.readTime} min read</span>
					{/if}
					{#if post.featured}
						<span class="text-solarpunk-gold">★ Featured</span>
					{/if}
				</div>

				<!-- Seasonal Affinity -->
				{#if post.seasonalAffinity}
					<div class="text-xs {seasonColors[post.seasonalAffinity]}">
						Best in {post.seasonalAffinity}
					</div>
				{/if}

				<!-- Promoted Banner -->
				{#if post.promotedTo}
					<div class="mt-3 pt-3 border-t border-slate-800">
						<span class="text-xs text-orange-400">
							→ Promoted to {post.promotedTo.season} {post.promotedTo.year}
						</span>
					</div>
				{/if}

				<!-- Tags -->
				{#if post.tags && post.tags.length > 0}
					<div class="flex flex-wrap gap-1 mt-3">
						{#each post.tags.slice(0, 3) as tag}
							<span class="text-xs px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
								{tag}
							</span>
						{/each}
						{#if post.tags.length > 3}
							<span class="text-xs text-slate-500">+{post.tags.length - 3}</span>
						{/if}
					</div>
				{/if}
			</a>
		{:else}
			<div class="col-span-full text-center py-12">
				<p class="text-slate-500 mb-4">No posts found</p>
				<a href="/admin/posts/new" class="btn-primary">Create your first post</a>
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
						goto(`/admin/posts?${params.toString()}`);
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
