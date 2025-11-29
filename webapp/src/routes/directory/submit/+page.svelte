<script lang="ts">
	import { goto } from '$app/navigation';
	import { user, isAuthenticated } from '$lib/stores/auth';

	// Form state
	let name = '';
	let tagline = '';
	let description = '';
	let website = '';
	let location = '';
	let coverImage = '';
	let selectedCategories: string[] = [];
	let selectedSdgs: number[] = [];
	let tags = '';

	let isSubmitting = false;
	let error = '';
	let step = 1;

	// Category options
	const categories = [
		{ id: 'energy', name: 'Energy', icon: '⚡' },
		{ id: 'food', name: 'Food & Agriculture', icon: '🌾' },
		{ id: 'housing', name: 'Housing', icon: '🏠' },
		{ id: 'transport', name: 'Transport', icon: '🚲' },
		{ id: 'community', name: 'Community', icon: '🤝' },
		{ id: 'tech', name: 'Technology', icon: '💻' },
		{ id: 'education', name: 'Education', icon: '📚' },
		{ id: 'art', name: 'Art & Culture', icon: '🎨' }
	];

	// SDG options
	const sdgs = [
		{ id: 1, name: 'No Poverty', color: '#E5243B' },
		{ id: 2, name: 'Zero Hunger', color: '#DDA63A' },
		{ id: 3, name: 'Good Health', color: '#4C9F38' },
		{ id: 4, name: 'Quality Education', color: '#C5192D' },
		{ id: 5, name: 'Gender Equality', color: '#FF3A21' },
		{ id: 6, name: 'Clean Water', color: '#26BDE2' },
		{ id: 7, name: 'Clean Energy', color: '#FCC30B' },
		{ id: 8, name: 'Decent Work', color: '#A21942' },
		{ id: 9, name: 'Innovation', color: '#FD6925' },
		{ id: 10, name: 'Reduced Inequalities', color: '#DD1367' },
		{ id: 11, name: 'Sustainable Cities', color: '#FD9D24' },
		{ id: 12, name: 'Responsible Consumption', color: '#BF8B2E' },
		{ id: 13, name: 'Climate Action', color: '#3F7E44' },
		{ id: 14, name: 'Life Below Water', color: '#0A97D9' },
		{ id: 15, name: 'Life on Land', color: '#56C02B' },
		{ id: 16, name: 'Peace & Justice', color: '#00689D' },
		{ id: 17, name: 'Partnerships', color: '#19486A' }
	];

	function toggleCategory(id: string) {
		if (selectedCategories.includes(id)) {
			selectedCategories = selectedCategories.filter((c) => c !== id);
		} else if (selectedCategories.length < 5) {
			selectedCategories = [...selectedCategories, id];
		}
	}

	function toggleSdg(id: number) {
		if (selectedSdgs.includes(id)) {
			selectedSdgs = selectedSdgs.filter((s) => s !== id);
		} else {
			selectedSdgs = [...selectedSdgs, id];
		}
	}

	function nextStep() {
		if (step === 1) {
			if (!name || name.length < 2) {
				error = 'Project name must be at least 2 characters';
				return;
			}
			if (!tagline || tagline.length < 10) {
				error = 'Tagline must be at least 10 characters';
				return;
			}
			if (!description || description.length < 50) {
				error = 'Description must be at least 50 characters';
				return;
			}
		}
		if (step === 2) {
			if (selectedCategories.length === 0) {
				error = 'Select at least one category';
				return;
			}
			if (selectedSdgs.length === 0) {
				error = 'Select at least one SDG';
				return;
			}
		}
		error = '';
		step++;
	}

	function prevStep() {
		error = '';
		step--;
	}

	async function handleSubmit() {
		error = '';
		isSubmitting = true;

		try {
			const response = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					tagline,
					description,
					website: website || null,
					location: location || null,
					coverImage: coverImage || null,
					categoryIds: selectedCategories,
					sdgIds: selectedSdgs,
					tags: tags
						.split(',')
						.map((t) => t.trim())
						.filter((t) => t)
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to submit project');
			}

			const { data } = await response.json();
			await goto(`/directory/${data.slug}?submitted=true`);
		} catch (err: any) {
			error = err.message || 'Failed to submit project';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Submit a Project | The Solarpunk Almanac</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-12">
	<!-- Header -->
	<div class="text-center mb-8">
		<h1 class="font-orbitron text-3xl font-bold mb-2">
			Submit a <span class="gradient-text">Project</span>
		</h1>
		<p class="text-slate-400">
			Share a project that's building regenerative futures. All submissions are reviewed before publishing.
		</p>
	</div>

	{#if !$isAuthenticated}
		<!-- Not logged in -->
		<div class="card text-center py-12">
			<div class="text-5xl mb-4">🔒</div>
			<h2 class="text-xl font-bold mb-2">Sign in required</h2>
			<p class="text-slate-400 mb-6">You need to be signed in to submit a project.</p>
			<a href="/login?redirect=/directory/submit" class="btn-primary">
				Sign in to continue
			</a>
		</div>
	{:else}
		<!-- Progress steps -->
		<div class="flex items-center justify-center gap-2 mb-8">
			{#each [1, 2, 3] as s}
				<div
					class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
						{step >= s ? 'bg-solarpunk-teal text-slate-900' : 'bg-slate-800 text-slate-500'}"
				>
					{s}
				</div>
				{#if s < 3}
					<div class="w-16 h-1 rounded {step > s ? 'bg-solarpunk-teal' : 'bg-slate-800'}"></div>
				{/if}
			{/each}
		</div>

		<!-- Error message -->
		{#if error}
			<div class="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
				{error}
			</div>
		{/if}

		<div class="card">
			<!-- Step 1: Basic Info -->
			{#if step === 1}
				<h2 class="font-orbitron text-xl font-bold mb-6">Basic Information</h2>

				<div class="space-y-6">
					<div>
						<label for="name" class="block text-sm font-medium text-slate-300 mb-2">
							Project Name <span class="text-red-400">*</span>
						</label>
						<input
							id="name"
							type="text"
							bind:value={name}
							class="input"
							placeholder="e.g., Solar Village Collective"
							maxlength="100"
						/>
					</div>

					<div>
						<label for="tagline" class="block text-sm font-medium text-slate-300 mb-2">
							Tagline <span class="text-red-400">*</span>
							<span class="text-slate-500 font-normal">({tagline.length}/200)</span>
						</label>
						<input
							id="tagline"
							type="text"
							bind:value={tagline}
							class="input"
							placeholder="A brief, compelling description of what the project does"
							maxlength="200"
						/>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-slate-300 mb-2">
							Description <span class="text-red-400">*</span>
							<span class="text-slate-500 font-normal">({description.length}/5000)</span>
						</label>
						<textarea
							id="description"
							bind:value={description}
							class="input min-h-[200px]"
							placeholder="Describe the project in detail. What does it do? Who does it serve? What impact has it had?"
							maxlength="5000"
						></textarea>
					</div>

					<div class="grid md:grid-cols-2 gap-4">
						<div>
							<label for="website" class="block text-sm font-medium text-slate-300 mb-2">
								Website
							</label>
							<input
								id="website"
								type="url"
								bind:value={website}
								class="input"
								placeholder="https://..."
							/>
						</div>
						<div>
							<label for="location" class="block text-sm font-medium text-slate-300 mb-2">
								Location
							</label>
							<input
								id="location"
								type="text"
								bind:value={location}
								class="input"
								placeholder="e.g., Berlin, Germany"
							/>
						</div>
					</div>

					<div>
						<label for="coverImage" class="block text-sm font-medium text-slate-300 mb-2">
							Cover Image URL
						</label>
						<input
							id="coverImage"
							type="url"
							bind:value={coverImage}
							class="input"
							placeholder="https://... (recommended: 800x400)"
						/>
						{#if coverImage}
							<img src={coverImage} alt="Preview" class="mt-2 rounded-lg max-h-40 object-cover" />
						{/if}
					</div>
				</div>

				<div class="flex justify-end mt-8">
					<button on:click={nextStep} class="btn-primary">
						Continue
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			{/if}

			<!-- Step 2: Categories & SDGs -->
			{#if step === 2}
				<h2 class="font-orbitron text-xl font-bold mb-6">Categories & SDGs</h2>

				<div class="space-y-8">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-3">
							Categories <span class="text-red-400">*</span>
							<span class="text-slate-500 font-normal">(select up to 5)</span>
						</label>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
							{#each categories as cat}
								<button
									type="button"
									on:click={() => toggleCategory(cat.id)}
									class="p-3 rounded-lg text-left transition-all
										{selectedCategories.includes(cat.id)
											? 'bg-solarpunk-teal/20 border-solarpunk-teal/50 border-2'
											: 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'}"
								>
									<span class="text-xl">{cat.icon}</span>
									<span class="block text-sm mt-1">{cat.name}</span>
								</button>
							{/each}
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-3">
							UN Sustainable Development Goals <span class="text-red-400">*</span>
						</label>
						<p class="text-sm text-slate-500 mb-3">
							Which SDGs does this project contribute to?
						</p>
						<div class="flex flex-wrap gap-2">
							{#each sdgs as sdg}
								<button
									type="button"
									on:click={() => toggleSdg(sdg.id)}
									class="w-10 h-10 rounded-full text-sm font-bold transition-all
										{selectedSdgs.includes(sdg.id)
											? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
											: 'opacity-60 hover:opacity-100'}"
									style="background-color: {sdg.color}"
									title="{sdg.id}. {sdg.name}"
								>
									{sdg.id}
								</button>
							{/each}
						</div>
						{#if selectedSdgs.length > 0}
							<div class="mt-3 text-sm text-slate-400">
								Selected: {selectedSdgs.map((id) => sdgs.find((s) => s.id === id)?.name).join(', ')}
							</div>
						{/if}
					</div>

					<div>
						<label for="tags" class="block text-sm font-medium text-slate-300 mb-2">
							Tags <span class="text-slate-500 font-normal">(comma-separated)</span>
						</label>
						<input
							id="tags"
							type="text"
							bind:value={tags}
							class="input"
							placeholder="e.g., solar, microgrids, rural development"
						/>
					</div>
				</div>

				<div class="flex justify-between mt-8">
					<button on:click={prevStep} class="btn-secondary">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M19 12H5M12 19l-7-7 7-7" />
						</svg>
						Back
					</button>
					<button on:click={nextStep} class="btn-primary">
						Continue
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			{/if}

			<!-- Step 3: Review & Submit -->
			{#if step === 3}
				<h2 class="font-orbitron text-xl font-bold mb-6">Review & Submit</h2>

				<div class="space-y-6">
					<!-- Preview card -->
					<div class="bg-slate-800/50 rounded-lg p-6">
						{#if coverImage}
							<img src={coverImage} alt={name} class="w-full h-40 object-cover rounded-lg mb-4" />
						{/if}
						<h3 class="font-orbitron font-bold text-lg">{name}</h3>
						{#if location}
							<p class="text-sm text-slate-500 mt-1">📍 {location}</p>
						{/if}
						<p class="text-slate-400 mt-2">{tagline}</p>

						<div class="flex flex-wrap gap-2 mt-4">
							{#each selectedCategories as catId}
								{@const cat = categories.find((c) => c.id === catId)}
								{#if cat}
									<span class="badge-teal">{cat.icon} {cat.name}</span>
								{/if}
							{/each}
						</div>

						<div class="flex gap-1 mt-3">
							{#each selectedSdgs as sdgId}
								{@const sdg = sdgs.find((s) => s.id === sdgId)}
								{#if sdg}
									<span
										class="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
										style="background-color: {sdg.color}"
										title={sdg.name}
									>
										{sdg.id}
									</span>
								{/if}
							{/each}
						</div>
					</div>

					<div class="bg-slate-800/30 rounded-lg p-4">
						<h4 class="font-medium mb-2">Description</h4>
						<p class="text-sm text-slate-400 whitespace-pre-wrap">{description}</p>
					</div>

					{#if website}
						<div class="flex items-center gap-2 text-sm">
							<span class="text-slate-500">Website:</span>
							<a href={website} target="_blank" class="text-solarpunk-teal hover:underline">{website}</a>
						</div>
					{/if}

					<div class="bg-solar-gold/10 border border-solar-gold/20 rounded-lg p-4">
						<p class="text-sm text-solar-gold">
							<strong>Note:</strong> Your submission will be reviewed by our team before publishing.
							This usually takes 1-3 business days.
						</p>
					</div>
				</div>

				<div class="flex justify-between mt-8">
					<button on:click={prevStep} class="btn-secondary">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M19 12H5M12 19l-7-7 7-7" />
						</svg>
						Back
					</button>
					<button
						on:click={handleSubmit}
						disabled={isSubmitting}
						class="btn-primary disabled:opacity-50"
					>
						{#if isSubmitting}
							<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Submitting...
						{:else}
							Submit Project
						{/if}
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
