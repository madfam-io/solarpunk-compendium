<script lang="ts">
	// Roof inputs
	let roofArea = 1500; // sq ft
	let roofType: 'metal' | 'tile' | 'asphalt' | 'flat' = 'asphalt';
	let roofPitch: 'flat' | 'low' | 'medium' | 'steep' = 'medium';

	// Location & rainfall
	let annualRainfall = 40; // inches
	let rainyDays = 100; // days per year

	// Usage
	let householdSize = 4;
	let gardenSize = 500; // sq ft
	let usageType: 'garden' | 'toilet' | 'laundry' | 'all-non-potable' = 'garden';

	// System preferences
	let tankMaterial: 'plastic' | 'fiberglass' | 'steel' | 'concrete' = 'plastic';
	let budgetRange: 'basic' | 'standard' | 'premium' = 'standard';

	// Runoff coefficients
	const RUNOFF_COEFFICIENTS = {
		metal: 0.95,
		tile: 0.9,
		asphalt: 0.85,
		flat: 0.7
	};

	// First flush - gallons per sq ft to divert
	const FIRST_FLUSH = 0.01; // gallons per sq ft

	// Water usage estimates (gallons per day)
	const USAGE_ESTIMATES = {
		garden: (size: number) => (size * 0.62) / 7, // ~0.62 gallons per sq ft per week
		toilet: (people: number) => people * 18, // ~18 gallons per person per day
		laundry: (people: number) => people * 15, // ~15 gallons per person per day
		'all-non-potable': (people: number, gardenSize: number) =>
			people * 33 + (gardenSize * 0.62) / 7
	};

	// Tank costs per gallon
	const TANK_COSTS = {
		plastic: { basic: 0.5, standard: 0.75, premium: 1.0 },
		fiberglass: { basic: 1.0, standard: 1.5, premium: 2.0 },
		steel: { basic: 1.5, standard: 2.0, premium: 2.75 },
		concrete: { basic: 2.0, standard: 2.5, premium: 3.5 }
	};

	// System component costs
	const COMPONENT_COSTS = {
		basic: { gutters: 300, downspout: 100, firstFlush: 50, filter: 75, pump: 0 },
		standard: { gutters: 500, downspout: 200, firstFlush: 100, filter: 150, pump: 200 },
		premium: { gutters: 800, downspout: 350, firstFlush: 200, filter: 300, pump: 500 }
	};

	// Calculations
	$: runoffCoefficient = RUNOFF_COEFFICIENTS[roofType];
	$: collectableWater = calculateCollectable();
	$: dailyUsage = calculateDailyUsage();
	$: annualUsage = dailyUsage * 365;
	$: daysOfSupply = collectableWater / dailyUsage;
	$: recommendedTankSize = calculateTankSize();
	$: systemCost = calculateSystemCost();
	$: waterSavings = calculateWaterSavings();
	$: paybackYears = systemCost.total / waterSavings.annual;

	function calculateCollectable(): number {
		// Gallons = (Roof Area × Rainfall × Runoff Coefficient × 0.623)
		// 0.623 converts inches of rain on sq ft to gallons
		return roofArea * annualRainfall * runoffCoefficient * 0.623;
	}

	function calculateDailyUsage(): number {
		switch (usageType) {
			case 'garden':
				return USAGE_ESTIMATES.garden(gardenSize);
			case 'toilet':
				return USAGE_ESTIMATES.toilet(householdSize);
			case 'laundry':
				return USAGE_ESTIMATES.laundry(householdSize);
			case 'all-non-potable':
				return USAGE_ESTIMATES['all-non-potable'](householdSize, gardenSize);
			default:
				return USAGE_ESTIMATES.garden(gardenSize);
		}
	}

	function calculateTankSize(): number {
		// Recommend storage for dry period (days between rain events)
		const avgDryPeriod = Math.ceil(365 / rainyDays);
		const minStorage = dailyUsage * avgDryPeriod;

		// Round up to nearest common tank size
		const commonSizes = [50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 2500, 3000, 5000];
		return commonSizes.find((size) => size >= minStorage) || 5000;
	}

	function calculateSystemCost(): { tank: number; components: number; total: number } {
		const tankCost = recommendedTankSize * TANK_COSTS[tankMaterial][budgetRange];
		const componentCost = Object.values(COMPONENT_COSTS[budgetRange]).reduce((a, b) => a + b, 0);
		return {
			tank: tankCost,
			components: componentCost,
			total: tankCost + componentCost
		};
	}

	function calculateWaterSavings(): { gallons: number; annual: number } {
		const usableWater = Math.min(collectableWater, annualUsage);
		// Average water cost ~$0.005 per gallon (varies widely)
		const annualSavings = usableWater * 0.005;
		return {
			gallons: usableWater,
			annual: annualSavings
		};
	}

	function formatNumber(value: number, decimals = 0): string {
		return value.toLocaleString('en-US', { maximumFractionDigits: decimals });
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(value);
	}

	// Type-safe setters
	type RoofType = typeof roofType;
	function setRoofType(value: string) {
		roofType = value as RoofType;
	}

	type UsageType = typeof usageType;
	function setUsageType(value: string) {
		usageType = value as UsageType;
	}

	type BudgetRange = typeof budgetRange;
	function setBudgetRange(value: string) {
		budgetRange = value as BudgetRange;
	}
