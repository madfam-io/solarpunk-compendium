<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ editions, articles, posts, submissions, stats } = data);

	const seasonColors: Record<string, string> = {
		WINTER: 'text-blue-400',
		SPRING: 'text-green-400',
		SUMMER: 'text-yellow-400',
		FALL: 'text-orange-400'
	};

	const statusColors: Record<string, string> = {
		PLANNING: 'bg-slate-500/20 text-slate-400',
		ACCEPTING: 'bg-green-500/20 text-green-400',
		REVIEWING: 'bg-yellow-500/20 text-yellow-400',
		LAYOUT: 'bg-purple-500/20 text-purple-400',
		PUBLISHED: 'bg-blue-500/20 text-blue-400',
		ARCHIVED: 'bg-slate-600/20 text-slate-500'
	};

	const contentStatusColors: Record<string, string> = {
		SEED: 'bg-amber-500/20 text-amber-400',
		GROWING: 'bg-green-500/20 text-green-400',
		HARVEST: 'bg-orange-500/20 text-orange-400',
		PUBLISHED: 'bg-blue-500/20 text-blue-400',
		PRESERVE: 'bg-slate-500/20 text-slate-400'
	};
</script>

<svelte:head>
	<title>Solstice CMS | Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="font-orbitron text-3xl font-bold">Solstice CMS</h1>
		<p class="text-slate-400">Seasonal publishing for the Solarpunk Almanac</p>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<div class="card text-center">
			<div class="text-3xl font-bold text-solarpunk-gold">{stats.editions.total}</div>
			<div class="text-sm text-slate-400">Editions</div>
			<div class="text-xs text-green-400 mt-1">{stats.editions.published} published</div>
		</div>
		<div class="card text-center">
			<div class="text-3xl font-bold text-solarpunk-teal">{stats.articles.total}</div>
			<div class="text-sm text-slate-400">Articles</div>
			<div class="text-xs text-yellow-400 mt-1">{stats.articles.growing} in review</div>
		</div>
		<div class="card text-center">
			<div class="text-3xl font-bold text-green-400">{stats.posts.total}</div>
			<div class="text-sm text-slate-400">Greenhouse Posts</div>
			<div class="text-xs text-orange-400 mt-1">{stats.posts.harvest} featured</div>
		</div>
		<div class="card text-center">
			<div class="text-3xl font-bold text-purple-400">{stats.submissions.pending}</div>
			<div class="text-sm text-slate-400">Pending Submissions</div>
			<div class="text-xs text-slate-500 mt-1">{stats.submissions.total} total</div>
		</div>
	</div>

	<div class="grid lg:grid-cols-2 gap-8">
		<!-- Editions -->
		<div class="card">
			<div class="flex items-center justify-between mb-4">
				<h2 class="font-orbitron font-bold">Editions</h2>
				<a href="/admin/editions" class="text-sm text-solarpunk-teal hover:underline">View all →</a>
			</div>
			<div class="space-y-3">
				{#each editions as edition}
					<a
						href="/admin/editions/{edition.id}"
						class="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
					>
						<div class="flex items-center justify-between">
							<div>
								<span class="font-medium {seasonColors[edition.season]}">{edition.season}</span>
								<span class="text-slate-400">{edition.year}</span>
								<span class="text-xs ml-2 text-slate-500">({edition.counts.articles} articles)</span>
							</div>
							<span class="text-xs px-2 py-1 rounded-full {statusColors[edition.status]}">
								{edition.status}
							</span>
						</div>
						{#if edition.tagline}
							<p class="text-sm text-slate-400 mt-1 truncate">{edition.tagline}</p>
						{/if}
					</a>
				{:else}
					<p class="text-slate-500 text-sm">No editions yet</p>
				{/each}
			</div>
			<a
				href="/admin/editions/new"
				class="mt-4 block text-center py-2 border border-dashed border-slate-700 rounded-lg text-sm text-slate-400 hover:border-solarpunk-teal hover:text-solarpunk-teal transition-colors"
			>
				+ Create Edition
			</a>
		</div>

		<!-- Recent Articles -->
		<div class="card">
			<div class="flex items-center justify-between mb-4">
				<h2 class="font-orbitron font-bold">Recent Articles</h2>
				<a href="/admin/articles" class="text-sm text-solarpunk-teal hover:underline">View all →</a>
			</div>
			<div class="space-y-3">
				{#each articles as article}
					<a
						href="/admin/articles/{article.id}"
						class="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
					>
						<div class="flex items-center justify-between">
							<span class="font-medium truncate flex-1">{article.title}</span>
							<span class="text-xs px-2 py-1 rounded-full {contentStatusColors[article.status]} ml-2">
								{article.status}
							</span>
						</div>
						<div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
							{#if article.edition}
								<span class="{seasonColors[article.edition.season]}">{article.edition.season} {article.edition.year}</span>
								<span>·</span>
							{/if}
							{#if article.author}
								<span>{article.author.name}</span>
							{/if}
							{#if article.readTime}
								<span>· {article.readTime} min read</span>
							{/if}
						</div>
					</a>
				{:else}
					<p class="text-slate-500 text-sm">No articles yet</p>
				{/each}
			</div>
		</div>

		<!-- Greenhouse (Posts) -->
		<div class="card">
			<div class="flex items-center justify-between mb-4">
				<h2 class="font-orbitron font-bold">Greenhouse</h2>
				<a href="/admin/posts" class="text-sm text-solarpunk-teal hover:underline">View all →</a>
			</div>
			<div class="space-y-3">
				{#each posts as post}
					<a
						href="/admin/posts/{post.id}"
						class="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
					>
						<div class="flex items-center justify-between">
							<span class="font-medium truncate flex-1">{post.title}</span>
							<span class="text-xs px-2 py-1 rounded-full {contentStatusColors[post.status]} ml-2">
								{post.status}
							</span>
						</div>
						<div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
							<span class="px-1.5 py-0.5 bg-slate-700 rounded">{post.type}</span>
							{#if post.promotedTo}
								<span class="text-orange-400">→ {post.promotedTo.season} {post.promotedTo.year}</span>
							{/if}
						</div>
					</a>
				{:else}
					<p class="text-slate-500 text-sm">No posts yet</p>
				{/each}
			</div>
			<a
				href="/admin/posts/new"
				class="mt-4 block text-center py-2 border border-dashed border-slate-700 rounded-lg text-sm text-slate-400 hover:border-green-400 hover:text-green-400 transition-colors"
			>
				+ Create Post
			</a>
		</div>

		<!-- Pending Submissions -->
		<div class="card">
			<div class="flex items-center justify-between mb-4">
				<h2 class="font-orbitron font-bold">Pending Submissions</h2>
				<a href="/admin/submissions" class="text-sm text-solarpunk-teal hover:underline">View all →</a>
			</div>
			<div class="space-y-3">
				{#each submissions as submission}
					<a
						href="/admin/submissions/{submission.id}"
						class="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
					>
						<div class="flex items-center justify-between">
							<span class="font-medium truncate flex-1">{submission.title}</span>
							<span class="text-xs text-slate-500">
								{new Date(submission.createdAt).toLocaleDateString()}
							</span>
						</div>
						<div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
							<span class="{seasonColors[submission.edition.season]}">{submission.edition.season} {submission.edition.year}</span>
							<span>·</span>
							<span>{submission.submitter.name || submission.submitter.email}</span>
						</div>
						<p class="text-sm text-slate-400 mt-2 line-clamp-2">{submission.pitch}</p>
					</a>
				{:else}
					<p class="text-slate-500 text-sm">No pending submissions</p>
				{/each}
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="mt-8 card bg-gradient-to-r from-slate-800/50 to-slate-900/50">
		<h2 class="font-orbitron font-bold mb-4">Quick Actions</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<a
				href="/admin/editions/new"
				class="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors text-center"
			>
				<div class="text-2xl mb-2">◈</div>
				<div class="text-sm font-medium">New Edition</div>
			</a>
			<a
				href="/admin/articles/new"
				class="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors text-center"
			>
				<div class="text-2xl mb-2">◇</div>
				<div class="text-sm font-medium">New Article</div>
			</a>
			<a
				href="/admin/posts/new"
				class="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors text-center"
			>
				<div class="text-2xl mb-2">❋</div>
				<div class="text-sm font-medium">New Post</div>
			</a>
			<a
				href="/admin/authors/new"
				class="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors text-center"
			>
				<div class="text-2xl mb-2">◎</div>
				<div class="text-sm font-medium">New Author</div>
			</a>
		</div>
	</div>
</div>
