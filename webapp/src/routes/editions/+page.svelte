<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';

	export let data;

	$: ({ currentEdition, pastEditions } = data);

	const seasons: Record<string, { name: string; color: string; icon: string; months: string }> = {
		spring: { name: 'Spring', color: 'bg-green-500', icon: '🌱', months: 'Mar-May' },
		summer: { name: 'Summer', color: 'bg-yellow-500', icon: '☀️', months: 'Jun-Aug' },
		autumn: { name: 'Autumn', color: 'bg-orange-500', icon: '🍂', months: 'Sep-Nov' },
		winter: { name: 'Winter', color: 'bg-blue-500', icon: '❄️', months: 'Dec-Feb' }
	};

	function getStatusBadge(status: string) {
		switch (status) {
			case 'published':
				return { class: 'badge-green', text: 'Available' };
			case 'coming_soon':
				return { class: 'badge-gold', text: 'Coming Soon' };
			case 'draft':
				return { class: 'bg-slate-700 text-slate-400', text: 'In Progress' };
			default:
				return { class: 'bg-slate-800 text-slate-500', text: status };
		}
	}
</script>

<SEO
	title="Seasonal Editions"
	description="Quarterly guides aligned with solstices and equinoxes. Practical wisdom for regenerative living."
	keywords="solarpunk editions, seasonal guides, quarterly almanac, solstice, equinox, regenerative living"
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<!-- Header -->
	<div class="text-center mb-16">
		<h1 class="font-orbitron text-4xl md:text-5xl font-bold mb-4">
			Seasonal <span class="gradient-text">Editions</span>
		</h1>
		<p class="text-lg text-slate-400 max-w-2xl mx-auto">
			Quarterly guides aligned with solstices and equinoxes. Each edition delivers practical wisdom
			tailored to the rhythm of the seasons.
		</p>
	</div>

	<!-- Season cycle visualization -->
	<div class="flex justify-center gap-4 mb-16">
		{#each Object.entries(seasons) as [key, season]}
			<div class="text-center">
				<div
					class="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-all
						{currentEdition && key === currentEdition.season
						? `${season.color} shadow-lg`
						: 'bg-slate-800 opacity-50'}"
				>
					{season.icon}
				</div>
				<span class="text-xs text-slate-500">{season.name}</span>
			</div>
		{/each}
	</div>

	<!-- Current Edition -->
	{#if currentEdition}
		{@const season = seasons[currentEdition.season]}
		{@const statusBadge = getStatusBadge(currentEdition.status)}
		<section class="mb-20">
			<div class="flex items-center gap-3 mb-6">
				<h2 class="font-orbitron text-2xl font-bold">Current Edition</h2>
				<span class={statusBadge.class}>{statusBadge.text}</span>
			</div>

			<div class="card gradient-border overflow-hidden">
				<div class="grid lg:grid-cols-2 gap-8 p-2">
					<!-- Left: Edition info -->
					<div class="flex flex-col justify-center">
						<div class="flex items-center gap-2 mb-4">
							<span class="text-4xl">{season?.icon || '📖'}</span>
							<span class="text-sm text-slate-500 uppercase tracking-wider">
								{season?.name || currentEdition.season}
								{currentEdition.year}
							</span>
						</div>

						<h3 class="font-orbitron text-3xl font-bold mb-2">
							{currentEdition.title}
						</h3>
						<p class="text-lg text-slate-400 mb-6">
							{currentEdition.tagline}
						</p>

						{#if currentEdition.description}
							<p class="text-slate-500 mb-8">
								{currentEdition.description}
							</p>
						{/if}

						<div class="flex flex-wrap gap-3">
							{#if currentEdition.status === 'published'}
								<a href="/editions/{currentEdition.slug}" class="btn-primary"> Read Now </a>
							{:else}
								<button class="btn-primary"> Notify Me </button>
								<a href="/editions/{currentEdition.slug}/preview" class="btn-secondary">
									Preview Contents
								</a>
							{/if}
						</div>
					</div>

					<!-- Right: Stats -->
					<div class="bg-slate-900/50 rounded-xl p-6 flex flex-col justify-center">
						<h4 class="font-semibold mb-4 text-slate-300">Edition Stats</h4>
						<div class="grid grid-cols-2 gap-4">
							<div class="text-center p-4 rounded-lg bg-slate-800/50">
								<div class="text-3xl font-orbitron font-bold text-solarpunk-teal">
									{currentEdition.articleCount}
								</div>
								<div class="text-sm text-slate-500">Articles</div>
							</div>
							<div class="text-center p-4 rounded-lg bg-slate-800/50">
								<div class="text-3xl font-orbitron font-bold text-solarpunk-gold">
									{currentEdition.year}
								</div>
								<div class="text-sm text-slate-500">Year</div>
							</div>
						</div>
						{#if currentEdition.publishedAt}
							<div class="mt-4 pt-4 border-t border-slate-700 text-center text-sm text-slate-500">
								Published {new Date(currentEdition.publishedAt).toLocaleDateString('en-US', {
									month: 'long',
									day: 'numeric',
									year: 'numeric'
								})}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</section>
	{:else}
		<section class="mb-20 text-center">
			<div class="card max-w-md mx-auto">
				<div class="text-4xl mb-4">📚</div>
				<h3 class="font-orbitron font-bold text-xl mb-2">No Editions Yet</h3>
				<p class="text-slate-400">Our first seasonal edition is coming soon. Stay tuned!</p>
			</div>
		</section>
	{/if}

	<!-- Past Editions -->
	{#if pastEditions.length > 0}
		<section class="mb-20">
			<h2 class="font-orbitron text-2xl font-bold mb-6">Past Editions</h2>

			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each pastEditions as edition}
					{@const season = seasons[edition.season]}
					{@const statusBadge = getStatusBadge(edition.status)}
					<a
						href="/editions/{edition.slug}"
						class="card group hover:border-solarpunk-teal/30 transition-all"
					>
						<div class="flex items-center gap-3 mb-4">
							<div
								class="{season?.color || 'bg-slate-700'} w-12 h-12 rounded-full flex items-center justify-center text-xl"
							>
								{season?.icon || '📖'}
							</div>
							<div>
								<div class="text-sm text-slate-500">
									{season?.name || edition.season}
									{edition.year}
								</div>
								<div
									class="font-orbitron font-bold group-hover:text-solarpunk-teal transition-colors"
								>
									{edition.title}
								</div>
							</div>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-slate-500">{edition.articleCount} articles</span>
							<span class={statusBadge.class}>{statusBadge.text}</span>
						</div>
					</a>
				{/each}

				<!-- Annual compilation teaser -->
				<div
					class="card border-dashed border-slate-700 flex flex-col items-center justify-center text-center"
				>
					<span class="text-4xl mb-3">📚</span>
					<h3 class="font-orbitron font-bold mb-2">2025 Annual Edition</h3>
					<p class="text-sm text-slate-500 mb-4">All four seasons compiled in print & digital</p>
					<span class="badge-gold">Coming Dec 2025</span>
				</div>
			</div>
		</section>
	{/if}

	<!-- Edition structure explainer -->
	<section class="mb-16">
		<h2 class="font-orbitron text-2xl font-bold mb-6 text-center">How Editions Work</h2>

		<div class="grid md:grid-cols-4 gap-6">
			<div class="text-center">
				<div
					class="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-2xl mx-auto mb-4"
				>
					🌱
				</div>
				<h3 class="font-semibold mb-2">Spring Equinox</h3>
				<p class="text-sm text-slate-500">New beginnings, planting, planning</p>
				<p class="text-xs text-slate-600 mt-2">Released ~March 20</p>
			</div>
			<div class="text-center">
				<div
					class="w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-2xl mx-auto mb-4"
				>
					☀️
				</div>
				<h3 class="font-semibold mb-2">Summer Solstice</h3>
				<p class="text-sm text-slate-500">Growth, abundance, solar projects</p>
				<p class="text-xs text-slate-600 mt-2">Released ~June 21</p>
			</div>
			<div class="text-center">
				<div
					class="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl mx-auto mb-4"
				>
					🍂
				</div>
				<h3 class="font-semibold mb-2">Fall Equinox</h3>
				<p class="text-sm text-slate-500">Harvest, preservation, resilience</p>
				<p class="text-xs text-slate-600 mt-2">Released ~Sept 22</p>
			</div>
			<div class="text-center">
				<div
					class="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mx-auto mb-4"
				>
					❄️
				</div>
				<h3 class="font-semibold mb-2">Winter Solstice</h3>
				<p class="text-sm text-slate-500">Rest, reflection, community warmth</p>
				<p class="text-xs text-slate-600 mt-2">Released ~Dec 21</p>
			</div>
		</div>
	</section>
</div>