</script>

<svelte:head>
	<title>Rainwater Harvesting Calculator | The Solarpunk Almanac</title>
	<meta
		name="description"
		content="Size your rainwater collection system based on roof area, local rainfall, and water needs."
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
			<span class="text-5xl">💧</span>
			<div>
				<h1 class="font-orbitron text-3xl md:text-4xl font-bold">Rainwater Harvesting Calculator</h1>
				<p class="text-slate-400">Size your collection system for maximum water independence</p>
			</div>
		</div>
	</div>

	<div class="grid lg:grid-cols-3 gap-8">
		<!-- Input Form -->
		<div class="lg:col-span-1 space-y-6">
			<!-- Roof -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Your Roof</h2>

				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Roof catchment area (sq ft)
						</label>
						<input type="number" bind:value={roofArea} min="100" step="100" class="input" />
						<p class="text-xs text-slate-500 mt-1">Footprint of roof sections draining to tanks</p>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-3"> Roof type </label>
						<div class="grid grid-cols-2 gap-2">
							{#each [
								{ value: 'metal', label: 'Metal', coef: '95%' },
								{ value: 'tile', label: 'Tile', coef: '90%' },
								{ value: 'asphalt', label: 'Asphalt Shingle', coef: '85%' },
								{ value: 'flat', label: 'Flat/Gravel', coef: '70%' }
							] as option}
								<button
									on:click={() => setRoofType(option.value)}
									class="p-2 rounded-lg text-sm transition-colors
										{roofType === option.value
										? 'bg-solarpunk-teal text-slate-900'
										: 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
								>
									<div class="font-medium">{option.label}</div>
									<div class="text-xs opacity-75">({option.coef} capture)</div>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Location -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Your Location</h2>

				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Annual rainfall: {annualRainfall}" per year
						</label>
						<input
							type="range"
							bind:value={annualRainfall}
							min="5"
							max="80"
							step="1"
							class="w-full accent-solarpunk-teal"
						/>
						<div class="flex justify-between text-xs text-slate-500">
							<span>Desert (5")</span>
							<span>Avg (40")</span>
							<span>Rainforest (80")</span>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Rainy days per year: {rainyDays}
						</label>
						<input
							type="range"
							bind:value={rainyDays}
							min="20"
							max="200"
							step="5"
							class="w-full accent-solarpunk-teal"
						/>
					</div>
				</div>
			</div>

			<!-- Water Usage -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Water Usage</h2>

				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2"> Household size </label>
						<input type="number" bind:value={householdSize} min="1" max="10" step="1" class="input" />
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Garden/landscape area (sq ft)
						</label>
						<input type="number" bind:value={gardenSize} min="0" step="50" class="input" />
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-3"> Intended use </label>
						<div class="space-y-2">
							{#each [
								{ value: 'garden', label: 'Garden/Irrigation', icon: '🌱' },
								{ value: 'toilet', label: 'Toilet Flushing', icon: '🚽' },
								{ value: 'laundry', label: 'Laundry', icon: '👕' },
								{ value: 'all-non-potable', label: 'All Non-Potable', icon: '🏠' }
							] as option}
								<button
									on:click={() => setUsageType(option.value)}
									class="w-full p-3 rounded-lg text-left flex items-center gap-3 transition-colors
										{usageType === option.value
										? 'bg-solarpunk-teal/10 border border-solarpunk-teal/30'
										: 'bg-slate-800 hover:bg-slate-700'}"
								>
									<span class="text-xl">{option.icon}</span>
									<span class="font-medium">{option.label}</span>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- System Preferences -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">System Options</h2>

				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-3"> Tank material </label>
						<select bind:value={tankMaterial} class="input">
							<option value="plastic">Polyethylene (Plastic)</option>
							<option value="fiberglass">Fiberglass</option>
							<option value="steel">Galvanized Steel</option>
							<option value="concrete">Concrete/Ferrocement</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-3"> Budget range </label>
						<div class="grid grid-cols-3 gap-2">
							{#each [
								{ value: 'basic', label: 'Basic' },
								{ value: 'standard', label: 'Standard' },
								{ value: 'premium', label: 'Premium' }
							] as option}
								<button
									on:click={() => setBudgetRange(option.value)}
									class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
										{budgetRange === option.value
										? 'bg-solarpunk-teal text-slate-900'
										: 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
								>
									{option.label}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Results -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Key metrics -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div class="card text-center">
					<div class="text-3xl font-orbitron font-bold text-sky-blue">
						{formatNumber(collectableWater)}
					</div>
					<div class="text-sm text-slate-400">Gallons/Year</div>
				</div>
				<div class="card text-center">
					<div class="text-3xl font-orbitron font-bold text-solarpunk-teal">
						{formatNumber(recommendedTankSize)}
					</div>
					<div class="text-sm text-slate-400">Gallon Tank</div>
				</div>
				<div class="card text-center">
					<div class="text-3xl font-orbitron font-bold text-leaf-green">
						{formatCurrency(systemCost.total)}
					</div>
					<div class="text-sm text-slate-400">Est. Cost</div>
				</div>
				<div class="card text-center">
					<div class="text-3xl font-orbitron font-bold text-solar-gold">
						{formatNumber(Math.min(daysOfSupply, 365))}
					</div>
					<div class="text-sm text-slate-400">Days Supply</div>
				</div>
			</div>

			<!-- Collection potential -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Collection Potential</h2>

				<div class="space-y-4">
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Roof catchment area</span>
						<span class="font-medium">{formatNumber(roofArea)} sq ft</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Annual rainfall</span>
						<span class="font-medium">{annualRainfall}" per year</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Runoff coefficient ({roofType})</span>
						<span class="font-medium">{(runoffCoefficient * 100).toFixed(0)}%</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Gross collection potential</span>
						<span class="font-medium"
							>{formatNumber(roofArea * annualRainfall * 0.623)} gallons/year</span
						>
					</div>
					<div class="flex justify-between py-3">
						<span class="text-slate-400">Net collectable (after losses)</span>
						<span class="font-medium text-sky-blue">{formatNumber(collectableWater)} gallons/year</span
						>
					</div>
				</div>

				<div class="mt-4 p-4 bg-sky-blue/10 rounded-lg">
					<p class="text-sm text-slate-300">
						That's equivalent to <strong class="text-sky-blue"
							>{formatNumber(collectableWater / 748)} CCF</strong
						>
						(100 cubic feet) or about <strong class="text-sky-blue"
							>{formatNumber(collectableWater / 12)} months</strong
						> of typical household water use.
					</p>
				</div>
			</div>

			<!-- Usage analysis -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Usage Analysis</h2>

				<div class="space-y-4">
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Daily water need ({usageType})</span>
						<span class="font-medium">{formatNumber(dailyUsage, 1)} gallons</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Annual water need</span>
						<span class="font-medium">{formatNumber(annualUsage)} gallons</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Average dry period</span>
						<span class="font-medium">{Math.ceil(365 / rainyDays)} days</span>
					</div>
					<div class="flex justify-between py-3">
						<span class="text-slate-400">Coverage potential</span>
						<span
							class="font-medium {collectableWater >= annualUsage ? 'text-leaf-green' : 'text-solar-gold'}"
						>
							{formatNumber(Math.min((collectableWater / annualUsage) * 100, 100))}% of needs
						</span>
					</div>
				</div>

				{#if collectableWater < annualUsage}
					<div class="mt-4 p-4 bg-solar-gold/10 rounded-lg">
						<p class="text-sm text-slate-300">
							Your roof can supply about <strong class="text-solar-gold"
								>{formatNumber((collectableWater / annualUsage) * 100)}%</strong
							> of your intended usage. Consider expanding collection area or reducing usage scope for
							full coverage.
						</p>
					</div>
				{:else}
					<div class="mt-4 p-4 bg-leaf-green/10 rounded-lg">
						<p class="text-sm text-slate-300">
							Your roof collects <strong class="text-leaf-green">more than enough</strong> water for
							your intended usage. You could expand your usage or use a smaller system.
						</p>
					</div>
				{/if}
			</div>

			<!-- System sizing -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Recommended System</h2>

				<div class="grid md:grid-cols-2 gap-6">
					<div>
						<h3 class="font-semibold mb-4 text-slate-300">Tank Specification</h3>
						<div class="space-y-3">
							<div class="flex justify-between">
								<span class="text-slate-400">Recommended capacity</span>
								<span class="font-medium">{formatNumber(recommendedTankSize)} gallons</span>
							</div>
							<div class="flex justify-between">
								<span class="text-slate-400">Material</span>
								<span class="font-medium capitalize">{tankMaterial}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-slate-400">Storage days</span>
								<span class="font-medium">{Math.ceil(recommendedTankSize / dailyUsage)} days</span>
							</div>
						</div>
					</div>

					<div>
						<h3 class="font-semibold mb-4 text-slate-300">Components Needed</h3>
						<ul class="space-y-2 text-sm">
							<li class="flex items-center gap-2 text-slate-400">
								<span class="text-leaf-green">✓</span> Gutters & downspouts
							</li>
							<li class="flex items-center gap-2 text-slate-400">
								<span class="text-leaf-green">✓</span> First-flush diverter
							</li>
							<li class="flex items-center gap-2 text-slate-400">
								<span class="text-leaf-green">✓</span> Leaf screen/filter
							</li>
							<li class="flex items-center gap-2 text-slate-400">
								<span class="text-leaf-green">✓</span> Overflow outlet
							</li>
							{#if budgetRange !== 'basic'}
								<li class="flex items-center gap-2 text-slate-400">
									<span class="text-leaf-green">✓</span> Pump & pressure system
								</li>
							{/if}
						</ul>
					</div>
				</div>
			</div>

			<!-- Cost breakdown -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Cost Estimate ({budgetRange})</h2>

				<div class="space-y-4">
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400"
							>{formatNumber(recommendedTankSize)} gallon {tankMaterial} tank</span
						>
						<span class="font-medium">{formatCurrency(systemCost.tank)}</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Gutters & downspouts</span>
						<span class="font-medium"
							>{formatCurrency(COMPONENT_COSTS[budgetRange].gutters + COMPONENT_COSTS[budgetRange].downspout)}</span
						>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">First-flush & filtration</span>
						<span class="font-medium"
							>{formatCurrency(COMPONENT_COSTS[budgetRange].firstFlush + COMPONENT_COSTS[budgetRange].filter)}</span
						>
					</div>
					{#if COMPONENT_COSTS[budgetRange].pump > 0}
						<div class="flex justify-between py-3 border-b border-slate-800">
							<span class="text-slate-400">Pump system</span>
							<span class="font-medium">{formatCurrency(COMPONENT_COSTS[budgetRange].pump)}</span>
						</div>
					{/if}
					<div class="flex justify-between py-3 text-lg">
						<span class="font-medium">Total estimated cost</span>
						<span class="font-bold text-solarpunk-teal">{formatCurrency(systemCost.total)}</span>
					</div>
				</div>

				<div class="mt-4 grid grid-cols-2 gap-4 text-center">
					<div class="p-4 bg-slate-800/50 rounded-lg">
						<div class="text-xl font-orbitron font-bold text-leaf-green">
							{formatCurrency(waterSavings.annual)}
						</div>
						<div class="text-sm text-slate-500">Annual water savings</div>
					</div>
					<div class="p-4 bg-slate-800/50 rounded-lg">
						<div class="text-xl font-orbitron font-bold text-solar-gold">
							{paybackYears > 50 ? '50+' : formatNumber(paybackYears, 1)}
						</div>
						<div class="text-sm text-slate-500">Years payback</div>
					</div>
				</div>

				<p class="text-xs text-slate-500 mt-4">
					* Costs are estimates and vary by location. Payback calculation based on water cost of
					$0.005/gallon. The real value includes water security, reduced stormwater runoff, and
					environmental benefits.
				</p>
			</div>

			<!-- Disclaimer -->
			<div class="text-xs text-slate-500 text-center">
				This calculator provides estimates for planning purposes. Check local regulations for
				rainwater harvesting permits and requirements. Some areas restrict or incentivize rainwater
				collection.
			</div>
		</div>
	</div>
</div>
