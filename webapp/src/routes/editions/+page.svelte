<script lang="ts">
	const seasons = {
		spring: { name: 'Spring', color: 'bg-green-500', icon: '🌱', months: 'Mar-May' },
		summer: { name: 'Summer', color: 'bg-yellow-500', icon: '☀️', months: 'Jun-Aug' },
		fall: { name: 'Fall', color: 'bg-orange-500', icon: '🍂', months: 'Sep-Nov' },
		winter: { name: 'Winter', color: 'bg-blue-500', icon: '❄️', months: 'Dec-Feb' }
	};

	const currentEdition = {
		season: 'fall',
		year: 2025,
		title: 'Harvest & Preserve',
		tagline: 'Abundance through community resilience',
		status: 'coming_soon',
		sections: [
			{ name: 'Overview', icon: '📖', articles: 3 },
			{ name: 'Grow', icon: '🌾', articles: 5 },
			{ name: 'Build', icon: '🏗️', articles: 4 },
			{ name: 'Power', icon: '⚡', articles: 3 },
			{ name: 'Connect', icon: '🤝', articles: 4 },
			{ name: 'Thrive', icon: '💚', articles: 3 },
			{ name: 'Create', icon: '🎨', articles: 2 },
			{ name: 'Learn', icon: '📚', articles: 3 }
		]
	};

	const pastEditions = [
		{
			season: 'summer',
			year: 2025,
			title: 'Solar Abundance',
			status: 'available',
			articleCount: 24
		},
		{
			season: 'spring',
			year: 2025,
			title: 'Seeds of Change',
			status: 'available',
			articleCount: 22
		}
	];
</script>

<svelte:head>
	<title>Seasonal Editions | The Solarpunk Almanac</title>
	<meta name="description" content="Quarterly guides aligned with solstices and equinoxes. Practical wisdom for regenerative living." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<!-- Header -->
	<div class="text-center mb-16">
		<h1 class="font-orbitron text-4xl md:text-5xl font-bold mb-4">
			Seasonal <span class="gradient-text">Editions</span>
		</h1>
		<p class="text-lg text-slate-400 max-w-2xl mx-auto">
			Quarterly guides aligned with solstices and equinoxes. Each edition delivers practical wisdom tailored to the rhythm of the seasons.
		</p>
	</div>

	<!-- Season cycle visualization -->
	<div class="flex justify-center gap-4 mb-16">
		{#each Object.entries(seasons) as [key, season]}
			<div class="text-center">
				<div
					class="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-all
						{key === currentEdition.season
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
	<section class="mb-20">
		<div class="flex items-center gap-3 mb-6">
			<h2 class="font-orbitron text-2xl font-bold">Current Edition</h2>
			<span class="badge-gold">Coming Soon</span>
		</div>

		<div class="card gradient-border overflow-hidden">
			<div class="grid lg:grid-cols-2 gap-8 p-2">
				<!-- Left: Edition info -->
				<div class="flex flex-col justify-center">
					<div class="flex items-center gap-2 mb-4">
						<span class="text-4xl">{seasons[currentEdition.season as keyof typeof seasons].icon}</span>
						<span class="text-sm text-slate-500 uppercase tracking-wider">
							{seasons[currentEdition.season as keyof typeof seasons].name} {currentEdition.year}
						</span>
					</div>

					<h3 class="font-orbitron text-3xl font-bold mb-2">
						{currentEdition.title}
					</h3>
					<p class="text-lg text-slate-400 mb-6">
						{currentEdition.tagline}
					</p>

					<p class="text-slate-500 mb-8">
						This edition focuses on the abundance of fall — harvesting, preserving, and building community resilience for the seasons ahead.
					</p>

					<div class="flex flex-wrap gap-3">
						<button class="btn-primary">
							Notify Me
						</button>
						<a href="/editions/preview" class="btn-secondary">
							Preview Contents
						</a>
					</div>
				</div>

				<!-- Right: Sections preview -->
				<div class="bg-slate-900/50 rounded-xl p-6">
					<h4 class="font-semibold mb-4 text-slate-300">In This Edition</h4>
					<div class="grid grid-cols-2 gap-3">
						{#each currentEdition.sections as section}
							<div class="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
								<span class="text-xl">{section.icon}</span>
								<div>
									<div class="font-medium text-sm">{section.name}</div>
									<div class="text-xs text-slate-500">{section.articles} articles</div>
								</div>
							</div>
						{/each}
					</div>
					<div class="mt-4 pt-4 border-t border-slate-700 text-center">
						<span class="text-2xl font-orbitron font-bold text-solarpunk-teal">27</span>
						<span class="text-sm text-slate-500 ml-2">total articles</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Past Editions -->
	<section class="mb-20">
		<h2 class="font-orbitron text-2xl font-bold mb-6">Past Editions</h2>

		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each pastEditions as edition}
				{@const season = seasons[edition.season as keyof typeof seasons]}
				<a href="/editions/{edition.season}-{edition.year}" class="card group hover:border-solarpunk-teal/30 transition-all">
					<div class="flex items-center gap-3 mb-4">
						<div class="{season.color} w-12 h-12 rounded-full flex items-center justify-center text-xl">
							{season.icon}
						</div>
						<div>
							<div class="text-sm text-slate-500">{season.name} {edition.year}</div>
							<div class="font-orbitron font-bold group-hover:text-solarpunk-teal transition-colors">
								{edition.title}
							</div>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-500">{edition.articleCount} articles</span>
						<span class="badge-green">Available</span>
					</div>
				</a>
			{/each}

			<!-- Annual compilation teaser -->
			<div class="card border-dashed border-slate-700 flex flex-col items-center justify-center text-center">
				<span class="text-4xl mb-3">📚</span>
				<h3 class="font-orbitron font-bold mb-2">2025 Annual Edition</h3>
				<p class="text-sm text-slate-500 mb-4">All four seasons compiled in print & digital</p>
				<span class="badge-gold">Coming Dec 2025</span>
			</div>
		</div>
	</section>

	<!-- Edition structure explainer -->
	<section class="mb-16">
		<h2 class="font-orbitron text-2xl font-bold mb-6 text-center">How Editions Work</h2>

		<div class="grid md:grid-cols-4 gap-6">
			<div class="text-center">
				<div class="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-2xl mx-auto mb-4">🌱</div>
				<h3 class="font-semibold mb-2">Spring Equinox</h3>
				<p class="text-sm text-slate-500">New beginnings, planting, planning</p>
				<p class="text-xs text-slate-600 mt-2">Released ~March 20</p>
			</div>
			<div class="text-center">
				<div class="w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-2xl mx-auto mb-4">☀️</div>
				<h3 class="font-semibold mb-2">Summer Solstice</h3>
				<p class="text-sm text-slate-500">Growth, abundance, solar projects</p>
				<p class="text-xs text-slate-600 mt-2">Released ~June 21</p>
			</div>
			<div class="text-center">
				<div class="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl mx-auto mb-4">🍂</div>
				<h3 class="font-semibold mb-2">Fall Equinox</h3>
				<p class="text-sm text-slate-500">Harvest, preservation, resilience</p>
				<p class="text-xs text-slate-600 mt-2">Released ~Sept 22</p>
			</div>
			<div class="text-center">
				<div class="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mx-auto mb-4">❄️</div>
				<h3 class="font-semibold mb-2">Winter Solstice</h3>
				<p class="text-sm text-slate-500">Rest, reflection, community warmth</p>
				<p class="text-xs text-slate-600 mt-2">Released ~Dec 21</p>
			</div>
		</div>
	</section>
</div>
