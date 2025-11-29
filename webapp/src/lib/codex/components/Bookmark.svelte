<script lang="ts">
	import { getContext, createEventDispatcher } from 'svelte';
	import type { Readable } from 'svelte/store';

	const dispatch = createEventDispatcher<{
		toggle: { saved: boolean };
	}>();

	// Props
	export let saved: boolean = false;
	export let style: 'ribbon' | 'dog-ear' | 'tab' = 'ribbon';
	export let position: 'top-right' | 'top-left' | 'bottom-right' = 'top-right';
	export let label: string = 'Bookmark this page';

	// Get seasonal accent from context
	const context = getContext<{ resolvedSeason: Readable<string> }>('codex');
	const resolvedSeason = context?.resolvedSeason;

	function toggle() {
		saved = !saved;
		dispatch('toggle', { saved });
	}

	// Keyboard handler
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggle();
		}
	}
</script>

<button
	class="codex-bookmark"
	class:codex-bookmark--saved={saved}
	class:codex-bookmark--ribbon={style === 'ribbon'}
	class:codex-bookmark--dog-ear={style === 'dog-ear'}
	class:codex-bookmark--tab={style === 'tab'}
	class:codex-bookmark--top-right={position === 'top-right'}
	class:codex-bookmark--top-left={position === 'top-left'}
	class:codex-bookmark--bottom-right={position === 'bottom-right'}
	data-season={$resolvedSeason}
	on:click={toggle}
	on:keydown={handleKeydown}
	aria-pressed={saved}
	aria-label={label}
	title={saved ? 'Remove bookmark' : 'Add bookmark'}
>
	{#if style === 'ribbon'}
		<svg class="codex-bookmark__ribbon" viewBox="0 0 24 40" fill="currentColor">
			<path d="M0 0h24v40l-12-8-12 8V0z" />
		</svg>
	{:else if style === 'dog-ear'}
		<svg class="codex-bookmark__dog-ear" viewBox="0 0 32 32">
			<path d="M32 0v32H0L32 0z" fill="currentColor" />
		</svg>
	{:else if style === 'tab'}
		<span class="codex-bookmark__tab">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
			</svg>
		</span>
	{/if}
</button>

<style>
	.codex-bookmark {
		position: absolute;
		z-index: var(--codex-z-bookmark);
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		transition:
			transform var(--codex-duration-fast) var(--codex-ease-default),
			opacity var(--codex-duration-fast) var(--codex-ease-default);
	}

	/* Position variants */
	.codex-bookmark--top-right {
		top: 0;
		right: var(--codex-space-4);
	}

	.codex-bookmark--top-left {
		top: 0;
		left: var(--codex-space-4);
	}

	.codex-bookmark--bottom-right {
		bottom: var(--codex-space-4);
		right: var(--codex-space-4);
	}

	/* ═══════════════════════════════════════════════════════════
     RIBBON STYLE
     ═══════════════════════════════════════════════════════════ */

	.codex-bookmark--ribbon {
		width: 24px;
		height: 40px;
	}

	.codex-bookmark__ribbon {
		width: 100%;
		height: 100%;
		color: var(--codex-ink-light);
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
		transition:
			color var(--codex-duration-fast) var(--codex-ease-default),
			transform var(--codex-duration-fast) var(--codex-ease-default);
	}

	.codex-bookmark--ribbon:hover .codex-bookmark__ribbon {
		transform: translateY(4px);
	}

	.codex-bookmark--ribbon.codex-bookmark--saved .codex-bookmark__ribbon {
		color: var(--codex-accent);
		transform: translateY(8px);
	}

	/* Seasonal ribbon colors */
	.codex-bookmark--ribbon[data-season='winter'].codex-bookmark--saved .codex-bookmark__ribbon {
		color: var(--codex-winter-frost);
	}

	.codex-bookmark--ribbon[data-season='spring'].codex-bookmark--saved .codex-bookmark__ribbon {
		color: var(--codex-spring-sprout);
	}

	.codex-bookmark--ribbon[data-season='summer'].codex-bookmark--saved .codex-bookmark__ribbon {
		color: var(--codex-summer-gold);
	}

	.codex-bookmark--ribbon[data-season='autumn'].codex-bookmark--saved .codex-bookmark__ribbon {
		color: var(--codex-autumn-ember);
	}

	/* ═══════════════════════════════════════════════════════════
     DOG-EAR STYLE
     ═══════════════════════════════════════════════════════════ */

	.codex-bookmark--dog-ear {
		width: 32px;
		height: 32px;
		top: 0;
		right: 0;
	}

	.codex-bookmark__dog-ear {
		width: 100%;
		height: 100%;
		color: var(--codex-paper-aged);
		filter: drop-shadow(-2px 2px 3px rgba(0, 0, 0, 0.15));
		transition:
			color var(--codex-duration-fast) var(--codex-ease-default),
			transform var(--codex-duration-fast) var(--codex-ease-default);
	}

	.codex-bookmark--dog-ear:hover .codex-bookmark__dog-ear {
		transform: scale(1.1);
	}

	.codex-bookmark--dog-ear:not(.codex-bookmark--saved) .codex-bookmark__dog-ear {
		opacity: 0.3;
	}

	.codex-bookmark--dog-ear.codex-bookmark--saved .codex-bookmark__dog-ear {
		color: var(--codex-accent-soft);
		transform: scale(1.2);
	}

	/* ═══════════════════════════════════════════════════════════
     TAB STYLE
     ═══════════════════════════════════════════════════════════ */

	.codex-bookmark--tab {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--codex-paper-aged);
		border-radius: var(--codex-radius-soft);
		box-shadow: var(--codex-shadow-page);
	}

	.codex-bookmark__tab {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.codex-bookmark__tab svg {
		width: 20px;
		height: 20px;
		color: var(--codex-ink-muted);
		transition: color var(--codex-duration-fast) var(--codex-ease-default);
	}

	.codex-bookmark--tab:hover .codex-bookmark__tab svg {
		color: var(--codex-ink-sepia);
	}

	.codex-bookmark--tab.codex-bookmark--saved {
		background: var(--codex-accent);
	}

	.codex-bookmark--tab.codex-bookmark--saved .codex-bookmark__tab svg {
		color: white;
		fill: white;
	}

	/* Focus styles for accessibility */
	.codex-bookmark:focus-visible {
		outline: 2px solid var(--codex-accent);
		outline-offset: 2px;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.codex-bookmark,
		.codex-bookmark__ribbon,
		.codex-bookmark__dog-ear,
		.codex-bookmark__tab svg {
			transition: none;
		}
	}
</style>
