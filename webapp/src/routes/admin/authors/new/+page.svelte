<script lang="ts">
	import { goto } from '$app/navigation';

	let isSubmitting = false;
	let error = '';

	let formData = {
		name: '',
		bio: '',
		avatar: '',
		website: '',
		location: '',
		twitter: '',
		mastodon: '',
		instagram: '',
		linkedin: ''
	};

	async function handleSubmit() {
		isSubmitting = true;
		error = '';

		try {
			const social: Record<string, string> = {};
			if (formData.twitter) social.twitter = formData.twitter;
			if (formData.mastodon) social.mastodon = formData.mastodon;
			if (formData.instagram) social.instagram = formData.instagram;
			if (formData.linkedin) social.linkedin = formData.linkedin;

			const res = await fetch('/api/admin/authors', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name,
					bio: formData.bio || null,
					avatar: formData.avatar || null,
					website: formData.website || null,
					location: formData.location || null,
					social: Object.keys(social).length > 0 ? social : null
				})
			});

			if (res.ok) {
				const data = await res.json();
				goto(`/admin/authors/${data.data.id}`);
			} else {
				const data = await res.json();
				error = data.message || 'Failed to create author';
			}
		} catch (err) {
			error = 'An error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>New Author | Solstice CMS</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<a href="/admin/authors" class="text-sm text-slate-400 hover:text-white mb-2 inline-block">
			← Back to Authors
		</a>
		<h1 class="font-orbitron text-3xl font-bold">New Author</h1>
		<p class="text-slate-400">Create a new contributor profile</p>
	</div>

	{#if error}
		<div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
			{error}
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<div class="card">
			<h2 class="font-medium mb-4">Profile Information</h2>
			<div class="space-y-4">
				<!-- Name -->
				<div>
					<label for="name" class="block text-sm font-medium text-slate-300 mb-2">
						Name <span class="text-red-400">*</span>
					</label>
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						required
						placeholder="Full name"
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

		<!-- Actions -->
		<div class="flex gap-4">
			<button
				type="submit"
				disabled={isSubmitting}
				class="btn-primary flex-1"
			>
				{isSubmitting ? 'Creating...' : 'Create Author'}
			</button>
			<a href="/admin/authors" class="btn-ghost">Cancel</a>
		</div>
	</form>
</div>
