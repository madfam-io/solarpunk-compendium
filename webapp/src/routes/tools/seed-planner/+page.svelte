<script lang="ts">
	import { onMount } from 'svelte';

	// Location input
	let lastFrostDate = '2025-04-15';
	let firstFrostDate = '2025-10-15';
	let zone = '7a';

	// Selected crops
	let selectedCrops: string[] = ['tomato', 'pepper', 'basil', 'lettuce', 'cucumber'];

	// Crop database with timing info (weeks relative to last frost)
	const CROPS: Record<
		string,
		{
			name: string;
			category: 'vegetable' | 'herb' | 'flower';
			icon: string;
			startIndoors: number; // weeks before last frost (negative = after)
			transplant: number; // weeks before last frost
			directSow: number | null; // weeks before last frost (null = don't direct sow)
			harvestStart: number; // weeks after planting
			harvestEnd: number; // weeks after planting
			notes: string;
		}
	> = {
		tomato: {
			name: 'Tomato',
			category: 'vegetable',
			icon: '🍅',
			startIndoors: 6,
			transplant: -2,
			directSow: null,
			harvestStart: 8,
			harvestEnd: 16,
			notes: 'Start indoors 6-8 weeks before last frost. Transplant after danger of frost has passed.'
		},
		pepper: {
			name: 'Pepper',
			category: 'vegetable',
			icon: '🌶️',
			startIndoors: 8,
			transplant: -2,
			directSow: null,
			harvestStart: 10,
			harvestEnd: 18,
			notes: 'Start early - peppers need a long growing season. Keep soil warm for germination.'
		},
		lettuce: {
			name: 'Lettuce',
			category: 'vegetable',
			icon: '🥬',
			startIndoors: 4,
			transplant: 2,
			directSow: 2,
			harvestStart: 4,
			harvestEnd: 8,
			notes: 'Cool season crop. Can direct sow as soon as soil can be worked. Succession plant every 2 weeks.'
		},
		cucumber: {
			name: 'Cucumber',
			category: 'vegetable',
			icon: '🥒',
			startIndoors: 3,
			transplant: -2,
			directSow: -2,
			harvestStart: 6,
			harvestEnd: 12,
			notes: 'Warm season crop. Can direct sow after frost. Needs consistent water.'
		},
		squash: {
			name: 'Summer Squash',
			category: 'vegetable',
			icon: '🎃',
			startIndoors: 3,
			transplant: -2,
			directSow: -2,
			harvestStart: 6,
			harvestEnd: 14,
			notes: 'Fast growing! Direct sow or start indoors 3-4 weeks before transplanting.'
		},
		beans: {
			name: 'Bush Beans',
			category: 'vegetable',
			icon: '🫘',
			startIndoors: 0,
			transplant: -1,
			directSow: -1,
			harvestStart: 7,
			harvestEnd: 10,
			notes: "Best direct sown after last frost. Beans don't transplant well."
		},
		peas: {
			name: 'Peas',
			category: 'vegetable',
			icon: '🟢',
			startIndoors: 4,
			transplant: 4,
			directSow: 6,
			harvestStart: 8,
			harvestEnd: 12,
			notes: 'Cool season crop. Direct sow 4-6 weeks before last frost. Needs support to climb.'
		},
		broccoli: {
			name: 'Broccoli',
			category: 'vegetable',
			icon: '🥦',
			startIndoors: 6,
			transplant: 2,
			directSow: null,
			harvestStart: 10,
			harvestEnd: 14,
			notes: 'Cool season crop. Start indoors and transplant before hot weather.'
		},
		kale: {
			name: 'Kale',
			category: 'vegetable',
			icon: '🥗',
			startIndoors: 6,
			transplant: 4,
			directSow: 4,
			harvestStart: 6,
			harvestEnd: 20,
			notes: 'Very cold hardy. Can harvest leaves continuously. Sweetens after frost.'
		},
		carrot: {
			name: 'Carrot',
			category: 'vegetable',
			icon: '🥕',
			startIndoors: 0,
			transplant: 0,
			directSow: 3,
			harvestStart: 10,
			harvestEnd: 14,
			notes: 'Must be direct sown - does not transplant. Keep soil moist for germination.'
		},
		basil: {
			name: 'Basil',
			category: 'herb',
			icon: '🌿',
			startIndoors: 6,
			transplant: -2,
			directSow: -2,
			harvestStart: 4,
			harvestEnd: 16,
			notes: 'Loves heat. Pinch flowers to prolong harvest. Cannot tolerate frost.'
		},
		cilantro: {
			name: 'Cilantro',
			category: 'herb',
			icon: '🌱',
			startIndoors: 4,
			transplant: 2,
			directSow: 2,
			harvestStart: 3,
			harvestEnd: 6,
			notes: 'Cool season herb. Bolts quickly in heat. Succession plant for continuous harvest.'
		},
		parsley: {
			name: 'Parsley',
			category: 'herb',
			icon: '🌿',
			startIndoors: 8,
			transplant: 2,
			directSow: 2,
			harvestStart: 8,
			harvestEnd: 24,
			notes: 'Slow to germinate - be patient! Biennial that can overwinter in many zones.'
		},
		zinnia: {
			name: 'Zinnia',
			category: 'flower',
			icon: '🌸',
			startIndoors: 4,
			transplant: -2,
			directSow: -2,
			harvestStart: 8,
			harvestEnd: 16,
			notes: 'Easy annual flower. Great for cutting. Attracts pollinators.'
		},
		sunflower: {
			name: 'Sunflower',
			category: 'flower',
			icon: '🌻',
			startIndoors: 2,
			transplant: -1,
			directSow: -1,
			harvestStart: 10,
			harvestEnd: 14,
			notes: 'Best direct sown. Plant in succession for continuous blooms.'
		},
		marigold: {
			name: 'Marigold',
			category: 'flower',
			icon: '🏵️',
			startIndoors: 6,
			transplant: -2,
			directSow: -2,
			harvestStart: 6,
			harvestEnd: 20,
			notes: 'Easy to grow. Helps repel some garden pests. Great companion plant.'
		}
	};

	const ZONES = [
		'3a',
		'3b',
		'4a',
		'4b',
		'5a',
		'5b',
		'6a',
		'6b',
		'7a',
		'7b',
		'8a',
		'8b',
		'9a',
		'9b',
		'10a',
		'10b'
	];

	// Date calculations
	$: lastFrost = new Date(lastFrostDate);
	$: firstFrost = new Date(firstFrostDate);
	$: growingSeasonDays = Math.round(
		(firstFrost.getTime() - lastFrost.getTime()) / (1000 * 60 * 60 * 24)
	);
	$: today = new Date();

	// Calculate planting schedule
	$: schedule = calculateSchedule();

	function calculateSchedule() {
		return selectedCrops.map((cropId) => {
			const crop = CROPS[cropId];
			if (!crop) return null;

			const startIndoorsDate = addWeeks(lastFrost, -crop.startIndoors);
			const transplantDate = addWeeks(lastFrost, -crop.transplant);
			const directSowDate = crop.directSow !== null ? addWeeks(lastFrost, -crop.directSow) : null;

			// Calculate when to expect harvest (from transplant/direct sow date)
			const plantingDate = crop.directSow !== null ? directSowDate : transplantDate;
			const harvestStartDate = addWeeks(plantingDate!, crop.harvestStart);
			const harvestEndDate = addWeeks(plantingDate!, crop.harvestEnd);

			return {
				id: cropId,
				...crop,
				startIndoorsDate,
				transplantDate,
				directSowDate,
				harvestStartDate,
				harvestEndDate,
				// Status flags
				shouldStartIndoorsNow:
					isWithinDays(startIndoorsDate, today, 14) && startIndoorsDate >= today,
				canStartIndoors: startIndoorsDate <= today && transplantDate >= today,
				shouldTransplantNow: isWithinDays(transplantDate, today, 14) && transplantDate >= today,
				canDirectSow: directSowDate !== null && directSowDate <= today && harvestEndDate >= today,
				isHarvestTime: harvestStartDate <= today && harvestEndDate >= today,
				isPastSeason: harvestEndDate < today
			};
		}).filter(Boolean);
	}

	function addWeeks(date: Date, weeks: number): Date {
		const result = new Date(date);
		result.setDate(result.getDate() + weeks * 7);
		return result;
	}

	function isWithinDays(date: Date, reference: Date, days: number): boolean {
		const diff = Math.abs(date.getTime() - reference.getTime());
		return diff <= days * 24 * 60 * 60 * 1000;
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function formatDateLong(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	}

	function toggleCrop(cropId: string) {
		if (selectedCrops.includes(cropId)) {
			selectedCrops = selectedCrops.filter((c) => c !== cropId);
		} else {
			selectedCrops = [...selectedCrops, cropId];
		}
	}

	// Group crops by category
	$: cropsByCategory = {
		vegetable: Object.entries(CROPS).filter(([_, c]) => c.category === 'vegetable'),
		herb: Object.entries(CROPS).filter(([_, c]) => c.category === 'herb'),
		flower: Object.entries(CROPS).filter(([_, c]) => c.category === 'flower')
	};

	// Get upcoming tasks
	$: upcomingTasks = schedule
		.flatMap((s) => {
			if (!s) return [];
			const tasks = [];
			if (s.shouldStartIndoorsNow) {
				tasks.push({ crop: s.name, icon: s.icon, action: 'Start indoors', date: s.startIndoorsDate });
			}
			if (s.shouldTransplantNow) {
				tasks.push({ crop: s.name, icon: s.icon, action: 'Transplant outside', date: s.transplantDate });
			}
			if (s.canDirectSow && s.directSowDate && isWithinDays(s.directSowDate, today, 14)) {
				tasks.push({ crop: s.name, icon: s.icon, action: 'Direct sow', date: s.directSowDate });
			}
			return tasks;
		})
		.sort((a, b) => a.date.getTime() - b.date.getTime())
		.slice(0, 6);
</script>

<svelte:head>
	<title>Seed Starting Planner | The Solarpunk Almanac</title>
	<meta
		name="description"
		content="Plan your garden with a personalized seed starting calendar based on your location and frost dates."
	/>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<!-- Header -->
	<div class="mb-8">
		<a
			href="/tools"
			class="text-sm text-slate-500 hover:text-solarpunk-teal transition-colors flex items-center gap-1 mb-4"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="w-4 h-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			Back to Tools
		</a>
		<div class="flex items-center gap-4">
			<span class="text-5xl">🌱</span>
			<div>
				<h1 class="font-orbitron text-3xl md:text-4xl font-bold">Seed Starting Planner</h1>
				<p class="text-slate-400">
					Your personalized planting calendar based on local frost dates
				</p>
			</div>
		</div>
	</div>

	<div class="grid lg:grid-cols-3 gap-8">
		<!-- Settings Panel -->
		<div class="lg:col-span-1 space-y-6">
			<!-- Location Settings -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Your Location</h2>

				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2"> USDA Hardiness Zone </label>
						<select bind:value={zone} class="input">
							{#each ZONES as z}
								<option value={z}>Zone {z}</option>
							{/each}
						</select>
						<p class="text-xs text-slate-500 mt-1">
							<a
								href="https://planthardiness.ars.usda.gov/"
								target="_blank"
								class="text-solarpunk-teal hover:underline">Find your zone</a
							>
						</p>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Average Last Frost (Spring)
						</label>
						<input type="date" bind:value={lastFrostDate} class="input" />
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Average First Frost (Fall)
						</label>
						<input type="date" bind:value={firstFrostDate} class="input" />
					</div>
				</div>

				<div class="mt-4 p-3 bg-leaf-green/10 rounded-lg text-center">
					<div class="text-2xl font-orbitron font-bold text-leaf-green">{growingSeasonDays}</div>
					<div class="text-sm text-slate-400">days growing season</div>
				</div>
			</div>

			<!-- Crop Selection -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Select Crops</h2>

				<div class="space-y-6">
					{#each Object.entries(cropsByCategory) as [category, crops]}
						<div>
							<h3 class="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
								{category === 'vegetable' ? '🥬 Vegetables' : category === 'herb' ? '🌿 Herbs' : '🌸 Flowers'}
							</h3>
							<div class="flex flex-wrap gap-2">
								{#each crops as [id, crop]}
									<button
										on:click={() => toggleCrop(id)}
										class="px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1
											{selectedCrops.includes(id)
											? 'bg-solarpunk-teal text-slate-900'
											: 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
									>
										<span>{crop.icon}</span>
										<span>{crop.name}</span>
									</button>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Planting Schedule -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Upcoming Tasks -->
			{#if upcomingTasks.length > 0}
				<div class="card gradient-border">
					<h2 class="font-orbitron font-bold mb-4">Coming Up</h2>
					<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each upcomingTasks as task}
							<div class="p-3 bg-slate-800/50 rounded-lg">
								<div class="flex items-center gap-2 mb-1">
									<span class="text-xl">{task.icon}</span>
									<span class="font-medium">{task.crop}</span>
								</div>
								<div class="text-sm text-solarpunk-teal">{task.action}</div>
								<div class="text-xs text-slate-500">{formatDate(task.date)}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Key Dates -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-4">Key Dates</h2>
				<div class="grid md:grid-cols-3 gap-4 text-center">
					<div class="p-4 bg-slate-800/50 rounded-lg">
						<div class="text-2xl mb-2">🌸</div>
						<div class="font-medium">Last Frost</div>
						<div class="text-solarpunk-teal">{formatDateLong(lastFrost)}</div>
					</div>
					<div class="p-4 bg-slate-800/50 rounded-lg">
						<div class="text-2xl mb-2">📅</div>
						<div class="font-medium">Today</div>
						<div class="text-solar-gold">{formatDateLong(today)}</div>
					</div>
					<div class="p-4 bg-slate-800/50 rounded-lg">
						<div class="text-2xl mb-2">🍂</div>
						<div class="font-medium">First Frost</div>
						<div class="text-sky-blue">{formatDateLong(firstFrost)}</div>
					</div>
				</div>
			</div>

			<!-- Detailed Schedule -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Planting Schedule</h2>

				{#if schedule.length === 0}
					<div class="text-center py-8 text-slate-500">
						<div class="text-4xl mb-2">🌱</div>
						<p>Select some crops to see your planting schedule</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each schedule as item}
							{#if item}
								<div
									class="p-4 rounded-lg border transition-colors
										{item.isPastSeason
										? 'bg-slate-800/30 border-slate-800 opacity-50'
										: item.isHarvestTime
											? 'bg-leaf-green/10 border-leaf-green/30'
											: item.shouldStartIndoorsNow || item.shouldTransplantNow
												? 'bg-solarpunk-teal/10 border-solarpunk-teal/30'
												: 'bg-slate-800/50 border-slate-700'}"
								>
									<div class="flex items-start justify-between mb-3">
										<div class="flex items-center gap-3">
											<span class="text-3xl">{item.icon}</span>
											<div>
												<h3 class="font-orbitron font-bold">{item.name}</h3>
												<span
													class="text-xs px-2 py-0.5 rounded-full
														{item.category === 'vegetable'
														? 'bg-leaf-green/20 text-leaf-green'
														: item.category === 'herb'
															? 'bg-solarpunk-teal/20 text-solarpunk-teal'
															: 'bg-pink-500/20 text-pink-400'}"
												>
													{item.category}
												</span>
											</div>
										</div>
										<div class="text-right">
											{#if item.isPastSeason}
												<span class="text-xs text-slate-500">Season ended</span>
											{:else if item.isHarvestTime}
												<span class="badge-green">Harvest time!</span>
											{:else if item.shouldStartIndoorsNow}
												<span class="badge-gold">Start indoors now!</span>
											{:else if item.shouldTransplantNow}
												<span class="bg-solarpunk-teal/20 text-solarpunk-teal text-xs px-2 py-1 rounded-full"
													>Transplant soon!</span
												>
											{/if}
										</div>
									</div>

									<div class="grid md:grid-cols-4 gap-4 text-sm mb-3">
										<div>
											<div class="text-slate-500 text-xs uppercase mb-1">Start Indoors</div>
											<div
												class="font-medium {item.canStartIndoors && !item.shouldStartIndoorsNow ? 'text-solar-gold' : ''}"
											>
												{formatDate(item.startIndoorsDate)}
											</div>
										</div>
										<div>
											<div class="text-slate-500 text-xs uppercase mb-1">Transplant</div>
											<div class="font-medium">{formatDate(item.transplantDate)}</div>
										</div>
										<div>
											<div class="text-slate-500 text-xs uppercase mb-1">Direct Sow</div>
											<div class="font-medium">
												{item.directSowDate ? formatDate(item.directSowDate) : 'N/A'}
											</div>
										</div>
										<div>
											<div class="text-slate-500 text-xs uppercase mb-1">Harvest</div>
											<div class="font-medium text-leaf-green">
												{formatDate(item.harvestStartDate)} - {formatDate(item.harvestEndDate)}
											</div>
										</div>
									</div>

									<p class="text-xs text-slate-500">{item.notes}</p>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>

			<!-- Tips -->
			<div class="card bg-gradient-to-br from-leaf-green/10 to-solarpunk-teal/10">
				<h2 class="font-orbitron font-bold mb-4">Seed Starting Tips</h2>
				<ul class="space-y-2 text-sm text-slate-400">
					<li class="flex items-start gap-2">
						<span class="text-leaf-green">🌡️</span>
						<span
							>Most seeds germinate best at 65-75°F. Use a heat mat for warm-season crops.</span
						>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-leaf-green">💡</span>
						<span>Seedlings need 12-16 hours of light daily. Use grow lights if windowsill light is insufficient.</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-leaf-green">🌱</span>
						<span
							>Harden off seedlings for 7-10 days before transplanting by gradually exposing them
							to outdoor conditions.</span
						>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-leaf-green">📝</span>
						<span>Keep a garden journal to track what works in your specific microclimate.</span>
					</li>
				</ul>
			</div>

			<!-- Disclaimer -->
			<div class="text-xs text-slate-500 text-center">
				Dates are estimates based on average frost dates. Actual conditions vary by year and
				microclimate. Adjust based on weather forecasts and local conditions.
			</div>
		</div>
	</div>
</div>
