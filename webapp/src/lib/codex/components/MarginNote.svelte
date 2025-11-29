<script lang="ts">
	// Props
	export let side: 'left' | 'right' | 'auto' = 'auto';
	export let label: string | undefined = undefined;

	// Generate unique ID for accessibility
	const id = `margin-note-${Math.random().toString(36).substr(2, 9)}`;
</script>

<aside class="codex-margin-note" class:codex-margin-note--left={side === 'left'} class:codex-margin-note--right={side === 'right'} aria-labelledby={label ? id : undefined}>
	{#if label}
		<span class="codex-margin-note__label" {id}>{label}</span>
	{/if}
	<div class="codex-margin-note__content">
		<slot />
	</div>
</aside>

<style>
	.codex-margin-note {
		font-family: var(--codex-font-body);
		font-size: var(--codex-text-sm);
		line-height: var(--codex-leading-snug);
		color: var(--codex-ink-sepia);
		padding: var(--codex-space-3);
		background: var(--codex-paper-aged);
		border-radius: var(--codex-radius-soft);
		border-left: 2px solid var(--codex-accent);
	}

	/* Desktop: positioned in margin */
	@media (min-width: 1200px) {
		.codex-margin-note {
			position: absolute;
			width: 180px;
			background: transparent;
			border-radius: 0;
			padding: 0;
			border-left: none;
			border-top: 1px solid var(--codex-ink-light);
			padding-top: var(--codex-space-2);
		}

		.codex-margin-note--right,
		.codex-margin-note:not(.codex-margin-note--left) {
			right: calc(-180px - var(--codex-space-8));
		}

		.codex-margin-note--left {
			left: calc(-180px - var(--codex-space-8));
		}
	}

	/* Mobile: inline callout */
	@media (max-width: 1199px) {
		.codex-margin-note {
			margin: var(--codex-space-4) 0;
		}
	}

	.codex-margin-note__label {
		display: block;
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--codex-ink-muted);
		margin-bottom: var(--codex-space-1);
	}

	.codex-margin-note__content :global(p) {
		margin: 0;
	}

	.codex-margin-note__content :global(p + p) {
		margin-top: var(--codex-space-2);
	}
</style>
