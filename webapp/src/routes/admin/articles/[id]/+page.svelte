<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ article, editions, authors } = data);

	let isUpdating = false;
	let isSaving = false;
	let message = '';
	let activeTab: 'edit' | 'preview' = 'edit';

	let formData = {
		title: article.title,
		subtitle: article.subtitle || '',
		excerpt: article.excerpt || '',
		content: article.content,
		coverImage: article.coverImage || '',
		authorId: article.authorId || '',
		section: article.section || '',
		featured: article.featured,
		order: article.order
	};

	const statusColors: Record<string, string> = {
		SEED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
		GROWING: 'bg-green-500/20 text-green-400 border-green-500/30',
		HARVEST: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
		PUBLISHED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
		PRESERVE: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
	};

	const workflowStages = [
		{ key: 'SEED', label: 'Seed', description: 'Draft in development' },
		{ key: 'GROWING', label: 'Growing', description: 'Under review' },
		{ key: 'HARVEST', label: 'Harvest', description: 'Ready for edition' },
		{ key: 'PUBLISHED', label: 'Published', description: 'Live in edition' }
	];

	const sections = [
		{ value: '', label: 'No section' },
		{ value: 'OVERVIEW', label: 'Overview' },
		{ value: 'GROW', label: 'Grow - Food & Agriculture' },
		{ value: 'BUILD', label: 'Build - Shelter & Infrastructure' },
		{ value: 'POWER', label: 'Power - Energy & Technology' },
		{ value: 'CONNECT', label: 'Connect - Community & Organizing' },
		{ value: 'THRIVE', label: 'Thrive - Health & Wellbeing' },
		{ value: 'CREATE', label: 'Create - Art & Culture' },
		{ value: 'LEARN', label: 'Learn - Education & Skills' }
	];

	async function updateStatus(newStatus: string) {
		isUpdating = true;
		message = '';

		try {
			const res = await fetch(`/api/admin/articles/${article.id}`, {
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

	async function saveArticle() {
		isSaving = true;
		message = '';

		try {
			const res = await fetch(`/api/admin/articles/${article.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					subtitle: formData.subtitle || null,
					excerpt: formData.excerpt || null,
					coverImage: formData.coverImage || null,
					authorId: formData.authorId || null,
					section: formData.section || null
				})
			});

			if (res.ok) {
				message = 'Article saved successfully';
				await invalidateAll();
			} else {
				const data = await res.json();
				message = data.message || 'Failed to save article';
			}
		} catch (err) {
			message = 'An error occurred';
		} finally {
			isSaving = false;
		}
	}

	async function deleteArticle() {
		if (!confirm('Are you sure you want to delete this article?')) return;

		try {
			const res = await fetch(`/api/admin/articles/${article.id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				goto('/admin/articles');
			} else {
				const data = await res.json();
				message = data.message || 'Failed to delete article';
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
	<title>{article.title} | Solstice CMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex items-start justify-between mb-6">
		<div>
			<a href="/admin/articles" class="text-sm text-slate-400 hover:text-white mb-2 inline-block">
				← Back to Articles
			</a>
			<h1 class="font-orbitron text-2xl font-bold">{article.title}</h1>
			<div class="flex items-center gap-3 mt-2 text-sm text-slate-400">
				{#if article.edition}
					<a href="/admin/editions/{article.edition.id}" class="hover:text-solarpunk-teal">
						{article.edition.season} {article.edition.year}
					</a>
					<span>·</span>
				{/if}
				<span>{article.readTime} min read</span>
				{#if article.featured}
					<span class="text-solarpunk-gold">★ Featured</span>
				{/if}
			</div>
		</div>
		<div class="flex items-center gap-3">
			<span class="text-xs px-3 py-1.5 rounded-full border {statusColors[article.status]}">
				{article.status}
			</span>
		</div>
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
				{@const currentIndex = getStageIndex(article.status)}
				{@const isComplete = i < currentIndex}
				{@const isCurrent = i === currentIndex}
				<div class="flex-1 relative">
					<button
						on:click={() => updateStatus(stage.key)}
						disabled={isUpdating || article.status === 'PRESERVE'}
						class="w-full text-center group"
					>
						<div
							class="w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors text-sm
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
						<div class="mt-1 text-xs {isCurrent ? 'text-white' : 'text-slate-500'}">
							{stage.label}
						</div>
					</button>
					{#if i < workflowStages.length - 1}
						<div
							class="absolute top-4 left-1/2 w-full h-0.5 -z-10
								{i < currentIndex ? 'bg-solarpunk-teal' : 'bg-slate-800'}"
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
						{activeTab === 'edit' ? 'border-solarpunk-teal text-white' : 'border-transparent text-slate-400 hover:text-white'}"
				>
					Edit
				</button>
				<button
					on:click={() => (activeTab = 'preview')}
					class="px-4 py-2 text-sm border-b-2 transition-colors
						{activeTab === 'preview' ? 'border-solarpunk-teal text-white' : 'border-transparent text-slate-400 hover:text-white'}"
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
							class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
						/>
					</div>

					<!-- Subtitle -->
					<div>
						<label for="subtitle" class="block text-sm font-medium text-slate-300 mb-2">Subtitle</label>
						<input
							type="text"
							id="subtitle"
							bind:value={formData.subtitle}
							class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
						/>
					</div>

					<!-- Excerpt -->
					<div>
						<label for="excerpt" class="block text-sm font-medium text-slate-300 mb-2">Excerpt</label>
						<textarea
							id="excerpt"
							bind:value={formData.excerpt}
							rows="2"
							class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
						></textarea>
					</div>

					<!-- Content -->
					<div>
						<label for="content" class="block text-sm font-medium text-slate-300 mb-2">
							Content (MDX)
						</label>
						<textarea
							id="content"
							bind:value={formData.content}
							rows="20"
							class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
						></textarea>
					</div>
				</div>
			{:else}
				<!-- Preview -->
				<div class="card prose prose-invert max-w-none">
					<h1>{formData.title}</h1>
					{#if formData.subtitle}
						<p class="lead">{formData.subtitle}</p>
					{/if}
					<div class="whitespace-pre-wrap">{formData.content}</div>
				</div>
			{/if}

			<!-- Save Button -->
			<div class="flex gap-4">
				<button
					on:click={saveArticle}
					disabled={isSaving}
					class="btn-primary flex-1"
				>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Metadata -->
			<div class="card">
				<h3 class="font-medium mb-4">Article Settings</h3>
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

					<!-- Section -->
					<div>
						<label for="section" class="block text-sm text-slate-400 mb-2">Section</label>
						<select
							id="section"
							bind:value={formData.section}
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
						>
							{#each sections as section}
								<option value={section.value}>{section.label}</option>
							{/each}
						</select>
					</div>

					<!-- Order -->
					<div>
						<label for="order" class="block text-sm text-slate-400 mb-2">Order in Edition</label>
						<input
							type="number"
							id="order"
							bind:value={formData.order}
							min="0"
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
						/>
					</div>

					<!-- Featured -->
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={formData.featured}
							class="w-4 h-4 rounded accent-solarpunk-teal"
						/>
						<span class="text-sm">Featured article</span>
					</label>
				</div>
			</div>

			<!-- Info -->
			<div class="card">
				<h3 class="font-medium mb-4">Info</h3>
				<dl class="space-y-2 text-sm">
					<div class="flex justify-between">
						<dt class="text-slate-500">Slug</dt>
						<dd class="font-mono text-slate-300">{article.slug}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-slate-500">Read Time</dt>
						<dd class="text-slate-300">{article.readTime} min</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-slate-500">Created</dt>
						<dd class="text-slate-300">{new Date(article.createdAt).toLocaleDateString()}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-slate-500">Updated</dt>
						<dd class="text-slate-300">{new Date(article.updatedAt).toLocaleDateString()}</dd>
					</div>
					{#if article.publishedAt}
						<div class="flex justify-between">
							<dt class="text-slate-500">Published</dt>
							<dd class="text-green-400">{new Date(article.publishedAt).toLocaleDateString()}</dd>
						</div>
					{/if}
				</dl>
			</div>

			<!-- Actions -->
			<div class="card bg-slate-800/50">
				<h3 class="font-medium mb-4">Actions</h3>
				<div class="space-y-2">
					{#if article.edition}
						<a
							href="/editions/{article.edition.slug}/{article.slug}"
							target="_blank"
							class="block w-full text-center py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition-colors"
						>
							Preview Article →
						</a>
					{/if}
					{#if article.status !== 'PUBLISHED'}
						<button
							on:click={deleteArticle}
							class="block w-full text-center py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
						>
							Delete Article
						</button>
					{:else}
						<button
							on:click={() => updateStatus('PRESERVE')}
							class="block w-full text-center py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition-colors"
						>
							Archive Article
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
