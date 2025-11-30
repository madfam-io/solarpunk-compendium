<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ post, editions, authors } = data);

	let isUpdating = false;
	let isSaving = false;
	let message = '';
	let activeTab: 'edit' | 'preview' = 'edit';

	let formData = {
		title: post.title,
		excerpt: post.excerpt || '',
		content: post.content,
		coverImage: post.coverImage || '',
		type: post.type,
		seasonalAffinity: post.seasonalAffinity || '',
		authorId: post.authorId || '',
		featured: post.featured,
		tags: post.tags?.join(', ') || ''
	};

	let promoteToEditionId = post.promotedToId || '';

	const statusColors: Record<string, string> = {
		SEED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
		GROWING: 'bg-green-500/20 text-green-400 border-green-500/30',
		HARVEST: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
		PRESERVE: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
	};

	const workflowStages = [
		{ key: 'SEED', label: 'Seed', description: 'Draft' },
		{ key: 'GROWING', label: 'Growing', description: 'Review' },
		{ key: 'HARVEST', label: 'Harvest', description: 'Featured' }
	];

	const postTypes = [
		{ value: 'COMMUNITY', label: 'Community Post' },
		{ value: 'GUIDE', label: 'How-To Guide' },
		{ value: 'NEWS', label: 'News/Announcement' },
		{ value: 'EVENT', label: 'Event' },
		{ value: 'RESOURCE', label: 'Resource/Tool' },
		{ value: 'PROFILE', label: 'Profile/Interview' }
	];

	const seasons = [
		{ value: '', label: 'No seasonal affinity' },
		{ value: 'WINTER', label: 'Winter' },
		{ value: 'SPRING', label: 'Spring' },
		{ value: 'SUMMER', label: 'Summer' },
		{ value: 'FALL', label: 'Fall' }
	];

	async function updateStatus(newStatus: string) {
		isUpdating = true;
		message = '';

		try {
			const res = await fetch(`/api/admin/posts/${post.id}`, {
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

	async function savePost() {
		isSaving = true;
		message = '';

		const tags = formData.tags
			.split(',')
			.map((t) => t.trim())
			.filter((t) => t.length > 0);

		try {
			const res = await fetch(`/api/admin/posts/${post.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formData.title,
					excerpt: formData.excerpt || null,
					content: formData.content,
					coverImage: formData.coverImage || null,
					type: formData.type,
					seasonalAffinity: formData.seasonalAffinity || null,
					authorId: formData.authorId || null,
					featured: formData.featured,
					tags,
					promoteToEditionId: promoteToEditionId || null
				})
			});

			if (res.ok) {
				message = 'Post saved successfully';
				await invalidateAll();
			} else {
				const data = await res.json();
				message = data.message || 'Failed to save post';
			}
		} catch (err) {
			message = 'An error occurred';
		} finally {
			isSaving = false;
		}
	}

	async function deletePost() {
		if (!confirm('Are you sure you want to delete this post?')) return;

		try {
			const res = await fetch(`/api/admin/posts/${post.id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				goto('/admin/posts');
			} else {
				const data = await res.json();
				message = data.message || 'Failed to delete post';
			}
		} catch (err) {
			message = 'An error occurred';
		}
	}

	function getStageIndex(status: string): number {
		return workflowStages.findIndex((s) => s.key === status);
	}
</script>

<svelte:head>
	<title>{post.title} | Greenhouse | Solstice CMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex items-start justify-between mb-6">
		<div>
			<a href="/admin/posts" class="text-sm text-slate-400 hover:text-white mb-2 inline-block">
				← Back to Greenhouse
			</a>
			<h1 class="font-orbitron text-2xl font-bold">{post.title}</h1>
			<div class="flex items-center gap-3 mt-2 text-sm text-slate-400">
				<span class="px-2 py-0.5 bg-slate-800 rounded">{post.type}</span>
				{#if post.readTime}
					<span>·</span>
					<span>{post.readTime} min read</span>
				{/if}
				{#if post.featured}
					<span class="text-solarpunk-gold">★ Featured</span>
				{/if}
			</div>
		</div>
		<span class="text-xs px-3 py-1.5 rounded-full border {statusColors[post.status]}">
			{post.status}
		</span>
	</div>

	{#if message}
		<div class="mb-6 p-4 bg-slate-800 rounded-lg text-sm">
			{message}
		</div>
	{/if}

	<!-- Workflow Progress -->
	<div class="card mb-6">
		<div class="flex items-center justify-between">
			{#each workflowStages as stage, i}
				{@const currentIndex = getStageIndex(post.status)}
				{@const isComplete = i < currentIndex}
				{@const isCurrent = i === currentIndex}
				<div class="flex-1 relative">
					<button
						on:click={() => updateStatus(stage.key)}
						disabled={isUpdating || post.status === 'PRESERVE'}
						class="w-full text-center group"
					>
						<div
							class="w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors text-sm
								{isComplete ? 'bg-green-500 text-slate-900' :
								 isCurrent ? 'bg-solarpunk-gold text-slate-900' :
								 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}"
						>
							{#if isComplete}
								✓
							{:else}
								{i + 1}
							{/if}
						</div>
						<div class="mt-1 text-xs {isCurrent ? 'text-white' : 'text-slate-500'}">
							{stage.label}
						</div>
					</button>
					{#if i < workflowStages.length - 1}
						<div
							class="absolute top-4 left-1/2 w-full h-0.5 -z-10
								{i < currentIndex ? 'bg-green-500' : 'bg-slate-800'}"
						></div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Main Editor -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Tabs -->
			<div class="flex gap-2 border-b border-slate-800">
				<button
					on:click={() => (activeTab = 'edit')}
					class="px-4 py-2 text-sm border-b-2 transition-colors
						{activeTab === 'edit' ? 'border-green-400 text-white' : 'border-transparent text-slate-400 hover:text-white'}"
				>
					Edit
				</button>
				<button
					on:click={() => (activeTab = 'preview')}
					class="px-4 py-2 text-sm border-b-2 transition-colors
						{activeTab === 'preview' ? 'border-green-400 text-white' : 'border-transparent text-slate-400 hover:text-white'}"
				>
					Preview
				</button>
			</div>

			{#if activeTab === 'edit'}
				<div class="space-y-4">
					<!-- Title -->
					<div>
						<label for="title" class="block text-sm font-medium text-slate-300 mb-2">Title</label>
						<input
							type="text"
							id="title"
							bind:value={formData.title}
							class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
						/>
					</div>

					<!-- Excerpt -->
					<div>
						<label for="excerpt" class="block text-sm font-medium text-slate-300 mb-2">Excerpt</label>
						<textarea
							id="excerpt"
							bind:value={formData.excerpt}
							rows="2"
							class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
						></textarea>
					</div>

					<!-- Content -->
					<div>
						<label for="content" class="block text-sm font-medium text-slate-300 mb-2">
							Content (Markdown)
						</label>
						<textarea
							id="content"
							bind:value={formData.content}
							rows="16"
							class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-400 focus:border-transparent"
						></textarea>
					</div>

					<!-- Tags -->
					<div>
						<label for="tags" class="block text-sm font-medium text-slate-300 mb-2">Tags</label>
						<input
							type="text"
							id="tags"
							bind:value={formData.tags}
							placeholder="solar, community, diy (comma-separated)"
							class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
						/>
					</div>
				</div>
			{:else}
				<!-- Preview -->
				<div class="card prose prose-invert max-w-none">
					<h1>{formData.title}</h1>
					{#if formData.excerpt}
						<p class="lead">{formData.excerpt}</p>
					{/if}
					<div class="whitespace-pre-wrap">{formData.content}</div>
				</div>
			{/if}

			<!-- Save Button -->
			<div class="flex gap-4">
				<button
					on:click={savePost}
					disabled={isSaving}
					class="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
				>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Settings -->
			<div class="card">
				<h3 class="font-medium mb-4">Post Settings</h3>
				<div class="space-y-4">
					<!-- Cover Image -->
					<div>
						<label for="coverImage" class="block text-sm text-slate-400 mb-2">Cover Image URL</label>
						<input
							type="url"
							id="coverImage"
							bind:value={formData.coverImage}
							placeholder="https://..."
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
						/>
					</div>

					<!-- Type -->
					<div>
						<label for="type" class="block text-sm text-slate-400 mb-2">Post Type</label>
						<select
							id="type"
							bind:value={formData.type}
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
						>
							{#each postTypes as type}
								<option value={type.value}>{type.label}</option>
							{/each}
						</select>
					</div>

					<!-- Author -->
					<div>
						<label for="authorId" class="block text-sm text-slate-400 mb-2">Author</label>
						<select
							id="authorId"
							bind:value={formData.authorId}
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
						>
							<option value="">No author</option>
							{#each authors as author}
								<option value={author.id}>{author.name}</option>
							{/each}
						</select>
					</div>

					<!-- Seasonal Affinity -->
					<div>
						<label for="seasonalAffinity" class="block text-sm text-slate-400 mb-2">Seasonal Affinity</label>
						<select
							id="seasonalAffinity"
							bind:value={formData.seasonalAffinity}
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
						>
							{#each seasons as season}
								<option value={season.value}>{season.label}</option>
							{/each}
						</select>
					</div>

					<!-- Featured -->
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={formData.featured}
							class="w-4 h-4 rounded accent-green-400"
						/>
						<span class="text-sm">Featured post</span>
					</label>
				</div>
			</div>

			<!-- Promotion -->
			<div class="card border-orange-500/20">
				<h3 class="font-medium mb-4 text-orange-400">Promote to Edition</h3>
				<p class="text-xs text-slate-500 mb-3">
					Elevate this greenhouse post to a flagship edition
				</p>
				<select
					bind:value={promoteToEditionId}
					class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
				>
					<option value="">Not promoted</option>
					{#each editions as edition}
						<option value={edition.id}>
							{edition.season} {edition.year}
						</option>
					{/each}
				</select>
				{#if post.promotedAt}
					<p class="text-xs text-orange-400 mt-2">
						Promoted on {new Date(post.promotedAt).toLocaleDateString()}
					</p>
				{/if}
			</div>

			<!-- Info -->
			<div class="card">
				<h3 class="font-medium mb-4">Info</h3>
				<dl class="space-y-2 text-sm">
					<div class="flex justify-between">
						<dt class="text-slate-500">Slug</dt>
						<dd class="font-mono text-slate-300">{post.slug}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-slate-500">Created</dt>
						<dd class="text-slate-300">{new Date(post.createdAt).toLocaleDateString()}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-slate-500">Updated</dt>
						<dd class="text-slate-300">{new Date(post.updatedAt).toLocaleDateString()}</dd>
					</div>
				</dl>
			</div>

			<!-- Actions -->
			<div class="card bg-slate-800/50">
				<h3 class="font-medium mb-4">Actions</h3>
				<div class="space-y-2">
					<button
						on:click={() => updateStatus('PRESERVE')}
						class="block w-full text-center py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition-colors"
					>
						Archive Post
					</button>
					<button
						on:click={deletePost}
						class="block w-full text-center py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
					>
						Delete Post
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
