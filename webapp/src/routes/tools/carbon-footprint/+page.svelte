<script lang="ts">
	// Transportation
	let carMilesWeekly = 150;
	let carMpg = 25;
	let flightsShortPerYear = 2; // <3 hours
	let flightsMediumPerYear = 1; // 3-6 hours
	let flightsLongPerYear = 0; // >6 hours
	let publicTransitMilesWeekly = 20;

	// Home Energy
	let electricityKwhMonthly = 900;
	let electricityIsRenewable = false;
	let naturalGasThermsMonthly = 40;
	let heatingOilGallonsMonthly = 0;
	let propaneGallonsMonthly = 0;

	// Food
	let dietType: 'vegan' | 'vegetarian' | 'pescatarian' | 'omnivore' | 'heavy-meat' = 'omnivore';
	let localFoodPercent = 20;
	let foodWastePercent = 20;

	// Consumption
	let shoppingHabit: 'minimal' | 'average' | 'frequent' = 'average';
	let electronicsPerYear = 2;

	// Emission factors (kg CO2e)
	const FACTORS = {
		gasoline: 8.89, // kg CO2 per gallon
		electricity: 0.42, // kg CO2 per kWh (US average)
		electricityRenewable: 0.05, // kg CO2 per kWh (renewable)
		naturalGas: 5.3, // kg CO2 per therm
		heatingOil: 10.16, // kg CO2 per gallon
		propane: 5.72, // kg CO2 per gallon
		flightShort: 250, // kg CO2 per flight
		flightMedium: 500, // kg CO2 per flight
		flightLong: 1100, // kg CO2 per flight
		publicTransit: 0.089, // kg CO2 per mile
		diet: {
			vegan: 1500,
			vegetarian: 1700,
			pescatarian: 1900,
			omnivore: 2500,
			'heavy-meat': 3300
		},
		shopping: {
			minimal: 1000,
			average: 2500,
			frequent: 5000
		},
		electronics: 200 // kg CO2 per device
	};

	// Calculate emissions
	$: transportEmissions = calculateTransport();
	$: homeEmissions = calculateHome();
	$: foodEmissions = calculateFood();
	$: consumptionEmissions = calculateConsumption();
	$: totalEmissions = transportEmissions + homeEmissions + foodEmissions + consumptionEmissions;

	// US average is ~16 tonnes per person
	$: comparisonToAverage = (totalEmissions / 16000) * 100;
	// Sustainable target is ~2 tonnes per person
	$: comparisonToTarget = (totalEmissions / 2000) * 100;

	function calculateTransport(): number {
		const carGallonsWeekly = carMilesWeekly / carMpg;
		const carEmissions = carGallonsWeekly * 52 * FACTORS.gasoline;
		const flightEmissions =
			flightsShortPerYear * FACTORS.flightShort +
			flightsMediumPerYear * FACTORS.flightMedium +
			flightsLongPerYear * FACTORS.flightLong;
		const transitEmissions = publicTransitMilesWeekly * 52 * FACTORS.publicTransit;
		return carEmissions + flightEmissions + transitEmissions;
	}

	function calculateHome(): number {
		const electricityFactor = electricityIsRenewable
			? FACTORS.electricityRenewable
			: FACTORS.electricity;
		const electricityEmissions = electricityKwhMonthly * 12 * electricityFactor;
		const gasEmissions = naturalGasThermsMonthly * 12 * FACTORS.naturalGas;
		const oilEmissions = heatingOilGallonsMonthly * 12 * FACTORS.heatingOil;
		const propaneEmissions = propaneGallonsMonthly * 12 * FACTORS.propane;
		return electricityEmissions + gasEmissions + oilEmissions + propaneEmissions;
	}

	function calculateFood(): number {
		const baseDietEmissions = FACTORS.diet[dietType];
		const localReduction = 1 - localFoodPercent * 0.002; // up to 20% reduction for 100% local
		const wasteIncrease = 1 + foodWastePercent * 0.005; // up to 50% increase for 100% waste
		return baseDietEmissions * localReduction * wasteIncrease;
	}

	function calculateConsumption(): number {
		return FACTORS.shopping[shoppingHabit] + electronicsPerYear * FACTORS.electronics;
	}

	function formatNumber(value: number, decimals = 1): string {
		return value.toFixed(decimals);
	}

	function formatTonnes(kg: number): string {
		return (kg / 1000).toFixed(1);
	}

	// Reduction tips based on highest emission category
	$: topCategory = getTopCategory();
	$: reductionTips = getReductionTips(topCategory);

	function getTopCategory(): string {
		const categories = [
			{ name: 'transport', value: transportEmissions },
			{ name: 'home', value: homeEmissions },
			{ name: 'food', value: foodEmissions },
			{ name: 'consumption', value: consumptionEmissions }
		];
		return categories.sort((a, b) => b.value - a.value)[0].name;
	}

	function getReductionTips(category: string): string[] {
		const tips: Record<string, string[]> = {
			transport: [
				'Consider carpooling or using public transit more',
				'Switch to an electric or hybrid vehicle',
				'Reduce air travel - try trains for shorter trips',
				'Work from home when possible',
				'Combine errands to reduce driving'
			],
			home: [
				'Switch to renewable electricity provider',
				'Improve home insulation',
				'Install a smart thermostat',
				'Upgrade to energy-efficient appliances',
				'Consider solar panels for your home'
			],
			food: [
				'Reduce meat consumption, especially beef',
				'Buy local and seasonal produce',
				'Plan meals to reduce food waste',
				'Start composting food scraps',
				'Grow some of your own food'
			],
			consumption: [
				'Buy second-hand when possible',
				'Repair instead of replacing',
				'Choose quality items that last longer',
				'Avoid fast fashion',
				'Extend the life of electronics'
			]
		};
		return tips[category] || [];
	}

	// Type-safe setters
	type DietType = typeof dietType;
	function setDietType(value: string) {
		dietType = value as DietType;
	}

	type ShoppingHabit = typeof shoppingHabit;
	function setShoppingHabit(value: string) {
		shoppingHabit = value as ShoppingHabit;
	}
