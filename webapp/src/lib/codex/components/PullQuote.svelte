<script lang="ts">
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	// Props
	export let attribution: string | undefined = undefined;
	export let ornament: 'fleuron' | 'leaf' | 'sun' | 'none' = 'fleuron';

	// Get seasonal context
	const context = getContext<{ resolvedSeason: Readable<string> }>('codex');
	const resolvedSeason = context?.resolvedSeason;

	// Auto-select ornament based on season if not specified
	$: effectiveOrnament =
		ornament === 'fleuron' && $resolvedSeason
			? {
					winter: 'fleuron',
					spring: 'leaf',
					summer: 'sun',
					autumn: 'leaf'
				}[$resolvedSeason] || ornament
			: ornament;
</script>

<figure class="codex-pullquote" data-season={$resolvedSeason}>
	<!-- Opening ornament -->
	{#if effectiveOrnament !== 'none'}
		<span class="codex-pullquote__ornament codex-pullquote__ornament--open" aria-hidden="true">
			{#if effectiveOrnament === 'fleuron'}
				❧
			{:else if effectiveOrnament === 'leaf'}
				🌿
			{:else if effectiveOrnament === 'sun'}
				☀
			{/if}
		</span>
	{/if}

	<blockquote class="codex-pullquote__text">
		<slot />
	</blockquote>

	{#if attribution}
		<figcaption class="codex-pullquote__attribution">
			— {attribution}
		</figcaption>
	{/if}

	<!-- Closing ornament -->
	{#if effectiveOrnament !== 'none'}
		<span class="codex-pullquote__ornament codex-pullquote__ornament--close" aria-hidden="true">
			{#if effectiveOrnament === 'fleuron'}
				❧
			{:else if effectiveOrnament === 'leaf'}
				🌿
			{:else if effectiveOrnament === 'sun'}
				☀
			{/if}
		</span>
	{/if}
</figure>

<style>
	.codex-pullquote {
		position: relative;
		margin: var(--codex-space-12) var(--codex-space-4);
		padding: var(--codex-space-8) var(--codex-space-6);
		text-align: center;
		border-top: var(--codex-rule-double);
		border-bottom: var(--codex-rule-double);
	}

	.codex-pullquote__text {
		font-family: var(--codex-font-display);
		font-size: var(--codex-text-xl);
		font-style: italic;
		line-height: var(--codex-leading-relaxed);
		color: var(--codex-ink-sepia);
		margin: 0;
	}

	.codex-pullquote__text :global(p) {
		margin: 0;
	}

	.codex-pullquote__attribution {
		margin-top: var(--codex-space-4);
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
		font-style: normal;
		color: var(--codex-ink-muted);
		letter-spacing: 0.02em;
	}

	.codex-pullquote__ornament {
		display: block;
		font-size: var(--codex-text-2xl);
		color: var(--codex-accent);
		opacity: 0.6;
	}

	.codex-pullquote__ornament--open {
		margin-bottom: var(--codex-space-2);
	}

	.codex-pullquote__ornament--close {
		margin-top: var(--codex-space-2);
		transform: rotate(180deg);
	}

	/* Seasonal accent colors */
	.codex-pullquote[data-season='winter'] {
		border-color: var(--codex-winter-frost);
	}

	.codex-pullquote[data-season='winter'] .codex-pullquote__ornament {
		color: var(--codex-winter-frost);
	}

	.codex-pullquote[data-season='spring'] {
		border-color: var(--codex-spring-sprout);
	}

	.codex-pullquote[data-season='spring'] .codex-pullquote__ornament {
		color: var(--codex-spring-sprout);
	}

	.codex-pullquote[data-season='summer'] {
		border-color: var(--codex-summer-gold);
	}

	.codex-pullquote[data-season='summer'] .codex-pullquote__ornament {
		color: var(--codex-summer-gold);
	}

	.codex-pullquote[data-season='autumn'] {
		border-color: var(--codex-autumn-ember);
	}

	.codex-pullquote[data-season='autumn'] .codex-pullquote__ornament {
		color: var(--codex-autumn-ember);
	}
</style>
