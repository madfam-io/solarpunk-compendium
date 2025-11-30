<script lang="ts">
	import { goto } from '$app/navigation';

	let isSubmitting = false;
	let error = '';

	let formData = {
		title: '',
		season: 'WINTER' as 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL',
		year: new Date().getFullYear() + 1,
		tagline: '',
		description: '',
		coverImage: '',
		callOpenAt: '',
		callCloseAt: '',
		launchDate: '',
		printEnabled: false
	};

	// Calculate suggested dates based on season
	$: {
		const year = formData.year;
		const seasonDates: Record<string, { call: string; close: string; launch: string }> = {
			WINTER: {
				call: `${year - 1}-10-01`,
				close: `${year - 1}-11-30`,
				launch: `${year - 1}-12-21`
			},
			SPRING: {
				call: `${year}-01-01`,
				close: `${year}-02-28`,
				launch: `${year}-03-20`
			},
			SUMMER: {
				call: `${year}-04-01`,
				close: `${year}-05-31`,
				launch: `${year}-06-21`
			},
			FALL: {
				call: `${year}-07-01`,
				close: `${year}-08-31`,
				launch: `${year}-09-22`
			}
		};

		if (!formData.callOpenAt && !formData.callCloseAt && !formData.launchDate) {
			const dates = seasonDates[formData.season];
			formData.callOpenAt = dates.call;
			formData.callCloseAt = dates.close;
			formData.launchDate = dates.launch;
		}
	}

	async function handleSubmit() {
		isSubmitting = true;
		error = '';

		try {
			const res = await fetch('/api/admin/editions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					callOpenAt: formData.callOpenAt ? new Date(formData.callOpenAt).toISOString() : null,
					callCloseAt: formData.callCloseAt ? new Date(formData.callCloseAt).toISOString() : null,
					launchDate: formData.launchDate ? new Date(formData.launchDate).toISOString() : null,
					tagline: formData.tagline || null,
					description: formData.description || null,
					coverImage: formData.coverImage || null
				})
			});

			if (res.ok) {
				const data = await res.json();
				goto(`/admin/editions/${data.data.id}`);
			} else {
				const data = await res.json();
				error = data.message || 'Failed to create edition';
			}
		} catch (err) {
			error = 'An error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>New Edition | Solstice CMS</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<a href="/admin/editions" class="text-sm text-slate-400 hover:text-white mb-2 inline-block">
			← Back to Editions
		</a>
		<h1 class="font-orbitron text-3xl font-bold">New Edition</h1>
		<p class="text-slate-400">Create a new seasonal flagship publication</p>
	</div>

	{#if error}
		<div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
			{error}
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<!-- Season & Year -->
		<div class="grid md:grid-cols-2 gap-6">
			<div>
				<label for="season" class="block text-sm font-medium text-slate-300 mb-2">Season</label>
				<select
					id="season"
					bind:value={formData.season}
					class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
				>
					<option value="WINTER">Winter Solstice</option>
					<option value="SPRING">Spring Equinox</option>
					<option value="SUMMER">Summer Solstice</option>
					<option value="FALL">Fall Equinox</option>
				</select>
			</div>
			<div>
				<label for="year" class="block text-sm font-medium text-slate-300 mb-2">Year</label>
				<input
					type="number"
					id="year"
					bind:value={formData.year}
					min="2020"
					max="2100"
					class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
				/>
			</div>
		</div>

		<!-- Title -->
		<div>
			<label for="title" class="block text-sm font-medium text-slate-300 mb-2">Title</label>
			<input
				type="text"
				id="title"
				bind:value={formData.title}
				placeholder="e.g., Solarpunk Almanac: Winter 2026"
				required
				class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
			/>
		</div>

		<!-- Tagline -->
		<div>
			<label for="tagline" class="block text-sm font-medium text-slate-300 mb-2">Tagline</label>
			<input
				type="text"
				id="tagline"
				bind:value={formData.tagline}
				placeholder="A brief, catchy description"
				maxlength="300"
				class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
			/>
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="block text-sm font-medium text-slate-300 mb-2">Description</label>
			<textarea
				id="description"
				bind:value={formData.description}
				rows="4"
				placeholder="Full description of this edition's theme and focus..."
				class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
			></textarea>
		</div>

		<!-- Cover Image -->
		<div>
			<label for="coverImage" class="block text-sm font-medium text-slate-300 mb-2">Cover Image URL</label>
			<input
				type="url"
				id="coverImage"
				bind:value={formData.coverImage}
				placeholder="https://..."
				class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-solarpunk-teal focus:border-transparent"
			/>
		</div>

		<!-- Dates -->
		<div class="card bg-slate-800/50">
			<h3 class="font-medium mb-4">Workflow Dates</h3>
			<div class="grid md:grid-cols-3 gap-4">
				<div>
					<label for="callOpenAt" class="block text-sm text-slate-400 mb-2">
						Call Opens
					</label>
					<input
						type="date"
						id="callOpenAt"
						bind:value={formData.callOpenAt}
						class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
					/>
				</div>
				<div>
					<label for="callCloseAt" class="block text-sm text-slate-400 mb-2">
						Call Closes
					</label>
					<input
						type="date"
						id="callCloseAt"
						bind:value={formData.callCloseAt}
						class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
					/>
				</div>
				<div>
					<label for="launchDate" class="block text-sm text-slate-400 mb-2">
						Launch Date
					</label>
					<input
						type="date"
						id="launchDate"
						bind:value={formData.launchDate}
						class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
					/>
				</div>
			</div>
		</div>

		<!-- Print Options -->
		<div class="card bg-slate-800/50">
			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={formData.printEnabled}
					class="w-5 h-5 rounded accent-solarpunk-teal"
				/>
				<div>
					<span class="font-medium">Enable Print Edition</span>
					<p class="text-sm text-slate-400">Generate print-ready PDF for physical distribution</p>
				</div>
			</label>
		</div>

		<!-- Actions -->
		<div class="flex gap-4 pt-4">
			<button
				type="submit"
				disabled={isSubmitting}
				class="btn-primary flex-1"
			>
				{isSubmitting ? 'Creating...' : 'Create Edition'}
			</button>
			<a href="/admin/editions" class="btn-ghost">Cancel</a>
		</div>
	</form>
</div>
