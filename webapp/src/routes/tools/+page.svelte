<script lang="ts">
	const tools = [
		{
			slug: 'solar-calculator',
			name: 'Solar System Sizer',
			description: 'Calculate the right solar panel system size for your home or community project.',
			icon: '☀️',
			category: 'Energy',
			status: 'available'
		},
		{
			slug: 'carbon-footprint',
			name: 'Carbon Footprint Calculator',
			description: 'Estimate your annual carbon emissions and discover reduction strategies.',
			icon: '🌍',
			category: 'Climate',
			status: 'available'
		},
		{
			slug: 'seed-planner',
			name: 'Seed Starting Planner',
			description: 'Plan your garden with a calendar based on your location and last frost date.',
			icon: '🌱',
			category: 'Garden',
			status: 'available'
		},
		{
			slug: 'community-asset-mapper',
			name: 'Community Asset Mapper',
			description: 'Map local resources, skills, and spaces for community resilience planning.',
			icon: '🗺️',
			category: 'Community',
			status: 'coming_soon'
		},
		{
			slug: 'rainwater-calculator',
			name: 'Rainwater Harvesting Calculator',
			description: 'Size your rainwater collection system based on roof area and local rainfall.',
			icon: '💧',
			category: 'Water',
			status: 'available'
		},
		{
			slug: 'energy-audit',
			name: 'Home Energy Audit',
			description: 'DIY energy audit checklist to find efficiency improvements for your home.',
			icon: '🔌',
			category: 'Energy',
			status: 'coming_soon'
		}
	];

	const categories = ['All', 'Energy', 'Climate', 'Garden', 'Community', 'Water'];
	let selectedCategory = 'All';

	$: filteredTools = selectedCategory === 'All'
		? tools
		: tools.filter(t => t.category === selectedCategory);
</script>

<svelte:head>
	<title>Practical Tools | The Solarpunk Almanac</title>
	<meta name="description" content="Calculators, planners, and guides for sustainable living. From solar sizing to seed starting." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<!-- Header -->
	<div class="text-center mb-12">
		<h1 class="font-orbitron text-4xl md:text-5xl font-bold mb-4">
			Practical <span class="gradient-text">Tools</span>
		</h1>
		<p class="text-lg text-slate-400 max-w-2xl mx-auto">
			Calculators, planners, and guides to help you take action. Knowledge made actionable.
		</p>
	</div>

	<!-- Category filters -->
	<div class="flex flex-wrap justify-center gap-2 mb-12">
		{#each categories as cat}
			<button
				on:click={() => selectedCategory = cat}
				class="px-4 py-2 rounded-full text-sm font-medium transition-all
					{selectedCategory === cat
						? 'bg-solarpunk-teal text-slate-900'
						: 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
			>
				{cat}
			</button>
		{/each}
	</div>

	<!-- Tools Grid -->
	<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
		{#each filteredTools as tool}
			{@const isAvailable = tool.status === 'available'}
			<a
				href={isAvailable ? `/tools/${tool.slug}` : '#'}
				class="card group transition-all
					{isAvailable ? 'hover:border-solarpunk-teal/30 cursor-pointer' : 'opacity-60 cursor-not-allowed'}"
			>
				<div class="flex items-start gap-4">
					<div class="text-4xl">{tool.icon}</div>
					<div class="flex-1">
						<div class="flex items-center gap-2 mb-1">
							<h3 class="font-orbitron font-bold group-hover:text-solarpunk-teal transition-colors">
								{tool.name}
							</h3>
							{#if !isAvailable}
								<span class="badge-gold text-xs">Soon</span>
							{/if}
						</div>
						<span class="text-xs text-slate-500 uppercase tracking-wider">{tool.category}</span>
						<p class="text-sm text-slate-400 mt-2">
							{tool.description}
						</p>
					</div>
				</div>
				{#if isAvailable}
					<div class="mt-4 flex items-center text-sm text-solarpunk-teal opacity-0 group-hover:opacity-100 transition-opacity">
						<span>Open tool</span>
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</div>
				{/if}
			</a>
		{/each}
	</div>

	<!-- Featured Tool: Solar Calculator -->
	<section class="mb-16">
		<h2 class="font-orbitron text-2xl font-bold mb-6">Featured Tool</h2>
		<div class="card gradient-border">
			<div class="grid lg:grid-cols-2 gap-8 p-2">
				<div>
					<div class="text-6xl mb-4">☀️</div>
					<h3 class="font-orbitron text-2xl font-bold mb-2">Solar System Sizer</h3>
					<p class="text-slate-400 mb-6">
						Planning a solar installation? Our calculator helps you determine the right system size based on your energy usage, location, roof space, and goals.
					</p>
					<ul class="space-y-2 mb-6 text-sm text-slate-400">
						<li class="flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-solarpunk-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
							Calculate based on your electricity bills
						</li>
						<li class="flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-solarpunk-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
							Account for local solar irradiance
						</li>
						<li class="flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-solarpunk-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
							Estimate costs and payback period
						</li>
						<li class="flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-solarpunk-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
							Compare grid-tied vs off-grid options
						</li>
					</ul>
					<a href="/tools/solar-calculator" class="btn-primary">
						Try the Calculator
					</a>
				</div>
				<div class="bg-slate-900/50 rounded-xl p-6 flex items-center justify-center">
					<div class="text-center">
						<div class="inline-block p-8 rounded-full bg-gradient-to-br from-solar-gold/20 to-solarpunk-teal/20 mb-4">
							<div class="text-6xl">⚡</div>
						</div>
						<p class="text-slate-500">Interactive calculator preview</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Request a tool -->
	<section class="text-center">
		<div class="card inline-block max-w-md">
			<h3 class="font-orbitron font-bold text-xl mb-2">Need a different tool?</h3>
			<p class="text-slate-400 mb-4">Suggest a calculator or planner that would help your community.</p>
			<a href="/contribute" class="btn-secondary">
				Suggest a Tool
			</a>
		</div>
	</section>
</div>
