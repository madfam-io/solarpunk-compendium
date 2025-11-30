<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ editions, user } = data);

	let isSubmitting = false;
	let submitted = false;
	let error = '';

	let formData = {
		editionId: '',
		title: '',
		pitch: '',
		outline: ''
	};

	const seasonColors: Record<string, string> = {
		WINTER: 'border-blue-500/30 hover:border-blue-500/50',
		SPRING: 'border-green-500/30 hover:border-green-500/50',
		SUMMER: 'border-yellow-500/30 hover:border-yellow-500/50',
		FALL: 'border-orange-500/30 hover:border-orange-500/50'
	};

	const seasonTextColors: Record<string, string> = {
		WINTER: 'text-blue-400',
		SPRING: 'text-green-400',
		SUMMER: 'text-yellow-400',
		FALL: 'text-orange-400'
	};

	async function handleSubmit() {
		if (!formData.editionId) {
			error = 'Please select an edition';
			return;
		}

		isSubmitting = true;
		error = '';

		try {
			const res = await fetch('/api/submissions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					editionId: formData.editionId,
					title: formData.title,
					pitch: formData.pitch,
					outline: formData.outline || null
				})
			});

			if (res.ok) {
				submitted = true;
			} else {
				const data = await res.json();
				error = data.message || 'Failed to submit';
			}
		} catch (err) {
			error = 'An error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Submit to the Almanac | Solarpunk Compendium</title>
	<meta name="description" content="Submit your article idea for consideration in an upcoming Solarpunk Almanac edition" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		{#if submitted}
			<!-- Success State -->
			<div class="text-center">
				<div class="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
					<span class="text-4xl">✓</span>
				</div>
				<h1 class="font-orbitron text-3xl font-bold mb-4">Submission Received!</h1>
				<p class="text-slate-400 max-w-md mx-auto mb-8">
					Thank you for your submission. Our editorial team will review your pitch and get back to you within 2-3 weeks.
				</p>
				<div class="flex justify-center gap-4">
					<a href="/" class="btn-primary">Back to Home</a>
					<button on:click={() => { submitted = false; formData = { editionId: '', title: '', pitch: '', outline: '' }; }} class="btn-ghost">
						Submit Another
					</button>
				</div>
			</div>
		{:else}
			<!-- Header -->
			<div class="text-center mb-12">
				<h1 class="font-orbitron text-4xl font-bold mb-4">
					Submit to the <span class="text-solarpunk-gold">Almanac</span>
				</h1>
				<p class="text-xl text-slate-400 max-w-2xl mx-auto">
					Share your ideas, stories, and expertise with the solarpunk community.
					We're looking for articles that inspire, educate, and envision sustainable futures.
				</p>
			</div>

			{#if !user}
				<!-- Login Required -->
				<div class="card text-center py-12">
					<div class="text-4xl mb-4">🔐</div>
					<h2 class="font-orbitron text-xl font-bold mb-2">Sign in to Submit</h2>
					<p class="text-slate-400 mb-6">
						Create an account or sign in to submit your article idea
					</p>
					<div class="flex justify-center gap-4">
						<a href="/login?redirect=/submit" class="btn-primary">Sign In</a>
						<a href="/signup?redirect=/submit" class="btn-ghost">Create Account</a>
					</div>
				</div>
			{:else if editions.length === 0}
				<!-- No Open Editions -->
				<div class="card text-center py-12">
					<div class="text-4xl mb-4">📅</div>
					<h2 class="font-orbitron text-xl font-bold mb-2">No Open Calls</h2>
					<p class="text-slate-400 mb-6">
						There are currently no editions accepting submissions.
						Check back soon or subscribe to be notified when calls open.
					</p>
					<a href="/subscribe" class="btn-primary">Subscribe for Updates</a>
				</div>
			{:else}
				<!-- Submission Form -->
				{#if error}
					<div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
						{error}
					</div>
				{/if}

				<form on:submit|preventDefault={handleSubmit} class="space-y-8">
					<!-- Edition Selection -->
					<div>
						<label class="block text-lg font-medium text-slate-300 mb-4">
							Select an Edition <span class="text-red-400">*</span>
						</label>
						<div class="grid md:grid-cols-2 gap-4">
							{#each editions as edition}
								<button
									type="button"
									on:click={() => (formData.editionId = edition.id)}
									class="p-6 rounded-lg border-2 text-left transition-all
										{formData.editionId === edition.id
										? 'border-solarpunk-gold bg-solarpunk-gold/10'
										: seasonColors[edition.season] + ' bg-slate-800/50'}"
								>
									<div class="flex items-center gap-3 mb-2">
										<span class="font-orbitron font-bold text-lg {seasonTextColors[edition.season]}">
											{edition.season}
										</span>
										<span class="text-slate-400">{edition.year}</span>
									</div>
									<h3 class="font-medium text-white mb-1">{edition.title}</h3>
									{#if edition.tagline}
										<p class="text-sm text-slate-400">{edition.tagline}</p>
									{/if}
									{#if edition.callCloseAt}
										<p class="text-xs text-slate-500 mt-3">
											Submissions close: {new Date(edition.callCloseAt).toLocaleDateString()}
										</p>
									{/if}
								</button>
							{/each}
						</div>
					</div>

					<!-- Title -->
					<div>
						<label for="title" class="block text-lg font-medium text-slate-300 mb-2">
							Article Title <span class="text-red-400">*</span>
						</label>
						<input
							type="text"
							id="title"
							bind:value={formData.title}
							required
							placeholder="Your proposed article title"
							class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent text-lg"
						/>
					</div>

					<!-- Pitch -->
					<div>
						<label for="pitch" class="block text-lg font-medium text-slate-300 mb-2">
							Your Pitch <span class="text-red-400">*</span>
						</label>
						<p class="text-sm text-slate-500 mb-3">
							Tell us what your article is about and why it's a good fit for this edition (200-500 words)
						</p>
						<textarea
							id="pitch"
							bind:value={formData.pitch}
							required
							rows="6"
							placeholder="Describe your article idea, its main points, and why it matters to the solarpunk community..."
							class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
						></textarea>
					</div>

					<!-- Outline (Optional) -->
					<div>
						<label for="outline" class="block text-lg font-medium text-slate-300 mb-2">
							Outline <span class="text-slate-500 text-sm font-normal">(optional)</span>
						</label>
						<p class="text-sm text-slate-500 mb-3">
							If you have a rough outline or structure in mind, share it here
						</p>
						<textarea
							id="outline"
							bind:value={formData.outline}
							rows="8"
							placeholder="1. Introduction&#10;2. Main section one&#10;3. Main section two&#10;4. Conclusion..."
							class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent font-mono text-sm"
						></textarea>
					</div>

					<!-- Guidelines -->
					<div class="card bg-slate-800/50">
						<h3 class="font-medium mb-3">Submission Guidelines</h3>
						<ul class="text-sm text-slate-400 space-y-2">
							<li>• Articles should be 1,500-4,000 words</li>
							<li>• Focus on practical, actionable, or visionary content</li>
							<li>• Original work only — no previously published content</li>
							<li>• We pay a modest honorarium for accepted articles</li>
							<li>• Response time is typically 2-3 weeks</li>
						</ul>
					</div>

					<!-- Submit -->
					<button
						type="submit"
						disabled={isSubmitting || !formData.editionId}
						class="btn-primary w-full py-4 text-lg"
					>
						{isSubmitting ? 'Submitting...' : 'Submit Pitch'}
					</button>
				</form>
			{/if}
		{/if}
	</div>
</div>
