<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { ReadingMode } from '../types';

	// Get context
	const context = getContext<{
		mode: Writable<ReadingMode>;
		setMode: (mode: ReadingMode) => void;
	}>('codex');

	const { mode, setMode } = context || {
		mode: { subscribe: (fn: (v: ReadingMode) => void) => fn('flow') } as Writable<ReadingMode>,
		setMode: () => {}
	};

	const modes: { id: ReadingMode; label: string; icon: string; description: string }[] = [
		{
			id: 'flow',
			label: 'Flow',
			icon: '≡',
			description: 'Continuous scroll'
		},
		{
			id: 'codex',
			label: 'Codex',
			icon: '📖',
			description: 'Page-by-page'
		},
		{
			id: 'focus',
			label: 'Focus',
			icon: '◯',
			description: 'Distraction-free'
		}
	];
</script>

<div class="mode-toggle" role="radiogroup" aria-label="Reading mode">
	{#each modes as { id, label, icon, description }}
		<button
			type="button"
			class="mode-toggle__option"
			class:mode-toggle__option--active={$mode === id}
			role="radio"
			aria-checked={$mode === id}
			title={description}
			on:click={() => setMode(id)}
		>
			<span class="mode-toggle__icon">{icon}</span>
			<span class="mode-toggle__label">{label}</span>
		</button>
	{/each}
</div>

<style>
	.mode-toggle {
		display: inline-flex;
		gap: var(--codex-space-1);
		padding: var(--codex-space-1);
		background: var(--codex-paper-aged);
		border-radius: var(--codex-radius-rounded);
		box-shadow: var(--codex-shadow-inset);
	}

	.mode-toggle__option {
		display: flex;
		align-items: center;
		gap: var(--codex-space-2);
		padding: var(--codex-space-2) var(--codex-space-3);
		border: none;
		background: transparent;
		border-radius: var(--codex-radius-soft);
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
		color: var(--codex-ink-muted);
		cursor: pointer;
		transition:
			background-color var(--codex-duration-fast) var(--codex-ease-default),
			color var(--codex-duration-fast) var(--codex-ease-default),
			box-shadow var(--codex-duration-fast) var(--codex-ease-default);
	}

	.mode-toggle__option:hover {
		color: var(--codex-ink-sepia);
	}

	.mode-toggle__option--active {
		background: var(--codex-paper-white);
		color: var(--codex-ink-black);
		box-shadow: var(--codex-shadow-page);
	}

	.mode-toggle__icon {
		font-size: var(--codex-text-base);
	}

	.mode-toggle__label {
		font-weight: 500;
	}

	/* Compact version for mobile */
	@media (max-width: 640px) {
		.mode-toggle__label {
			/* Screen reader only */
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;
		}

		.mode-toggle__option {
			padding: var(--codex-space-2);
		}

		.mode-toggle__icon {
			font-size: var(--codex-text-lg);
		}
	}
</style>
