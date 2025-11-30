<script lang="ts">
	import { getContext, createEventDispatcher } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { ReadingMode } from '../types';

	const dispatch = createEventDispatcher<{
		pageChange: { page: number; direction: 'next' | 'prev' };
	}>();

	// Props
	export let currentPage: number = 1;
	export let totalPages: number = 1;

	// Get context
	const context = getContext<{ mode: Writable<ReadingMode>; sounds: Writable<boolean> }>('codex');
	const mode = context?.mode;
	const sounds = context?.sounds;

	// State
	let isAnimating = false;
	let animationDirection: 'next' | 'prev' | null = null;

	// Audio for page turn
	let audioContext: AudioContext | null = null;

	function playPageTurnSound() {
		if (!$sounds) return;

		// Simple synthesized page turn sound
		if (!audioContext) {
			audioContext = new AudioContext();
		}

		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		// White noise-ish sound for paper
		oscillator.type = 'sawtooth';
		oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
		oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.15);

		gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + 0.15);
	}

	function goToPage(page: number, direction: 'next' | 'prev') {
		if (isAnimating || page < 1 || page > totalPages) return;

		isAnimating = true;
		animationDirection = direction;
		playPageTurnSound();

		setTimeout(() => {
			currentPage = page;
			dispatch('pageChange', { page, direction });

			setTimeout(() => {
				isAnimating = false;
				animationDirection = null;
			}, 50);
		}, 350); // Match animation duration
	}

	function nextPage() {
		// In spread mode, advance by 2 pages
		const increment = $mode === 'codex' ? 2 : 1;
		const newPage = Math.min(currentPage + increment, totalPages);
		if (newPage !== currentPage) {
			goToPage(newPage, 'next');
		}
	}

	function prevPage() {
		const decrement = $mode === 'codex' ? 2 : 1;
		const newPage = Math.max(currentPage - decrement, 1);
		if (newPage !== currentPage) {
			goToPage(newPage, 'prev');
		}
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight' || event.key === ' ') {
			event.preventDefault();
			nextPage();
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			prevPage();
		}
	}

	// Swipe detection
	let touchStartX = 0;

	function handleTouchStart(event: TouchEvent) {
		touchStartX = event.touches[0].clientX;
	}

	function handleTouchEnd(event: TouchEvent) {
		const touchEndX = event.changedTouches[0].clientX;
		const diff = touchStartX - touchEndX;

		if (Math.abs(diff) > 50) {
			// Minimum swipe distance
			if (diff > 0) {
				nextPage();
			} else {
				prevPage();
			}
		}
	}

	// Calculate visible pages for spread
	$: versoPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
	$: rectoPage = versoPage + 1;
	$: showVerso = versoPage >= 1;
	$: showRecto = rectoPage <= totalPages;
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	class="codex-spread"
	class:codex-spread--animating={isAnimating}
	class:codex-spread--turning-next={animationDirection === 'next'}
	class:codex-spread--turning-prev={animationDirection === 'prev'}
	on:touchstart={handleTouchStart}
	on:touchend={handleTouchEnd}
	role="region"
	aria-label="Book spread, page {currentPage} of {totalPages}"
