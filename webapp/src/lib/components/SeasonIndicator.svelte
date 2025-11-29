<script lang="ts">
	import { onMount } from 'svelte';

	type Season = 'spring' | 'summer' | 'fall' | 'winter';

	let currentSeason: Season = 'fall';
	let currentYear = 2025;

	const seasons: { key: Season; color: string; label: string }[] = [
		{ key: 'spring', color: 'bg-green-400', label: 'Spring' },
		{ key: 'summer', color: 'bg-yellow-400', label: 'Summer' },
		{ key: 'fall', color: 'bg-orange-400', label: 'Fall' },
		{ key: 'winter', color: 'bg-blue-400', label: 'Winter' }
	];

	onMount(() => {
		const now = new Date();
		const month = now.getMonth();
		currentYear = now.getFullYear();

		if (month >= 2 && month <= 4) currentSeason = 'spring';
		else if (month >= 5 && month <= 7) currentSeason = 'summer';
		else if (month >= 8 && month <= 10) currentSeason = 'fall';
		else currentSeason = 'winter';
	});
</script>

<div class="hidden sm:flex items-center gap-1.5">
	{#each seasons as season}
		<span
			class="season-dot {season.color} {currentSeason === season.key ? 'active' : ''}"
			title={season.label}
		/>
	{/each}
	<span class="text-xs text-slate-500 ml-1 uppercase tracking-wider">
		{seasons.find(s => s.key === currentSeason)?.label} {currentYear}
	</span>
</div>
