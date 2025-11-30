<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ authors } = data);

	let isSubmitting = false;
	let error = '';

	let formData = {
		title: '',
		excerpt: '',
		content: `# Post Title

Write your content here...

## Section

Add your sections, paragraphs, lists, and more.

- Point one
- Point two
- Point three
`,
		coverImage: '',
		type: 'COMMUNITY' as const,
		seasonalAffinity: '',
		authorId: '',
		featured: false,
		tags: ''
	};

	const postTypes = [
		{ value: 'COMMUNITY', label: 'Community Post', description: 'General community content' },
		{ value: 'GUIDE', label: 'How-To Guide', description: 'Tutorial or instructional content' },
		{ value: 'NEWS', label: 'News/Announcement', description: 'Timely news or updates' },
		{ value: 'EVENT', label: 'Event', description: 'Community event or gathering' },
		{ value: 'RESOURCE', label: 'Resource/Tool', description: 'Useful tool or resource' },
		{ value: 'PROFILE', label: 'Profile/Interview', description: 'Person or project profile' }
	];

	const seasons = [
		{ value: '', label: 'No seasonal affinity' },
		{ value: 'WINTER', label: 'Winter - Best during winter months' },
		{ value: 'SPRING', label: 'Spring - Best during spring months' },
		{ value: 'SUMMER', label: 'Summer - Best during summer months' },
		{ value: 'FALL', label: 'Fall - Best during fall months' }
	];

	async function handleSubmit() {
		isSubmitting = true;
		error = '';

		const tags = formData.tags
			.split(',')
			.map((t) => t.trim())
			.filter((t) => t.length > 0);

		try {
			const res = await fetch('/api/admin/posts', {
				method: 'POST',
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
					tags
				})
			});

			if (res.ok) {
				const data = await res.json();
				goto(`/admin/posts/${data.data.id}`);
			} else {
				const data = await res.json();
				error = data.message || 'Failed to create post';
			}
		} catch (err) {
			error = 'An error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>New Post | Greenhouse | Solstice CMS</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<a href="/admin/posts" class="text-sm text-slate-400 hover:text-white mb-2 inline-block">
			← Back to Greenhouse
		</a>
		<h1 class="font-orbitron text-3xl font-bold">
			<span class="text-green-400">❋</span> New Post
		</h1>
		<p class="text-slate-400">Create new evergreen community content</p>
	</div>

	{#if error}
		<div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
			{error}
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="grid lg:grid-cols-3 gap-6">
		<!-- Main Content -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Post Type -->
			<div>
				<label class="block text-sm font-medium text-slate-300 mb-3">
					Post Type <span class="text-red-400">*</span>
				</label>
				<div class="grid grid-cols-2 md:grid-cols-3 gap-3">
					{#each postTypes as type}
						<button
							type="button"
							on:click={() => (formData.type = type.value)}
							class="p-3 rounded-lg border text-left transition-colors
								{formData.type === type.value
								? 'border-green-500/50 bg-green-500/10'
								: 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}"
						>
							<div class="font-medium text-sm">{type.label}</div>
							<div class="text-xs text-slate-500 mt-1">{type.description}</div>
						</button>
					{/each}
				</div>
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
					placeholder="Post title"
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
					placeholder="Brief description for listings"
					class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
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
					rows="16"
					class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-400 focus:border-transparent"
				></textarea>
				<p class="text-xs text-slate-500 mt-2">
					Supports Markdown: # headers, **bold**, *italic*, [links](url), ![images](url), > quotes, - lists
				</p>
			</div>

			<!-- Tags -->
			<div>
				<label for="tags" class="block text-sm font-medium text-slate-300 mb-2">Tags</label>
				<input
					type="text"
					id="tags"
					bind:value={formData.tags}
					placeholder="solar, community, diy, garden (comma-separated)"
					class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
				/>
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
						<a href="/admin/authors/new" class="text-xs text-green-400 hover:underline mt-1 inline-block">
							+ Create new author
						</a>
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
						<p class="text-xs text-slate-500 mt-1">
							Content with seasonal affinity is highlighted during that season
						</p>
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

			<!-- Submit -->
			<div class="space-y-3">
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
				>
					{isSubmitting ? 'Creating...' : 'Create Post'}
				</button>
				<a href="/admin/posts" class="btn-ghost w-full text-center block">
					Cancel
				</a>
			</div>
		</div>
	</form>
</div>