>
	<!-- Book binding/spine -->
	<div class="codex-spread__spine"></div>

	<!-- Left (verso) page -->
	<div class="codex-spread__page codex-spread__page--verso" class:codex-spread__page--hidden={!showVerso}>
		{#if showVerso}
			<slot name="verso" page={versoPage} />
		{/if}

		<!-- Page curl hint (bottom left) -->
		<button
			class="codex-spread__curl codex-spread__curl--prev"
			on:click={prevPage}
			disabled={currentPage <= 1}
			aria-label="Previous page"
		>
			<span class="codex-spread__curl-icon">◂</span>
		</button>
	</div>

	<!-- Right (recto) page -->
	<div class="codex-spread__page codex-spread__page--recto" class:codex-spread__page--hidden={!showRecto}>
		{#if showRecto}
			<slot name="recto" page={rectoPage} />
		{/if}

		<!-- Page curl hint (bottom right) -->
		<button
			class="codex-spread__curl codex-spread__curl--next"
			on:click={nextPage}
			disabled={currentPage >= totalPages}
			aria-label="Next page"
		>
			<span class="codex-spread__curl-icon">▸</span>
		</button>
	</div>

	<!-- Turning page overlay (for animation) -->
	{#if isAnimating}
		<div
			class="codex-spread__turning-page"
			class:codex-spread__turning-page--next={animationDirection === 'next'}
			class:codex-spread__turning-page--prev={animationDirection === 'prev'}
		></div>
	{/if}

	<!-- Page edge stack effect -->
	<div class="codex-spread__edges codex-spread__edges--left"></div>
	<div class="codex-spread__edges codex-spread__edges--right"></div>
</div>

<!-- Navigation dots / progress -->
<nav class="codex-spread__nav" aria-label="Page navigation">
	<button class="codex-spread__nav-btn" on:click={prevPage} disabled={currentPage <= 1}>
		← Previous
	</button>

	<span class="codex-spread__nav-info">
		{currentPage}–{Math.min(currentPage + 1, totalPages)} of {totalPages}
	</span>

	<button class="codex-spread__nav-btn" on:click={nextPage} disabled={currentPage >= totalPages}>
		Next →
	</button>
</nav>

<style>
	.codex-spread {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0;
		max-width: 1400px;
		margin: 0 auto;
		perspective: 2000px;
		position: relative;
	}

	/* Spine/binding */
	.codex-spread__spine {
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 20px;
		transform: translateX(-50%);
		background: linear-gradient(
			to right,
			rgba(0, 0, 0, 0.15) 0%,
			rgba(0, 0, 0, 0.05) 30%,
			rgba(255, 255, 255, 0.05) 50%,
			rgba(0, 0, 0, 0.05) 70%,
			rgba(0, 0, 0, 0.15) 100%
		);
		z-index: var(--codex-z-page);
		pointer-events: none;
	}

	/* Individual pages */
	.codex-spread__page {
		position: relative;
		background: var(--codex-paper-cream);
		min-height: 80vh;
		padding: var(--codex-space-8);
		transform-origin: center left;
		transition: transform var(--codex-duration-page-turn) var(--codex-ease-page-turn);
		box-shadow: var(--codex-shadow-page);
	}

	.codex-spread__page--verso {
		transform-origin: center right;
		box-shadow: var(--codex-shadow-gutter), var(--codex-shadow-page);
	}

	.codex-spread__page--recto {
		transform-origin: center left;
		box-shadow: var(--codex-shadow-fore-edge), var(--codex-shadow-page);
	}

	.codex-spread__page--hidden {
		visibility: hidden;
	}

	/* Page curl buttons */
	.codex-spread__curl {
		position: absolute;
		bottom: var(--codex-space-4);
		width: 48px;
		height: 48px;
		background: transparent;
		border: none;
		cursor: pointer;
		opacity: 0;
		transition: opacity var(--codex-duration-fast) var(--codex-ease-default);
		z-index: var(--codex-z-bookmark);
	}

	.codex-spread__page:hover .codex-spread__curl {
		opacity: 0.5;
	}

	.codex-spread__curl:hover {
		opacity: 1 !important;
	}

	.codex-spread__curl:disabled {
		opacity: 0 !important;
		cursor: not-allowed;
	}

	.codex-spread__curl--prev {
		left: var(--codex-space-4);
	}

	.codex-spread__curl--next {
		right: var(--codex-space-4);
	}

	.codex-spread__curl-icon {
		font-size: var(--codex-text-xl);
		color: var(--codex-ink-muted);
	}

	/* Page turn animation */
	.codex-spread__turning-page {
		position: absolute;
		top: 0;
		width: 50%;
		height: 100%;
		background: var(--codex-paper-cream);
		transform-origin: left center;
		z-index: var(--codex-z-page-turning);
		box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
		backface-visibility: hidden;
	}

	.codex-spread__turning-page--next {
		right: 0;
		transform-origin: left center;
		animation: pageTurnNext var(--codex-duration-page-turn) var(--codex-ease-page-turn) forwards;
	}

	.codex-spread__turning-page--prev {
		left: 0;
		transform-origin: right center;
		animation: pageTurnPrev var(--codex-duration-page-turn) var(--codex-ease-page-turn) forwards;
	}

	@keyframes pageTurnNext {
		0% {
			transform: rotateY(0deg);
		}
		100% {
			transform: rotateY(-180deg);
		}
	}

	@keyframes pageTurnPrev {
		0% {
			transform: rotateY(0deg);
		}
		100% {
			transform: rotateY(180deg);
		}
	}

	/* Page edge stack effect */
	.codex-spread__edges {
		position: absolute;
		top: 2px;
		bottom: 2px;
		width: 8px;
		pointer-events: none;
	}

	.codex-spread__edges--left {
		left: -6px;
		background: repeating-linear-gradient(
			to bottom,
			var(--codex-paper-cream) 0px,
			var(--codex-paper-cream) 2px,
			var(--codex-paper-aged) 2px,
			var(--codex-paper-aged) 3px
		);
		border-radius: 2px 0 0 2px;
	}

	.codex-spread__edges--right {
		right: -6px;
		background: repeating-linear-gradient(
			to bottom,
			var(--codex-paper-cream) 0px,
			var(--codex-paper-cream) 2px,
			var(--codex-paper-aged) 2px,
			var(--codex-paper-aged) 3px
		);
		border-radius: 0 2px 2px 0;
	}

	/* Navigation */
	.codex-spread__nav {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--codex-space-6);
		padding: var(--codex-space-4);
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
	}

	.codex-spread__nav-btn {
		padding: var(--codex-space-2) var(--codex-space-4);
		background: var(--codex-paper-aged);
		border: none;
		border-radius: var(--codex-radius-soft);
		color: var(--codex-ink-sepia);
		cursor: pointer;
		transition:
			background-color var(--codex-duration-fast) var(--codex-ease-default),
			color var(--codex-duration-fast) var(--codex-ease-default);
	}

	.codex-spread__nav-btn:hover:not(:disabled) {
		background: var(--codex-accent);
		color: white;
	}

	.codex-spread__nav-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.codex-spread__nav-info {
		color: var(--codex-ink-muted);
	}

	/* Mobile: single page view */
	@media (max-width: 1024px) {
		.codex-spread {
			grid-template-columns: 1fr;
		}

		.codex-spread__spine,
		.codex-spread__edges,
		.codex-spread__page--verso {
			display: none;
		}

		.codex-spread__page--recto {
			min-height: auto;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.codex-spread__turning-page {
			animation: none;
		}
	}
</style>
