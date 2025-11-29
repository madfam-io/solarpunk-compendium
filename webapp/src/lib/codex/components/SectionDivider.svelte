<script lang="ts">
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	// Props
	export let style: 'simple' | 'ornate' | 'asterism' | 'flourish' = 'simple';
	export let spacing: 'normal' | 'large' = 'normal';

	// Get seasonal context
	const context = getContext<{ resolvedSeason: Readable<string> }>('codex');
	const resolvedSeason = context?.resolvedSeason;
</script>

<hr
	class="codex-divider"
	class:codex-divider--simple={style === 'simple'}
	class:codex-divider--ornate={style === 'ornate'}
	class:codex-divider--asterism={style === 'asterism'}
	class:codex-divider--flourish={style === 'flourish'}
	class:codex-divider--large={spacing === 'large'}
	data-season={$resolvedSeason}
	aria-hidden="true"
/>

<style>
	.codex-divider {
		border: none;
		margin: var(--codex-space-8) auto;
		position: relative;
		height: auto;
		background: transparent;
	}

	.codex-divider--large {
		margin: var(--codex-space-16) auto;
	}

	/* Simple line */
	.codex-divider--simple {
		width: 40%;
		height: 1px;
		background: var(--codex-ink-light);
	}

	/* Ornate with decorative ends */
	.codex-divider--ornate {
		width: 60%;
		height: 3px;
		background: linear-gradient(
			to right,
			transparent 0%,
			var(--codex-ink-light) 20%,
			var(--codex-ink-light) 80%,
			transparent 100%
		);
	}

	.codex-divider--ornate::before,
	.codex-divider--ornate::after {
		content: '◆';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		font-size: var(--codex-text-xs);
		color: var(--codex-ink-light);
	}

	.codex-divider--ornate::before {
		left: 15%;
	}

	.codex-divider--ornate::after {
		right: 15%;
	}

	/* Asterism (three asterisks) */
	.codex-divider--asterism {
		text-align: center;
		height: auto;
		line-height: 1;
	}

	.codex-divider--asterism::before {
		content: '⁂';
		font-size: var(--codex-text-xl);
		color: var(--codex-ink-muted);
		letter-spacing: 0.5em;
	}

	/* Flourish with seasonal ornament */
	.codex-divider--flourish {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--codex-space-4);
		width: 80%;
	}

	.codex-divider--flourish::before,
	.codex-divider--flourish::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--codex-ink-light);
		max-width: 6rem;
	}

	/* Seasonal ornaments for flourish */
	.codex-divider--flourish[data-season='winter']::before {
		background: linear-gradient(to right, transparent, var(--codex-winter-frost));
	}
	.codex-divider--flourish[data-season='winter']::after {
		background: linear-gradient(to left, transparent, var(--codex-winter-frost));
	}

	.codex-divider--flourish[data-season='spring']::before {
		background: linear-gradient(to right, transparent, var(--codex-spring-sprout));
	}
	.codex-divider--flourish[data-season='spring']::after {
		background: linear-gradient(to left, transparent, var(--codex-spring-sprout));
	}

	.codex-divider--flourish[data-season='summer']::before {
		background: linear-gradient(to right, transparent, var(--codex-summer-gold));
	}
	.codex-divider--flourish[data-season='summer']::after {
		background: linear-gradient(to left, transparent, var(--codex-summer-gold));
	}

	.codex-divider--flourish[data-season='autumn']::before {
		background: linear-gradient(to right, transparent, var(--codex-autumn-ember));
	}
	.codex-divider--flourish[data-season='autumn']::after {
		background: linear-gradient(to left, transparent, var(--codex-autumn-ember));
	}
</style>
