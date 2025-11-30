<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ edition } = data);

	let isUpdating = false;
	let message = '';

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

	const workflowStages = [
		{ key: 'PLANNING', label: 'Planning', description: 'Edition announced' },
		{ key: 'ACCEPTING', label: 'Accepting', description: 'Open for submissions' },
		{ key: 'REVIEWING', label: 'Reviewing', description: 'Editorial review' },
		{ key: 'LAYOUT', label: 'Layout', description: 'Preparing for publish' },
		{ key: 'PUBLISHED', label: 'Published', description: 'Live and available' }
	];

	async function updateStatus(newStatus: string) {
		isUpdating = true;
		message = '';

		try {
			const res = await fetch(`/api/admin/editions/${edition.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});

			if (res.ok) {
				message = `Status updated to ${newStatus}`;
				await invalidateAll();
			} else {
				const data = await res.json();
				message = data.message || 'Failed to update status';
			}
		} catch (err) {
			message = 'An error occurred';
		} finally {
			isUpdating = false;
		}
	}

	function getStageIndex(status: string): number {
		return workflowStages.findIndex((s) => s.key === status);
	}
</script>

<svelte:head>
	<title>{edition.season} {edition.year} | Solstice CMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex items-start justify-between mb-8">
		<div>
			<a href="/admin/editions" class="text-sm text-slate-400 hover:text-white mb-2 inline-block">
				← Back to Editions
			</a>
			<h1 class="font-orbitron text-3xl font-bold">
				<span class="{seasonColors[edition.season]}">{edition.season}</span>
				<span class="text-slate-400">{edition.year}</span>
			</h1>
			<p class="text-slate-400">{edition.title}</p>
		</div>
		<div class="flex items-center gap-3">
			<span class="text-xs px-3 py-1.5 rounded-full {statusColors[edition.status]}">
				{edition.status}
			</span>
			<a href="/admin/editions/{edition.id}/edit" class="btn-ghost text-sm">
				Edit Details
			</a>
		</div>
	</div>

	{#if message}
		<div class="mb-6 p-4 bg-slate-800 rounded-lg text-sm">
			{message}
		</div>
	{/if}

	<!-- Workflow Progress -->
	<div class="card mb-8">
		<h2 class="font-orbitron font-bold mb-4">Edition Workflow</h2>
		<div class="flex items-center justify-between mb-4">
			{#each workflowStages as stage, i}
				{@const currentIndex = getStageIndex(edition.status)}
				{@const isComplete = i < currentIndex}
				{@const isCurrent = i === currentIndex}
				<div class="flex-1 relative">
					<button
						on:click={() => updateStatus(stage.key)}
						disabled={isUpdating || edition.status === 'ARCHIVED'}
						class="w-full text-center group"
					>
						<div
							class="w-10 h-10 mx-auto rounded-full flex items-center justify-center transition-colors
								{isComplete ? 'bg-solarpunk-teal text-slate-900' :
								 isCurrent ? 'bg-solarpunk-gold text-slate-900' :
								 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}"
						>
							{#if isComplete}
								✓
							{:else}
								{i + 1}
							{/if}
						</div>
						<div class="mt-2 text-xs font-medium {isCurrent ? 'text-white' : 'text-slate-400'}">
							{stage.label}
						</div>
						<div class="text-xs text-slate-500">{stage.description}</div>
					</button>
					{#if i < workflowStages.length - 1}
						<div
							class="absolute top-5 left-1/2 w-full h-0.5 -z-10
								{i < currentIndex ? 'bg-solarpunk-teal' : 'bg-slate-800'}"
						></div>
					{/if}
				</div>
			{/each}
		</div>
		{#if edition.status !== 'ARCHIVED'}
			<div class="flex justify-end">
				<button
					on:click={() => updateStatus('ARCHIVED')}
					disabled={isUpdating}
					class="text-sm text-slate-500 hover:text-red-400"
				>
					Archive Edition
				</button>
			</div>
		{/if}
	</div>

	<div class="grid lg:grid-cols-3 gap-8">
		<!-- Articles -->
		<div class="lg:col-span-2">
			<div class="card">
				<div class="flex items-center justify-between mb-4">
					<h2 class="font-orbitron font-bold">Articles ({edition.articles.length})</h2>
					<a href="/admin/articles/new?editionId={edition.id}" class="text-sm text-solarpunk-teal hover:underline">
						+ Add Article
					</a>
				</div>
				<div class="space-y-3">
					{#each edition.articles as article, i}
						<a
							href="/admin/articles/{article.id}"
							class="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
						>
							<div class="w-8 h-8 bg-slate-700 rounded flex items-center justify-center text-sm text-slate-400">
								{i + 1}
							</div>
							<div class="flex-1 min-w-0">
								<div class="font-medium truncate">{article.title}</div>
								<div class="flex items-center gap-2 text-xs text-slate-500">
									{#if article.author}
										<span>{article.author.name}</span>
										<span>·</span>
									{/if}
									{#if article.section}
										<span class="px-1.5 py-0.5 bg-slate-700 rounded">{article.section}</span>
									{/if}
									{#if article.readTime}
										<span>{article.readTime} min read</span>
									{/if}
								</div>
							</div>
							<span class="text-xs px-2 py-1 rounded-full {contentStatusColors[article.status]}">
								{article.status}
							</span>
						</a>
					{:else}
						<p class="text-slate-500 text-sm py-4 text-center">No articles yet</p>
					{/each}
				</div>
			</div>

			<!-- Promoted Posts -->
			{#if edition.promotedPosts.length > 0}
				<div class="card mt-6">
					<h2 class="font-orbitron font-bold mb-4">Promoted from Greenhouse</h2>
					<div class="space-y-3">
						{#each edition.promotedPosts as post}
							<a
								href="/admin/posts/{post.id}"
								class="flex items-center gap-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors"
							>
								<div class="flex-1 min-w-0">
									<div class="font-medium truncate">{post.title}</div>
									<div class="text-xs text-slate-500">
										{#if post.author}
											{post.author.name}
										{/if}
									</div>
								</div>
								<span class="text-xs text-orange-400">Promoted</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Edition Details -->
			<div class="card">
				<h3 class="font-medium mb-4">Details</h3>
				<dl class="space-y-3 text-sm">
					{#if edition.tagline}
						<div>
							<dt class="text-slate-500">Tagline</dt>
							<dd class="text-slate-300">{edition.tagline}</dd>
						</div>
					{/if}
					<div>
						<dt class="text-slate-500">Slug</dt>
						<dd class="font-mono text-slate-300">{edition.slug}</dd>
					</div>
					{#if edition.launchDate}
						<div>
							<dt class="text-slate-500">Launch Date</dt>
							<dd class="text-slate-300">{new Date(edition.launchDate).toLocaleDateString()}</dd>
						</div>
					{/if}
					{#if edition.publishedAt}
						<div>
							<dt class="text-slate-500">Published</dt>
							<dd class="text-green-400">{new Date(edition.publishedAt).toLocaleDateString()}</dd>
						</div>
					{/if}
					<div>
						<dt class="text-slate-500">Print Edition</dt>
						<dd class="{edition.printEnabled ? 'text-green-400' : 'text-slate-500'}">
							{edition.printEnabled ? 'Enabled' : 'Disabled'}
						</dd>
					</div>
				</dl>
			</div>

			<!-- Submissions -->
			<div class="card">
				<div class="flex items-center justify-between mb-4">
					<h3 class="font-medium">Submissions ({edition.submissions.length})</h3>
					<a href="/admin/submissions?editionId={edition.id}" class="text-xs text-solarpunk-teal hover:underline">
						View all
					</a>
				</div>
				<div class="space-y-2">
					{#each edition.submissions.slice(0, 5) as submission}
						<a
							href="/admin/submissions/{submission.id}"
							class="block p-2 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors"
						>
							<div class="text-sm font-medium truncate">{submission.title}</div>
							<div class="text-xs text-slate-500">
								{submission.submitter.name || submission.submitter.email}
							</div>
						</a>
					{:else}
						<p class="text-slate-500 text-sm">No submissions yet</p>
					{/each}
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="card bg-gradient-to-b from-slate-800/50 to-slate-900/50">
				<h3 class="font-medium mb-4">Actions</h3>
				<div class="space-y-2">
					<a
						href="/editions/{edition.slug}"
						target="_blank"
						class="block w-full text-center py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition-colors"
					>
						Preview Edition →
					</a>
					{#if edition.printEnabled}
						<button
							class="block w-full text-center py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition-colors"
						>
							Generate Print PDF
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
