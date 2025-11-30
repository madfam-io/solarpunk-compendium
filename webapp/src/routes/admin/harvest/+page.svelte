<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ items, pagination, sources, stats, filters } = data);

	let selectedItems: string[] = [];
	let isProcessing = false;
	let message = '';

	const statusColors: Record<string, string> = {
		PENDING: 'bg-yellow-500/20 text-yellow-400',
		APPROVED: 'bg-green-500/20 text-green-400',
		REJECTED: 'bg-red-500/20 text-red-400',
		PUBLISHED: 'bg-blue-500/20 text-blue-400',
		DUPLICATE: 'bg-slate-500/20 text-slate-400',
		NEEDS_INFO: 'bg-orange-500/20 text-orange-400'
	};

	const qualityColors = (q: number) => {
		if (q >= 80) return 'text-green-400';
		if (q >= 60) return 'text-yellow-400';
		if (q >= 40) return 'text-orange-400';
		return 'text-red-400';
	};

	function updateFilters(key: string, value: string) {
		const params = new URLSearchParams($page.url.searchParams);
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		params.delete('page');
		goto(`/admin/harvest?${params.toString()}`);
	}

	function toggleSelect(id: string) {
		if (selectedItems.includes(id)) {
			selectedItems = selectedItems.filter((i) => i !== id);
		} else {
			selectedItems = [...selectedItems, id];
		}
	}

	function selectAll() {
		if (selectedItems.length === items.length) {
			selectedItems = [];
		} else {
			selectedItems = items.map((i: typeof items[number]) => i.id);
		}
	}

	async function updateStatus(status: string) {
		if (selectedItems.length === 0) return;

		isProcessing = true;
		try {
			const res = await fetch('/api/admin/harvest/queue', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: selectedItems, status })
			});

			if (res.ok) {
				const data = await res.json();
				message = `Updated ${data.updated} items to ${status}`;
				selectedItems = [];
				await invalidateAll();
			} else {
				message = 'Error updating items';
			}
		} finally {
			isProcessing = false;
		}
	}

	async function runHarvest(slug: string) {
		isProcessing = true;
		message = `Running harvest for ${slug}...`;

		try {
			const res = await fetch('/api/admin/harvest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'harvest', sourceSlug: slug })
			});

			if (res.ok) {
				const data = await res.json();
				message = `Harvested ${data.stats.itemsCreated} new items from ${slug}`;
				await invalidateAll();
			} else {
				message = 'Harvest failed';
			}
		} finally {
			isProcessing = false;
		}
	}

	async function publishApproved() {
		isProcessing = true;
		message = 'Publishing approved items...';

		try {
			const res = await fetch('/api/admin/harvest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'publish' })
			});

			if (res.ok) {
				const data = await res.json();
				message = `Published ${data.published} items`;
				await invalidateAll();
			} else {
				message = 'Publish failed';
			}
		} finally {
			isProcessing = false;
		}
	}

	async function initSources() {
		isProcessing = true;
		try {
			const res = await fetch('/api/admin/harvest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'initialize' })
			});

			if (res.ok) {
				message = 'Sources initialized';
				await invalidateAll();
			}
		} finally {
			isProcessing = false;
		}
	}
</script>

