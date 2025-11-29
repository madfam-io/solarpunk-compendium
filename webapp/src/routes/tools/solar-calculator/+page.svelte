<script lang="ts">
	// Form inputs
	let monthlyBill = 150;
	let electricityRate = 0.12; // $/kWh
	let roofSpace = 400; // sq ft
	let sunHours = 5; // peak sun hours per day
	let systemType: 'grid-tied' | 'off-grid' | 'hybrid' = 'grid-tied';
	let offsetGoal = 100; // percentage

	// Constants
	const PANEL_WATTAGE = 400; // watts per panel
	const PANEL_SIZE = 18; // sq ft per panel
	const COST_PER_WATT = 2.75; // installed cost
	const BATTERY_COST_PER_KWH = 400;
	const SYSTEM_EFFICIENCY = 0.85;
	const ANNUAL_DEGRADATION = 0.005;

	// Calculations
	$: monthlyKwh = monthlyBill / electricityRate;
	$: annualKwh = monthlyKwh * 12;
	$: targetKwh = (annualKwh * offsetGoal) / 100;

	$: dailyProduction = (systemSizeKw: number) => systemSizeKw * sunHours * SYSTEM_EFFICIENCY;
	$: requiredSystemKw = targetKwh / (sunHours * 365 * SYSTEM_EFFICIENCY);

	$: maxPanelsBySpace = Math.floor(roofSpace / PANEL_SIZE);
	$: maxSystemBySpace = (maxPanelsBySpace * PANEL_WATTAGE) / 1000;

	$: recommendedSystemKw = Math.min(requiredSystemKw, maxSystemBySpace);
	$: numberOfPanels = Math.ceil((recommendedSystemKw * 1000) / PANEL_WATTAGE);
	$: actualSystemKw = (numberOfPanels * PANEL_WATTAGE) / 1000;

	$: systemCost = actualSystemKw * 1000 * COST_PER_WATT;
	$: batteryCost = systemType !== 'grid-tied' ? actualSystemKw * 2 * BATTERY_COST_PER_KWH : 0;
	$: totalCost = systemCost + batteryCost;

	$: annualProduction = dailyProduction(actualSystemKw) * 365;
	$: annualSavings = Math.min(annualProduction, annualKwh) * electricityRate;
	$: paybackYears = totalCost / annualSavings;

	$: co2Avoided = annualProduction * 0.42; // kg CO2 per kWh (US average)
	$: treesEquivalent = Math.round(co2Avoided / 21); // ~21kg CO2 per tree per year

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
	}

	function formatNumber(value: number, decimals = 1): string {
		return value.toFixed(decimals);
	}
</script>

