<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable, Readable } from 'svelte/store';
	import type { ReadingMode } from './CodexProvider.svelte';

	// Props
	export let number: number | undefined = undefined;
	export let recto: boolean = true; // Right-hand page (odd numbers)

	// Get context
	const { mode } = getContext<{ mode: Writable<ReadingMode> }>('codex') || {
		mode: { subscribe: (fn: (v: ReadingMode) => void) => fn('flow') }
	};

	// Determine page side based on number if provided
	$: pageSide = number !== undefined ? (number % 2 === 1 ? 'recto' : 'verso') : recto ? 'recto' : 'verso';
</script>

<article
	class="codex-page"
	class:codex-page--recto={pageSide === 'recto'}
	class:codex-page--verso={pageSide === 'verso'}
	data-page-number={number}
	data-mode={$mode}
>
	<!-- Running header (optional) -->
	{#if $$slots.header}
		<header class="codex-page__header">
			<slot name="header" />
		</header>
	{/if}

	<!-- Page number (folio) -->
	{#if number !== undefined}
		<div class="codex-page__folio" class:codex-page__folio--recto={pageSide === 'recto'}>
			{number}
		</div>
	{/if}

	<!-- Main content area -->
	<div class="codex-page__content">
		<slot />
	</div>

	<!-- Margin notes slot -->
	{#if $$slots.margin}
		<aside class="codex-page__margin">
			<slot name="margin" />
		</aside>
	{/if}

	<!-- Footer slot -->
	{#if $$slots.footer}
		<footer class="codex-page__footer">
			<slot name="footer" />
		</footer>
	{/if}
</article>

<style>
	.codex-page {
		position: relative;
		background: var(--codex-paper-cream);
		color: var(--codex-ink-black);
		font-family: var(--codex-font-body);
		font-size: var(--codex-text-base);
		line-height: var(--codex-leading-relaxed);

		/* Page dimensions */
		min-height: 100vh;
		padding: var(--codex-margin-head) var(--codex-margin-fore) var(--codex-margin-foot)
			var(--codex-margin-gutter);

		/* Paper texture overlay */
		background-image: var(--codex-texture-grain, none);
		background-blend-mode: multiply;

		/* Page shadow */
		box-shadow: var(--codex-shadow-page);

		/* Smooth transitions */
		transition:
			padding var(--codex-duration-normal) var(--codex-ease-default),
			box-shadow var(--codex-duration-normal) var(--codex-ease-default);
	}

	/* Verso (left/even) page styling */
	.codex-page--verso {
		padding-left: var(--codex-margin-fore);
		padding-right: var(--codex-margin-gutter);
		box-shadow: var(--codex-shadow-gutter);
	}

	/* Recto (right/odd) page styling */
	.codex-page--recto {
		padding-left: var(--codex-margin-gutter);
		padding-right: var(--codex-margin-fore);
		box-shadow: var(--codex-shadow-fore-edge);
	}

	/* Running header */
	.codex-page__header {
		position: absolute;
		top: var(--codex-space-4);
		left: var(--codex-margin-gutter);
		right: var(--codex-margin-fore);
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-xs);
		color: var(--codex-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		display: flex;
		justify-content: space-between;
	}

	.codex-page--verso .codex-page__header {
		left: var(--codex-margin-fore);
		right: var(--codex-margin-gutter);
	}

	/* Page number (folio) */
	.codex-page__folio {
		position: absolute;
		bottom: var(--codex-space-6);
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
		color: var(--codex-ink-muted);
	}

	.codex-page__folio--recto {
		right: var(--codex-margin-fore);
	}

	.codex-page__folio:not(.codex-page__folio--recto) {
		left: var(--codex-margin-fore);
	}

	/* Main content */
	.codex-page__content {
		max-width: var(--codex-measure-normal);
		margin: 0 auto;
	}

	/* Margin notes */
	.codex-page__margin {
		position: absolute;
		top: var(--codex-margin-head);
		width: 12rem;
		font-size: var(--codex-text-sm);
		color: var(--codex-ink-sepia);
		line-height: var(--codex-leading-snug);
	}

	.codex-page--recto .codex-page__margin {
		right: var(--codex-space-4);
	}

	.codex-page--verso .codex-page__margin {
		left: var(--codex-space-4);
	}

	/* Footer */
	.codex-page__footer {
		position: absolute;
		bottom: var(--codex-space-4);
		left: var(--codex-margin-gutter);
		right: var(--codex-margin-fore);
	}

	/* Flow mode: simplified layout */
	.codex-page[data-mode='flow'] {
		min-height: auto;
		box-shadow: none;
		padding: var(--codex-space-8) var(--codex-space-4);
		margin: 0 auto;
		max-width: calc(var(--codex-measure-normal) + var(--codex-space-8) * 2);
	}

	.codex-page[data-mode='flow'] .codex-page__folio,
	.codex-page[data-mode='flow'] .codex-page__margin {
		display: none;
	}

	/* Focus mode: even more minimal */
	.codex-page[data-mode='focus'] {
		min-height: auto;
		background: transparent;
		box-shadow: none;
		padding: var(--codex-space-16) var(--codex-space-8);
	}

	.codex-page[data-mode='focus'] .codex-page__header,
	.codex-page[data-mode='focus'] .codex-page__folio,
	.codex-page[data-mode='focus'] .codex-page__margin,
	.codex-page[data-mode='focus'] .codex-page__footer {
		display: none;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.codex-page {
			padding: var(--codex-space-4);
		}

		.codex-page__margin {
			position: relative;
			width: 100%;
			margin-top: var(--codex-space-4);
			padding: var(--codex-space-3);
			background: var(--codex-paper-aged);
			border-radius: var(--codex-radius-soft);
		}
	}
</style>