<svelte:head>
	<title>Content Harvest Queue | Admin</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="font-orbitron text-3xl font-bold">Content Harvest</h1>
			<p class="text-slate-400">Manage incoming content from external sources</p>
		</div>
		<div class="flex gap-3">
			<button on:click={initSources} disabled={isProcessing} class="btn-ghost text-sm">
				Initialize Sources
			</button>
			<button
				on:click={publishApproved}
				disabled={isProcessing || stats.totals.approved === 0}
				class="btn-primary text-sm"
			>
				Publish {stats.totals.approved} Approved
			</button>
		</div>
	</div>

	<!-- Message -->
	{#if message}
		<div class="mb-4 p-3 bg-slate-800 rounded-lg text-sm">
			{message}
		</div>
	{/if}

	<!-- Stats -->
	<div class="grid grid-cols-5 gap-4 mb-8">
		<button
			on:click={() => updateFilters('status', 'PENDING')}
			class="card text-center hover:border-yellow-500/30 transition-colors
				{filters.status === 'PENDING' ? 'border-yellow-500/50' : ''}"
		>
			<div class="text-2xl font-bold text-yellow-400">{stats.totals.pending}</div>
			<div class="text-xs text-slate-500">Pending</div>
		</button>
		<button
			on:click={() => updateFilters('status', 'APPROVED')}
			class="card text-center hover:border-green-500/30 transition-colors
				{filters.status === 'APPROVED' ? 'border-green-500/50' : ''}"
		>
			<div class="text-2xl font-bold text-green-400">{stats.totals.approved}</div>
			<div class="text-xs text-slate-500">Approved</div>
		</button>
		<button
			on:click={() => updateFilters('status', 'REJECTED')}
			class="card text-center hover:border-red-500/30 transition-colors
				{filters.status === 'REJECTED' ? 'border-red-500/50' : ''}"
		>
			<div class="text-2xl font-bold text-red-400">{stats.totals.rejected}</div>
			<div class="text-xs text-slate-500">Rejected</div>
		</button>
		<button
			on:click={() => updateFilters('status', 'PUBLISHED')}
			class="card text-center hover:border-blue-500/30 transition-colors
				{filters.status === 'PUBLISHED' ? 'border-blue-500/50' : ''}"
		>
			<div class="text-2xl font-bold text-blue-400">{stats.totals.published}</div>
			<div class="text-xs text-slate-500">Published</div>
		</button>
		<button
			on:click={() => updateFilters('status', '')}
			class="card text-center hover:border-slate-500/30 transition-colors
				{!filters.status || filters.status === 'ALL' ? 'border-slate-500/50' : ''}"
		>
			<div class="text-2xl font-bold">{stats.totals.total}</div>
			<div class="text-xs text-slate-500">Total</div>
		</button>
	</div>

	<div class="grid lg:grid-cols-4 gap-8">
		<!-- Sources Sidebar -->
		<div class="space-y-4">
			<h2 class="font-orbitron font-bold">Sources</h2>
			<div class="space-y-2">
				{#each sources as source}
					<div
						class="card p-3 {filters.sourceId === source.id ? 'border-solarpunk-teal/50' : ''}"
					>
						<div class="flex items-center justify-between mb-2">
							<button
								on:click={() =>
									updateFilters('source', filters.sourceId === source.id ? '' : source.id)}
								class="font-medium text-sm hover:text-solarpunk-teal"
							>
								{source.name}
							</button>
						</div>
						<button
							on:click={() => runHarvest(source.slug)}
							disabled={isProcessing}
							class="text-xs text-solarpunk-teal hover:underline"
						>
							Run Harvest
						</button>
					</div>
				{/each}
			</div>
		</div>

		<!-- Queue -->
		<div class="lg:col-span-3">
			<!-- Bulk actions -->
			{#if selectedItems.length > 0}
				<div class="mb-4 p-3 bg-slate-800 rounded-lg flex items-center gap-4">
					<span class="text-sm">{selectedItems.length} selected</span>
					<button on:click={() => updateStatus('APPROVED')} class="btn-ghost text-sm text-green-400">
						Approve
					</button>
					<button on:click={() => updateStatus('REJECTED')} class="btn-ghost text-sm text-red-400">
						Reject
					</button>
					<button on:click={() => (selectedItems = [])} class="btn-ghost text-sm">
						Clear
					</button>
				</div>
			{/if}

			<!-- Items table -->
			<div class="card overflow-hidden">
				<table class="w-full">
					<thead class="bg-slate-800/50">
						<tr>
							<th class="p-3 text-left">
								<input
									type="checkbox"
									checked={selectedItems.length === items.length && items.length > 0}
									on:change={selectAll}
									class="accent-solarpunk-teal"
								/>
							</th>
							<th class="p-3 text-left text-sm font-medium text-slate-400">Content</th>
							<th class="p-3 text-left text-sm font-medium text-slate-400">Source</th>
							<th class="p-3 text-left text-sm font-medium text-slate-400">Quality</th>
							<th class="p-3 text-left text-sm font-medium text-slate-400">Status</th>
							<th class="p-3 text-left text-sm font-medium text-slate-400">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each items as item (item.id)}
							{@const normalized = item.normalized || {}}
							<tr class="border-t border-slate-800 hover:bg-slate-800/30">
								<td class="p-3">
									<input
										type="checkbox"
										checked={selectedItems.includes(item.id)}
										on:change={() => toggleSelect(item.id)}
										class="accent-solarpunk-teal"
									/>
								</td>
								<td class="p-3">
									<div class="font-medium text-sm">
										{normalized.name || normalized.title || 'Untitled'}
									</div>
									<div class="text-xs text-slate-500 truncate max-w-xs">
										{normalized.tagline || normalized.excerpt || ''}
									</div>
									{#if item.externalUrl}
										<a
											href={item.externalUrl}
											target="_blank"
											class="text-xs text-solarpunk-teal hover:underline"
										>
											View source
										</a>
									{/if}
								</td>
								<td class="p-3">
									<span class="text-xs text-slate-400">{item.source.name}</span>
								</td>
								<td class="p-3">
									<span class="font-mono text-sm {qualityColors(item.quality)}">
										{item.quality}
									</span>
								</td>
								<td class="p-3">
									<span class="text-xs px-2 py-1 rounded-full {statusColors[item.status]}">
										{item.status}
									</span>
								</td>
								<td class="p-3">
									<div class="flex gap-2">
										{#if item.status === 'PENDING'}
											<button
												on:click={() => {
													selectedItems = [item.id];
													updateStatus('APPROVED');
												}}
												class="text-xs text-green-400 hover:underline"
											>
												Approve
											</button>
											<button
												on:click={() => {
													selectedItems = [item.id];
													updateStatus('REJECTED');
												}}
												class="text-xs text-red-400 hover:underline"
											>
												Reject
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="p-8 text-center text-slate-500">
									No items in queue
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if pagination.totalPages > 1}
				<div class="flex justify-center gap-2 mt-6">
					{#each Array(pagination.totalPages) as _, i}
						<button
							on:click={() => {
								const params = new URLSearchParams($page.url.searchParams);
								params.set('page', String(i + 1));
								goto(`/admin/harvest?${params.toString()}`);
							}}
							class="w-8 h-8 rounded text-sm
								{pagination.page === i + 1
								? 'bg-solarpunk-teal text-slate-900'
								: 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
						>
							{i + 1}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
