<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ editions, authors } = data);

	// Pre-select edition if passed in URL
	$: preselectedEditionId = $page.url.searchParams.get('editionId') || '';

	let isSubmitting = false;
	let error = '';

	let formData = {
		editionId: preselectedEditionId,
		title: '',
		subtitle: '',
		excerpt: '',
		content: `# Article Title

Write your content here using Markdown...

## Section Heading

Paragraph text goes here.

> A blockquote for emphasis

- List item one
- List item two
- List item three
`,
		coverImage: '',
		authorId: '',
		section: '',
		featured: false
	};

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

	async function handleSubmit() {
		if (!formData.editionId) {
			error = 'Please select an edition';
			return;
		}

		isSubmitting = true;
		error = '';

		try {
			const res = await fetch('/api/admin/articles', {
				method: 'POST',
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
				const data = await res.json();
				goto(`/admin/articles/${data.data.id}`);
			} else {
				const data = await res.json();
				error = data.message || 'Failed to create article';
			}
		} catch (err) {
			error = 'An error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>New Article | Solstice CMS</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<a href="/admin/articles" class="text-sm text-slate-400 hover:text-white mb-2 inline-block">
			← Back to Articles
		</a>
		<h1 class="font-orbitron text-3xl font-bold">New Article</h1>
		<p class="text-slate-400">Create a new flagship edition article</p>
	</div>

	{#if error}
		<div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
			{error}
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="grid lg:grid-cols-3 gap-6">
		<!-- Main Content -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Edition Selection -->
			<div>
				<label for="editionId" class="block text-sm font-medium text-slate-300 mb-2">
					Edition <span class="text-red-400">*</span>
				</label>
				<select
					id="editionId"
					bind:value={formData.editionId}
					required
					class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
				>
					<option value="">Select an edition...</option>
					{#each editions as edition}
						<option value={edition.id}>
							{edition.season} {edition.year} - {edition.title}
						</option>
					{/each}
				</select>
			</div>

			<!-- Title -->
			<div>
				<label for="title" class="block text-sm font-medium text-slate-300 mb-2">
					Title <span class="text-red-400">*</span>
				</label>
				<input
					type="text"
					id="title"
					bind:value={formData.title}
					required
					placeholder="Article title"
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
					placeholder="Optional subtitle"
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
					placeholder="Brief description for listings and SEO"
					class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
				></textarea>
			</div>

			<!-- Content -->
			<div>
				<label for="content" class="block text-sm font-medium text-slate-300 mb-2">
					Content (Markdown) <span class="text-red-400">*</span>
				</label>
				<textarea
					id="content"
					bind:value={formData.content}
					required
					rows="20"
					class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
				></textarea>
				<p class="text-xs text-slate-500 mt-2">
					Supports Markdown: # headers, **bold**, *italic*, [links](url), ![images](url), > quotes, - lists, ``` code blocks
				</p>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Settings -->
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
						<a href="/admin/authors/new" class="text-xs text-solarpunk-teal hover:underline mt-1 inline-block">
							+ Create new author
						</a>
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

			<!-- Submit -->
			<div class="space-y-3">
				<button
					type="submit"
					disabled={isSubmitting}
					class="btn-primary w-full"
				>
					{isSubmitting ? 'Creating...' : 'Create Article'}
				</button>
				<a href="/admin/articles" class="btn-ghost w-full text-center block">
					Cancel
				</a>
			</div>
		</div>
	</form>
</div>