<svelte:head>
	<title>Solar System Sizer | The Solarpunk Almanac</title>
	<meta name="description" content="Calculate the right solar panel system size for your home. Estimate costs, savings, and environmental impact." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<!-- Header -->
	<div class="mb-8">
		<a href="/tools" class="text-sm text-slate-500 hover:text-solarpunk-teal transition-colors flex items-center gap-1 mb-4">
			<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			Back to Tools
		</a>
		<div class="flex items-center gap-4">
			<span class="text-5xl">☀️</span>
			<div>
				<h1 class="font-orbitron text-3xl md:text-4xl font-bold">
					Solar System Sizer
				</h1>
				<p class="text-slate-400">Calculate the right solar setup for your needs</p>
			</div>
		</div>
	</div>

	<div class="grid lg:grid-cols-3 gap-8">
		<!-- Input Form -->
		<div class="lg:col-span-1 space-y-6">
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Your Energy Usage</h2>

				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Monthly Electric Bill
						</label>
						<div class="relative">
							<span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
							<input
								type="number"
								bind:value={monthlyBill}
								min="0"
								step="10"
								class="input pl-8"
							/>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Electricity Rate ($/kWh)
						</label>
						<input
							type="number"
							bind:value={electricityRate}
							min="0.01"
							step="0.01"
							class="input"
						/>
						<p class="text-xs text-slate-500 mt-1">Check your bill. US average: $0.12</p>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Energy Offset Goal: {offsetGoal}%
						</label>
						<input
							type="range"
							bind:value={offsetGoal}
							min="25"
							max="120"
							step="5"
							class="w-full accent-solarpunk-teal"
						/>
						<div class="flex justify-between text-xs text-slate-500">
							<span>25%</span>
							<span>100%</span>
							<span>120%</span>
						</div>
					</div>
				</div>
			</div>

			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Your Location & Space</h2>

				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Available Roof Space (sq ft)
						</label>
						<input
							type="number"
							bind:value={roofSpace}
							min="100"
							step="50"
							class="input"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300 mb-2">
							Peak Sun Hours/Day: {sunHours}
						</label>
						<input
							type="range"
							bind:value={sunHours}
							min="3"
							max="7"
							step="0.5"
							class="w-full accent-solarpunk-teal"
						/>
						<div class="flex justify-between text-xs text-slate-500">
							<span>3 (cloudy)</span>
							<span>5 (average)</span>
							<span>7 (sunny)</span>
						</div>
					</div>
				</div>
			</div>

			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">System Type</h2>

				<div class="space-y-3">
					{#each [
						{ value: 'grid-tied', label: 'Grid-Tied', desc: 'Lowest cost, sell excess to grid' },
						{ value: 'hybrid', label: 'Hybrid', desc: 'Battery backup + grid connection' },
						{ value: 'off-grid', label: 'Off-Grid', desc: 'Complete energy independence' }
					] as option}
						<label class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
							{systemType === option.value ? 'bg-solarpunk-teal/10 border border-solarpunk-teal/30' : 'hover:bg-slate-800'}">
							<input
								type="radio"
								name="systemType"
								value={option.value}
								bind:group={systemType}
								class="mt-1 accent-solarpunk-teal"
							/>
							<div>
								<div class="font-medium">{option.label}</div>
								<div class="text-xs text-slate-500">{option.desc}</div>
							</div>
						</label>
					{/each}
				</div>
			</div>
		</div>

		<!-- Results -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Key metrics -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div class="card text-center">
					<div class="text-3xl font-orbitron font-bold text-solarpunk-teal">
						{formatNumber(actualSystemKw)}
					</div>
					<div class="text-sm text-slate-400">kW System</div>
				</div>
				<div class="card text-center">
					<div class="text-3xl font-orbitron font-bold text-solar-gold">
						{numberOfPanels}
					</div>
					<div class="text-sm text-slate-400">Panels</div>
				</div>
				<div class="card text-center">
					<div class="text-3xl font-orbitron font-bold text-leaf-green">
						{formatCurrency(totalCost)}
					</div>
					<div class="text-sm text-slate-400">Est. Cost</div>
				</div>
				<div class="card text-center">
					<div class="text-3xl font-orbitron font-bold text-sky-blue">
						{formatNumber(paybackYears)}
					</div>
					<div class="text-sm text-slate-400">Years Payback</div>
				</div>
			</div>

			<!-- Detailed breakdown -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">System Details</h2>

				<div class="space-y-4">
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Your monthly usage</span>
						<span class="font-medium">{formatNumber(monthlyKwh, 0)} kWh</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Annual usage</span>
						<span class="font-medium">{formatNumber(annualKwh, 0)} kWh</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Target production ({offsetGoal}%)</span>
						<span class="font-medium">{formatNumber(targetKwh, 0)} kWh/year</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">System size needed</span>
						<span class="font-medium">{formatNumber(requiredSystemKw)} kW</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Max by roof space</span>
						<span class="font-medium">{formatNumber(maxSystemBySpace)} kW ({maxPanelsBySpace} panels)</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Panel wattage</span>
						<span class="font-medium">{PANEL_WATTAGE}W each</span>
					</div>
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Est. annual production</span>
						<span class="font-medium text-solarpunk-teal">{formatNumber(annualProduction, 0)} kWh</span>
					</div>
					<div class="flex justify-between py-3">
						<span class="text-slate-400">Est. annual savings</span>
						<span class="font-medium text-leaf-green">{formatCurrency(annualSavings)}</span>
					</div>
				</div>
			</div>

			<!-- Cost breakdown -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-6">Cost Breakdown</h2>

				<div class="space-y-4">
					<div class="flex justify-between py-3 border-b border-slate-800">
						<span class="text-slate-400">Solar panels + installation</span>
						<span class="font-medium">{formatCurrency(systemCost)}</span>
					</div>
					{#if batteryCost > 0}
						<div class="flex justify-between py-3 border-b border-slate-800">
							<span class="text-slate-400">Battery storage</span>
							<span class="font-medium">{formatCurrency(batteryCost)}</span>
						</div>
					{/if}
					<div class="flex justify-between py-3 text-lg">
						<span class="font-medium">Total estimated cost</span>
						<span class="font-bold text-solarpunk-teal">{formatCurrency(totalCost)}</span>
					</div>
				</div>

				<p class="text-xs text-slate-500 mt-4">
					* Costs are estimates and vary by location and installer. Federal tax credit (30% ITC) not included.
					After tax credit: ~{formatCurrency(totalCost * 0.7)}
				</p>
			</div>

			<!-- Environmental impact -->
			<div class="card bg-gradient-to-br from-leaf-green/10 to-solarpunk-teal/10">
				<h2 class="font-orbitron font-bold mb-6">Environmental Impact</h2>

				<div class="grid md:grid-cols-2 gap-6">
					<div class="text-center">
						<div class="text-4xl font-orbitron font-bold text-leaf-green">
							{formatNumber(co2Avoided / 1000, 1)}
						</div>
						<div class="text-sm text-slate-400">Tonnes CO₂ avoided per year</div>
					</div>
					<div class="text-center">
						<div class="text-4xl font-orbitron font-bold text-leaf-green">
							{treesEquivalent}
						</div>
						<div class="text-sm text-slate-400">Equivalent trees planted</div>
					</div>
				</div>

				<p class="text-center text-slate-400 mt-6">
					Over 25 years, this system could avoid <strong class="text-leaf-green">{formatNumber((co2Avoided * 25) / 1000, 0)} tonnes</strong> of CO₂ emissions.
				</p>
			</div>

			<!-- Disclaimer -->
			<div class="text-xs text-slate-500 text-center">
				This calculator provides estimates for educational purposes. Consult with local solar installers for accurate quotes.
				Results assume {PANEL_WATTAGE}W panels, ${COST_PER_WATT}/W installed cost, and {(SYSTEM_EFFICIENCY * 100)}% system efficiency.
			</div>
		</div>
	</div>
</div>
