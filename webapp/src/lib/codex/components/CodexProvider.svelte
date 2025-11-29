<script lang="ts" context="module">
	export type ReadingMode = 'flow' | 'codex' | 'focus';
	export type Season = 'winter' | 'spring' | 'summer' | 'autumn' | 'auto';

	export interface CodexContext {
		mode: ReadingMode;
		season: Season;
		resolvedSeason: Exclude<Season, 'auto'>;
		sounds: boolean;
		setMode: (mode: ReadingMode) => void;
		setSeason: (season: Season) => void;
		toggleSounds: () => void;
	}
</script>

<script lang="ts">
	import { setContext, onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { browser } from '$app/environment';

	// Props - season accepts string for flexibility with server data
	export let mode: ReadingMode = 'flow';
	export let season: Season | string = 'auto';
	export let sounds: boolean = false;

	// Validate and normalize season prop
	function normalizeSeason(s: Season | string): Season {
		const valid: Season[] = ['winter', 'spring', 'summer', 'autumn', 'auto'];
		return valid.includes(s as Season) ? (s as Season) : 'auto';
	}

	// Stores
	const modeStore = writable<ReadingMode>(mode);
	const seasonStore = writable<Season>(normalizeSeason(season));
	const soundsStore = writable<boolean>(sounds);

	/**
	 * Determine the current season based on date
	 */
	function getCurrentSeason(): Exclude<Season, 'auto'> {
		const now = new Date();
		const month = now.getMonth(); // 0-11
		const day = now.getDate();

		// Approximate astronomical seasons
		// Winter: Dec 21 - Mar 19
		// Spring: Mar 20 - Jun 20
		// Summer: Jun 21 - Sep 21
		// Autumn: Sep 22 - Dec 20

		if ((month === 11 && day >= 21) || month <= 1 || (month === 2 && day < 20)) {
			return 'winter';
		} else if ((month === 2 && day >= 20) || month <= 4 || (month === 5 && day < 21)) {
			return 'spring';
		} else if ((month === 5 && day >= 21) || month <= 7 || (month === 8 && day < 22)) {
			return 'summer';
		} else {
			return 'autumn';
		}
	}

	// Resolved season (auto -> actual season)
	const resolvedSeason = derived(seasonStore, ($season) => {
		if ($season === 'auto') {
			return getCurrentSeason();
		}
		return $season;
	});

	// Context methods
	function setMode(newMode: ReadingMode) {
		modeStore.set(newMode);
		if (browser) {
			localStorage.setItem('codex-mode', newMode);
		}
	}

	function setSeason(newSeason: Season) {
		seasonStore.set(newSeason);
		if (browser) {
			localStorage.setItem('codex-season', newSeason);
		}
	}

	function toggleSounds() {
		soundsStore.update((s) => {
			const newValue = !s;
			if (browser) {
				localStorage.setItem('codex-sounds', String(newValue));
			}
			return newValue;
		});
	}

	// Provide context
	setContext('codex', {
		mode: modeStore,
		season: seasonStore,
		resolvedSeason,
		sounds: soundsStore,
		setMode,
		setSeason,
		toggleSounds
	});

	// Restore preferences from localStorage
	onMount(() => {
		if (browser) {
			const savedMode = localStorage.getItem('codex-mode') as ReadingMode | null;
			const savedSeason = localStorage.getItem('codex-season') as Season | null;
			const savedSounds = localStorage.getItem('codex-sounds');

			if (savedMode) modeStore.set(savedMode);
			if (savedSeason) seasonStore.set(savedSeason);
			if (savedSounds !== null) soundsStore.set(savedSounds === 'true');
		}
	});

	// Reactive: update props when stores change
	$: mode = $modeStore;
	$: season = $seasonStore;
	$: sounds = $soundsStore;
</script>

<div
	class="codex-provider"
	data-reading-mode={$modeStore}
	data-season={$resolvedSeason}
	data-sounds={$soundsStore}
>
	<slot />
</div>

<style>
	.codex-provider {
		/* Base container for Codex-styled content */
		min-height: 100%;
		transition: background-color var(--codex-duration-slow) var(--codex-ease-default);
	}

	/* Reading mode backgrounds */
	.codex-provider[data-reading-mode='flow'] {
		background: var(--codex-paper-tint, var(--codex-paper-cream));
	}

	.codex-provider[data-reading-mode='codex'] {
		background: linear-gradient(
			to right,
			var(--codex-paper-aged) 0%,
			var(--codex-paper-cream) 5%,
			var(--codex-paper-cream) 95%,
			var(--codex-paper-aged) 100%
		);
	}

	.codex-provider[data-reading-mode='focus'] {
		background: var(--codex-paper-white);
	}
</style>