</script>

<svelte:head>
	<title>Carbon Footprint Calculator | The Solarpunk Almanac</title>
	<meta
		name="description"
		content="Calculate your annual carbon footprint and discover personalized reduction strategies."
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
			<span class="text-5xl">🌍</span>
			<div>
				<h1 class="font-orbitron text-3xl md:text-4xl font-bold">Carbon Footprint Calculator</h1>
				<p class="text-slate-400">Estimate your annual emissions and find reduction strategies</p>
			</div>
		</div>
	</div>

	<div class="grid lg:grid-cols-3 gap-8">
		<!-- Input Form -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Transportation -->
			<div class="card">
				<div class="flex items-center gap-3 mb-6">
					<span class="text-2xl">🚗</span>
					<h2 class="font-orbitron font-bold">Transportation</h2>
				</div>

				<div class="grid md:grid-cols-2 gap-6">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Car miles per week
						</label>
						<input type="number" bind:value={carMilesWeekly} min="0" step="10" class="input" />
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2"> Car fuel economy (MPG) </label>
						<input type="number" bind:value={carMpg} min="10" max="100" step="1" class="input" />
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Short flights/year (&lt;3hrs)
						</label>
						<input
							type="number"
							bind:value={flightsShortPerYear}
							min="0"
							max="50"
							step="1"
							class="input"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Medium flights/year (3-6hrs)
						</label>
						<input
							type="number"
							bind:value={flightsMediumPerYear}
							min="0"
							max="50"
							step="1"
							class="input"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Long flights/year (&gt;6hrs)
						</label>
						<input
							type="number"
							bind:value={flightsLongPerYear}
							min="0"
							max="50"
							step="1"
							class="input"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Public transit miles/week
						</label>
						<input
							type="number"
							bind:value={publicTransitMilesWeekly}
							min="0"
							step="5"
							class="input"
						/>
					</div>
				</div>

				<div class="mt-4 p-3 bg-slate-800/50 rounded-lg">
					<div class="flex justify-between items-center">
						<span class="text-sm text-slate-400">Transport emissions:</span>
						<span class="font-medium text-solarpunk-teal"
							>{formatTonnes(transportEmissions)} tonnes CO2e/year</span
						>
					</div>
				</div>
			</div>

			<!-- Home Energy -->
			<div class="card">
				<div class="flex items-center gap-3 mb-6">
					<span class="text-2xl">🏠</span>
					<h2 class="font-orbitron font-bold">Home Energy</h2>
				</div>

				<div class="grid md:grid-cols-2 gap-6">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Electricity (kWh/month)
						</label>
						<input
							type="number"
							bind:value={electricityKwhMonthly}
							min="0"
							step="50"
							class="input"
						/>
					</div>

					<div class="flex items-center">
						<label class="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={electricityIsRenewable}
								class="w-5 h-5 rounded accent-solarpunk-teal"
							/>
							<span class="text-sm text-slate-300">Renewable electricity</span>
						</label>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Natural gas (therms/month)
						</label>
						<input
							type="number"
							bind:value={naturalGasThermsMonthly}
							min="0"
							step="5"
							class="input"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Heating oil (gallons/month)
						</label>
						<input
							type="number"
							bind:value={heatingOilGallonsMonthly}
							min="0"
							step="5"
							class="input"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Propane (gallons/month)
						</label>
						<input
							type="number"
							bind:value={propaneGallonsMonthly}
							min="0"
							step="5"
							class="input"
						/>
					</div>
				</div>

				<div class="mt-4 p-3 bg-slate-800/50 rounded-lg">
					<div class="flex justify-between items-center">
						<span class="text-sm text-slate-400">Home energy emissions:</span>
						<span class="font-medium text-solarpunk-teal"
							>{formatTonnes(homeEmissions)} tonnes CO2e/year</span
						>
					</div>
				</div>
			</div>

			<!-- Food -->
			<div class="card">
				<div class="flex items-center gap-3 mb-6">
					<span class="text-2xl">🥗</span>
					<h2 class="font-orbitron font-bold">Food & Diet</h2>
				</div>

				<div class="space-y-6">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-3"> Diet type </label>
						<div class="grid grid-cols-2 md:grid-cols-5 gap-2">
							{#each [
								{ value: 'vegan', label: 'Vegan' },
								{ value: 'vegetarian', label: 'Vegetarian' },
								{ value: 'pescatarian', label: 'Pescatarian' },
								{ value: 'omnivore', label: 'Omnivore' },
								{ value: 'heavy-meat', label: 'Heavy Meat' }
							] as option}
								<button
									on:click={() => setDietType(option.value)}
									class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
										{dietType === option.value
										? 'bg-solarpunk-teal text-slate-900'
										: 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
								>
									{option.label}
								</button>
							{/each}
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Local/seasonal food: {localFoodPercent}%
						</label>
						<input
							type="range"
							bind:value={localFoodPercent}
							min="0"
							max="100"
							step="5"
							class="w-full accent-solarpunk-teal"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Food waste: {foodWastePercent}%
						</label>
						<input
							type="range"
							bind:value={foodWastePercent}
							min="0"
							max="50"
							step="5"
							class="w-full accent-solarpunk-teal"
						/>
					</div>
				</div>

				<div class="mt-4 p-3 bg-slate-800/50 rounded-lg">
					<div class="flex justify-between items-center">
						<span class="text-sm text-slate-400">Food emissions:</span>
						<span class="font-medium text-solarpunk-teal"
							>{formatTonnes(foodEmissions)} tonnes CO2e/year</span
						>
					</div>
				</div>
			</div>

			<!-- Consumption -->
			<div class="card">
				<div class="flex items-center gap-3 mb-6">
					<span class="text-2xl">🛒</span>
					<h2 class="font-orbitron font-bold">Shopping & Consumption</h2>
				</div>

				<div class="space-y-6">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-3"> Shopping habits </label>
						<div class="grid grid-cols-3 gap-2">
							{#each [
								{ value: 'minimal', label: 'Minimal', desc: 'Buy only essentials' },
								{ value: 'average', label: 'Average', desc: 'Typical consumer' },
								{ value: 'frequent', label: 'Frequent', desc: 'Regular shopping' }
							] as option}
								<button
									on:click={() => setShoppingHabit(option.value)}
									class="p-3 rounded-lg text-sm transition-colors text-center
										{shoppingHabit === option.value
										? 'bg-solarpunk-teal text-slate-900'
										: 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
								>
									<div class="font-medium">{option.label}</div>
									<div class="text-xs opacity-75">{option.desc}</div>
								</button>
							{/each}
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							New electronics per year
						</label>
						<input
							type="number"
							bind:value={electronicsPerYear}
							min="0"
							max="20"
							step="1"
							class="input"
						/>
						<p class="text-xs text-slate-500 mt-1">Phones, laptops, TVs, etc.</p>
					</div>
				</div>

				<div class="mt-4 p-3 bg-slate-800/50 rounded-lg">
					<div class="flex justify-between items-center">
						<span class="text-sm text-slate-400">Consumption emissions:</span>
						<span class="font-medium text-solarpunk-teal"
							>{formatTonnes(consumptionEmissions)} tonnes CO2e/year</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- Results Sidebar -->
		<div class="space-y-6">
			<!-- Total -->
			<div class="card gradient-border sticky top-4">
				<h2 class="font-orbitron font-bold text-center mb-4">Your Carbon Footprint</h2>

				<div class="text-center mb-6">
					<div class="text-5xl font-orbitron font-bold text-solarpunk-teal">
						{formatTonnes(totalEmissions)}
					</div>
					<div class="text-slate-400">tonnes CO2e per year</div>
				</div>

				<!-- Comparison bars -->
				<div class="space-y-4 mb-6">
					<div>
						<div class="flex justify-between text-sm mb-1">
							<span class="text-slate-400">vs US Average (16t)</span>
							<span class="font-medium">{formatNumber(comparisonToAverage, 0)}%</span>
						</div>
						<div class="h-3 bg-slate-800 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-solarpunk-teal to-leaf-green rounded-full transition-all"
								style="width: {Math.min(comparisonToAverage, 150)}%"
							></div>
						</div>
					</div>

					<div>
						<div class="flex justify-between text-sm mb-1">
							<span class="text-slate-400">vs Sustainable Target (2t)</span>
							<span class="font-medium">{formatNumber(comparisonToTarget, 0)}%</span>
						</div>
						<div class="h-3 bg-slate-800 rounded-full overflow-hidden">
							<div
								class="h-full rounded-full transition-all
									{comparisonToTarget <= 100 ? 'bg-leaf-green' : comparisonToTarget <= 200 ? 'bg-solar-gold' : 'bg-red-500'}"
								style="width: {Math.min(comparisonToTarget / 8, 100)}%"
							></div>
						</div>
					</div>
				</div>

				<!-- Breakdown -->
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<span>🚗</span>
						<div class="flex-1">
							<div class="h-2 bg-slate-800 rounded-full overflow-hidden">
								<div
									class="h-full bg-sky-blue rounded-full"
									style="width: {(transportEmissions / totalEmissions) * 100}%"
								></div>
							</div>
						</div>
						<span class="text-sm text-slate-400"
							>{formatNumber((transportEmissions / totalEmissions) * 100, 0)}%</span
						>
					</div>
					<div class="flex items-center gap-3">
						<span>🏠</span>
						<div class="flex-1">
							<div class="h-2 bg-slate-800 rounded-full overflow-hidden">
								<div
									class="h-full bg-solar-gold rounded-full"
									style="width: {(homeEmissions / totalEmissions) * 100}%"
								></div>
							</div>
						</div>
						<span class="text-sm text-slate-400"
							>{formatNumber((homeEmissions / totalEmissions) * 100, 0)}%</span
						>
					</div>
					<div class="flex items-center gap-3">
						<span>🥗</span>
						<div class="flex-1">
							<div class="h-2 bg-slate-800 rounded-full overflow-hidden">
								<div
									class="h-full bg-leaf-green rounded-full"
									style="width: {(foodEmissions / totalEmissions) * 100}%"
								></div>
							</div>
						</div>
						<span class="text-sm text-slate-400"
							>{formatNumber((foodEmissions / totalEmissions) * 100, 0)}%</span
						>
					</div>
					<div class="flex items-center gap-3">
						<span>🛒</span>
						<div class="flex-1">
							<div class="h-2 bg-slate-800 rounded-full overflow-hidden">
								<div
									class="h-full bg-solarpunk-teal rounded-full"
									style="width: {(consumptionEmissions / totalEmissions) * 100}%"
								></div>
							</div>
						</div>
						<span class="text-sm text-slate-400"
							>{formatNumber((consumptionEmissions / totalEmissions) * 100, 0)}%</span
						>
					</div>
				</div>
			</div>

			<!-- Reduction Tips -->
			<div class="card">
				<h3 class="font-orbitron font-bold mb-4">Top Reduction Tips</h3>
				<p class="text-sm text-slate-500 mb-4">
					Your highest emissions come from <strong class="text-solarpunk-teal">{topCategory}</strong
					>. Here's how to reduce:
				</p>
				<ul class="space-y-2">
					{#each reductionTips.slice(0, 4) as tip}
						<li class="flex items-start gap-2 text-sm text-slate-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-4 h-4 text-leaf-green flex-shrink-0 mt-0.5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M20 6 9 17l-5-5" />
							</svg>
							{tip}
						</li>
					{/each}
				</ul>
			</div>

			<!-- Offset CTA -->
			<div class="card bg-gradient-to-br from-leaf-green/10 to-solarpunk-teal/10">
				<h3 class="font-orbitron font-bold mb-2">Can't reduce further?</h3>
				<p class="text-sm text-slate-400 mb-4">
					Consider supporting carbon offset projects or local environmental initiatives.
				</p>
				<a href="/directory?category=community" class="btn-secondary text-sm">
					Find Local Projects
				</a>
			</div>
		</div>
	</div>

	<!-- Disclaimer -->
	<div class="mt-8 text-xs text-slate-500 text-center max-w-2xl mx-auto">
		This calculator provides estimates for educational purposes based on average emission factors.
		Individual results may vary based on location, energy sources, and specific behaviors. Data
		sources: EPA, Carbon Trust, and IPCC guidelines.
	</div>
</div>
