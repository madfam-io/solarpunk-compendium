<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ author } = data);

	let isSaving = false;
	let message = '';

	let formData = {
		name: author.name,
		bio: author.bio || '',
		avatar: author.avatar || '',
		website: author.website || '',
		location: author.location || '',
		twitter: (author.social as Record<string, string>)?.twitter || '',
		mastodon: (author.social as Record<string, string>)?.mastodon || '',
		instagram: (author.social as Record<string, string>)?.instagram || '',
		linkedin: (author.social as Record<string, string>)?.linkedin || ''
	};

	async function saveAuthor() {
		isSaving = true;
		message = '';

		try {
			const res = await fetch(`/api/admin/authors/${author.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name,
					bio: formData.bio || null,
					avatar: formData.avatar || null,
					website: formData.website || null,
					location: formData.location || null,
					social: {
						twitter: formData.twitter || undefined,
						mastodon: formData.mastodon || undefined,
						instagram: formData.instagram || undefined,
						linkedin: formData.linkedin || undefined
					}
				})
			});

			if (res.ok) {
				message = 'Author saved successfully';
				await invalidateAll();
			} else {
				const data = await res.json();
				message = data.message || 'Failed to save author';
			}
		} catch (err) {
			message = 'An error occurred';
		} finally {
			isSaving = false;
		}
	}

	async function deleteAuthor() {
		if (!confirm('Are you sure you want to delete this author? This cannot be undone.')) return;

		try {
			const res = await fetch(`/api/admin/authors/${author.id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				goto('/admin/authors');
			} else {
				const data = await res.json();
				message = data.message || 'Failed to delete author';
			}
		} catch (err) {
			message = 'An error occurred';
		}
	}
</script>

<svelte:head>
	<title>{author.name} | Authors | Solstice CMS</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex items-start justify-between mb-8">
		<div>
			<a href="/admin/authors" class="text-sm text-slate-400 hover:text-white mb-2 inline-block">
				← Back to Authors
			</a>
			<div class="flex items-center gap-4">
				<div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
					{#if author.avatar}
						<img src={author.avatar} alt={author.name} class="w-full h-full object-cover" />
					{:else}
						<span class="text-2xl text-slate-500">
							{author.name.charAt(0).toUpperCase()}
						</span>
					{/if}
				</div>
				<div>
					<h1 class="font-orbitron text-2xl font-bold">{author.name}</h1>
					{#if author.location}
						<p class="text-slate-400">{author.location}</p>
					{/if}
				</div>
			</div>
		</div>
		{#if author.user}
			<span class="text-xs px-3 py-1.5 rounded-full bg-green-500/20 text-green-400">
				Linked to {author.user.email}
			</span>
		{/if}
	</div>

	{#if message}
		<div class="mb-6 p-4 bg-slate-800 rounded-lg text-sm">
			{message}
		</div>
	{/if}

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Main Form -->
		<div class="lg:col-span-2 space-y-6">
			<div class="card">
				<h2 class="font-medium mb-4">Profile Information</h2>
				<div class="space-y-4">
					<!-- Name -->
					<div>
						<label for="name" class="block text-sm font-medium text-slate-300 mb-2">Name</label>
						<input
							type="text"
							id="name"
							bind:value={formData.name}
							required
							class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
						/>
					</div>

					<!-- Bio -->
					<div>
						<label for="bio" class="block text-sm font-medium text-slate-300 mb-2">Bio</label>
						<textarea
							id="bio"
							bind:value={formData.bio}
							rows="4"
							placeholder="A brief bio about this author..."
							class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
						></textarea>
					</div>

					<!-- Location -->
					<div>
						<label for="location" class="block text-sm font-medium text-slate-300 mb-2">Location</label>
						<input
							type="text"
							id="location"
							bind:value={formData.location}
							placeholder="City, Country"
							class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
						/>
					</div>

					<div class="grid md:grid-cols-2 gap-4">
						<!-- Avatar -->
						<div>
							<label for="avatar" class="block text-sm font-medium text-slate-300 mb-2">Avatar URL</label>
							<input
								type="url"
								id="avatar"
								bind:value={formData.avatar}
								placeholder="https://..."
								class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
							/>
						</div>

						<!-- Website -->
						<div>
							<label for="website" class="block text-sm font-medium text-slate-300 mb-2">Website</label>
							<input
								type="url"
								id="website"
								bind:value={formData.website}
								placeholder="https://..."
								class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Social Links -->
			<div class="card">
				<h2 class="font-medium mb-4">Social Links</h2>
				<div class="grid md:grid-cols-2 gap-4">
					<div>
						<label for="twitter" class="block text-sm text-slate-400 mb-2">Twitter/X</label>
						<input
							type="text"
							id="twitter"
							bind:value={formData.twitter}
							placeholder="@username"
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
						/>
					</div>
					<div>
						<label for="mastodon" class="block text-sm text-slate-400 mb-2">Mastodon</label>
						<input
							type="text"
							id="mastodon"
							bind:value={formData.mastodon}
							placeholder="@user@instance.social"
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
						/>
					</div>
					<div>
						<label for="instagram" class="block text-sm text-slate-400 mb-2">Instagram</label>
						<input
							type="text"
							id="instagram"
							bind:value={formData.instagram}
							placeholder="@username"
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
						/>
					</div>
					<div>
						<label for="linkedin" class="block text-sm text-slate-400 mb-2">LinkedIn</label>
						<input
							type="text"
							id="linkedin"
							bind:value={formData.linkedin}
							placeholder="linkedin.com/in/username"
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
						/>
					</div>
				</div>
			</div>

			<!-- Save Button -->
			<button
				on:click={saveAuthor}
				disabled={isSaving}
				class="btn-primary w-full"
			>
				{isSaving ? 'Saving...' : 'Save Changes'}
			</button>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Stats -->
			<div class="card">
				<h3 class="font-medium mb-4">Content Stats</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-slate-500">Articles</dt>
						<dd class="font-medium">{author._count.articles}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-slate-500">Posts</dt>
						<dd class="font-medium">{author._count.posts}</dd>
					</div>
				</dl>
				{#if author._count.articles > 0 || author._count.posts > 0}
					<div class="mt-4 pt-4 border-t border-slate-800 space-y-2">
						{#if author._count.articles > 0}
							<a
								href="/admin/articles?authorId={author.id}"
								class="block text-sm text-solarpunk-teal hover:underline"
							>
								View articles →
							</a>
						{/if}
						{#if author._count.posts > 0}
							<a
								href="/admin/posts?authorId={author.id}"
								class="block text-sm text-green-400 hover:underline"
							>
								View posts →
							</a>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Info -->
			<div class="card">
				<h3 class="font-medium mb-4">Info</h3>
				<dl class="space-y-2 text-sm">
					<div class="flex justify-between">
						<dt class="text-slate-500">Slug</dt>
						<dd class="font-mono text-slate-300">{author.slug}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-slate-500">Created</dt>
						<dd class="text-slate-300">{new Date(author.createdAt).toLocaleDateString()}</dd>
					</div>
				</dl>
			</div>

			<!-- Danger Zone -->
			<div class="card border-red-500/20">
				<h3 class="font-medium mb-4 text-red-400">Danger Zone</h3>
				<p class="text-xs text-slate-500 mb-3">
					Deleting an author will remove their profile but keep their content (articles/posts will show as "No author").
				</p>
				<button
					on:click={deleteAuthor}
					disabled={author._count.articles > 0 || author._count.posts > 0}
					class="w-full py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if author._count.articles > 0 || author._count.posts > 0}
						Cannot delete (has content)
					{:else}
						Delete Author
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
