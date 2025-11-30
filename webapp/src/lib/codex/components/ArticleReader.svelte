<script lang="ts">
	import { getContext, createEventDispatcher } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { ReadingMode } from '../types';
	import type { ContentBlock } from '../utils/markdown';
	import Page from './Page.svelte';
	import Spread from './Spread.svelte';
	import Bookmark from './Bookmark.svelte';
	import PullQuote from './PullQuote.svelte';
	import SectionDivider from './SectionDivider.svelte';

	// Props - accept either ContentBlock or legacy format
	export let contentBlocks: Array<ContentBlock | { type: string; content: string }> = [];
	export let isBookmarked: boolean = false;
	export let seasonInfo: { displayName: string; emoji: string };
	export let editionYear: number;
	export let hasContent: boolean = true;

	// Events
	const dispatch = createEventDispatcher<{
		bookmarkToggle: { saved: boolean };
	}>();

	// Get mode from context
	const context = getContext<{ mode: Writable<ReadingMode> }>('codex');
	const modeStore = context?.mode;

	// Fallback if context not available
	let currentMode: ReadingMode = 'flow';
	$: if (modeStore) {
		currentMode = $modeStore;
	}

	// Codex pagination state
	let currentPage = 1;
	const BLOCKS_PER_PAGE = 4;

	$: totalPages = Math.ceil(contentBlocks.length / BLOCKS_PER_PAGE) || 1;

	function getPageBlocks(pageNum: number) {
		const start = (pageNum - 1) * BLOCKS_PER_PAGE;
		return contentBlocks.slice(start, start + BLOCKS_PER_PAGE);
	}

	function handlePageChange(event: CustomEvent<{ page: number; direction: 'next' | 'prev' }>) {
		currentPage = event.detail.page;
	}

	function handleBookmarkToggle(event: CustomEvent<{ saved: boolean }>) {
		dispatch('bookmarkToggle', event.detail);
	}

	// Reset page when switching away from codex mode
	$: if (currentMode !== 'codex') {
		currentPage = 1;
	}
</script>

{#if currentMode === 'codex'}
	<!-- Codex mode: Page-flip spread view -->
	<Spread {currentPage} {totalPages} on:pageChange={handlePageChange}>
		<div slot="verso" let:page class="codex-page-content">
			<Bookmark saved={isBookmarked} style="ribbon" on:toggle={handleBookmarkToggle} />
			{#each getPageBlocks(page) as block}
				{#if block.type === 'h1'}
					<h1 class="codex-prose__h1">{@html block.content}</h1>
				{:else if block.type === 'h2'}
					<h2 class="codex-prose__h2">{@html block.content}</h2>
				{:else if block.type === 'h3'}
					<h3 class="codex-prose__h3">{@html block.content}</h3>
				{:else if block.type === 'h4'}
					<h4 class="codex-prose__h4">{@html block.content}</h4>
				{:else if block.type === 'quote'}
					<PullQuote>{@html block.content}</PullQuote>
				{:else if block.type === 'divider'}
					<SectionDivider style="flourish" />
				{:else if block.type === 'list' && block.meta}
					{#if block.meta.ordered}
						<ol class="codex-prose__list">
							{#each block.meta.items || [] as item}
								<li>{@html item}</li>
							{/each}
						</ol>
					{:else}
						<ul class="codex-prose__list">
							{#each block.meta.items || [] as item}
								<li>{@html item}</li>
							{/each}
						</ul>
					{/if}
				{:else if block.type === 'code'}
					<pre class="codex-prose__code"><code class={block.meta?.language ? `language-${block.meta.language}` : ''}>{block.content}</code></pre>
				{:else if block.type === 'image' && block.meta}
					<figure class="codex-prose__figure">
						<img src={block.meta.src} alt={block.meta.alt || ''} />
						{#if block.meta.alt}
							<figcaption>{block.meta.alt}</figcaption>
						{/if}
					</figure>
				{:else if block.type === 'callout'}
					<aside class="codex-prose__callout codex-prose__callout--{block.meta?.calloutType || 'note'}">
						{@html block.content}
					</aside>
				{:else}
					<p class="codex-prose__p">{@html block.content}</p>
				{/if}
			{/each}
		</div>
		<div slot="recto" let:page class="codex-page-content">
			{#each getPageBlocks(page) as block}
				{#if block.type === 'h1'}
					<h1 class="codex-prose__h1">{@html block.content}</h1>
				{:else if block.type === 'h2'}
					<h2 class="codex-prose__h2">{@html block.content}</h2>
				{:else if block.type === 'h3'}
					<h3 class="codex-prose__h3">{@html block.content}</h3>
				{:else if block.type === 'h4'}
					<h4 class="codex-prose__h4">{@html block.content}</h4>
				{:else if block.type === 'quote'}
					<PullQuote>{@html block.content}</PullQuote>
				{:else if block.type === 'divider'}
					<SectionDivider style="flourish" />
				{:else if block.type === 'list' && block.meta}
					{#if block.meta.ordered}
						<ol class="codex-prose__list">
							{#each block.meta.items || [] as item}
								<li>{@html item}</li>
							{/each}
						</ol>
					{:else}
						<ul class="codex-prose__list">
							{#each block.meta.items || [] as item}
								<li>{@html item}</li>
							{/each}
						</ul>
					{/if}
				{:else if block.type === 'code'}
					<pre class="codex-prose__code"><code class={block.meta?.language ? `language-${block.meta.language}` : ''}>{block.content}</code></pre>
				{:else if block.type === 'image' && block.meta}
					<figure class="codex-prose__figure">
						<img src={block.meta.src} alt={block.meta.alt || ''} />
						{#if block.meta.alt}
							<figcaption>{block.meta.alt}</figcaption>
						{/if}
					</figure>
				{:else if block.type === 'callout'}
					<aside class="codex-prose__callout codex-prose__callout--{block.meta?.calloutType || 'note'}">
						{@html block.content}
					</aside>
				{:else}
					<p class="codex-prose__p">{@html block.content}</p>
				{/if}
			{/each}
		</div>
	</Spread>
{:else}
	<!-- Flow/Focus mode: Continuous scroll view -->
	<Page>
		<Bookmark saved={isBookmarked} style="ribbon" on:toggle={handleBookmarkToggle} />

		<div class="codex-prose">
			{#each contentBlocks as block}
				{#if block.type === 'h1'}
					<h1>{@html block.content}</h1>
				{:else if block.type === 'h2'}
					<h2>{@html block.content}</h2>
				{:else if block.type === 'h3'}
					<h3>{@html block.content}</h3>
				{:else if block.type === 'h4'}
					<h4>{@html block.content}</h4>
				{:else if block.type === 'quote'}
					<PullQuote>{@html block.content}</PullQuote>
				{:else if block.type === 'divider'}
					<SectionDivider style="flourish" />
				{:else if block.type === 'list' && block.meta}
					{#if block.meta.ordered}
						<ol class="codex-prose__list">
							{#each block.meta.items || [] as item}
								<li>{@html item}</li>
							{/each}
						</ol>
					{:else}
						<ul class="codex-prose__list">
							{#each block.meta.items || [] as item}
								<li>{@html item}</li>
							{/each}
						</ul>
					{/if}
				{:else if block.type === 'code'}
					<pre class="codex-prose__code"><code class={block.meta?.language ? `language-${block.meta.language}` : ''}>{block.content}</code></pre>
				{:else if block.type === 'image' && block.meta}
					<figure class="codex-prose__figure">
						<img src={block.meta.src} alt={block.meta.alt || ''} />
						{#if block.meta.alt}
							<figcaption>{block.meta.alt}</figcaption>
						{/if}
					</figure>
				{:else if block.type === 'callout'}
					<aside class="codex-prose__callout codex-prose__callout--{block.meta?.calloutType || 'note'}">
						{@html block.content}
					</aside>
				{:else}
					<p>{@html block.content}</p>
				{/if}
			{/each}

			{#if !hasContent}
				<p class="codex-article__placeholder">
					This article is coming soon. Check back after the {seasonInfo.displayName}
					{editionYear} launch!
				</p>
			{/if}
		</div>
	</Page>
{/if}

<style>
	/* Codex Page Content (for Spread view) */
	.codex-page-content {
		font-family: var(--codex-font-body);
		font-size: var(--codex-text-lg);
		line-height: var(--codex-leading-loose);
		color: var(--codex-ink-black);
		height: 100%;
		overflow: hidden;
	}

	.codex-page-content :global(.codex-prose__h1),
	.codex-page-content :global(.codex-prose__h2),
	.codex-page-content :global(.codex-prose__h3) {
		font-family: var(--codex-font-display);
		color: var(--codex-ink-black);
		margin-top: 1em;
		margin-bottom: 0.5em;
	}

	.codex-page-content :global(.codex-prose__h1) {
		font-size: var(--codex-text-2xl);
	}

	.codex-page-content :global(.codex-prose__h2) {
		font-size: var(--codex-text-xl);
	}

	.codex-page-content :global(.codex-prose__h3) {
		font-size: var(--codex-text-lg);
	}

	.codex-page-content :global(.codex-prose__p) {
		margin-bottom: 1em;
		text-indent: 1.5em;
	}

	.codex-page-content :global(.codex-prose__p):first-of-type {
		text-indent: 0;
	}

	.codex-page-content :global(.codex-prose__p):first-of-type::first-letter {
		float: left;
		font-family: var(--codex-font-display);
		font-size: 3em;
		line-height: 0.8;
		padding-right: 0.1em;
		color: var(--codex-accent);
	}

	/* Prose Content */
	.codex-prose {
		font-family: var(--codex-font-body);
		font-size: var(--codex-text-lg);
		line-height: var(--codex-leading-loose);
		color: var(--codex-ink-black);
	}

	.codex-prose :global(h1),
	.codex-prose :global(h2),
	.codex-prose :global(h3) {
		font-family: var(--codex-font-display);
		color: var(--codex-ink-black);
		margin-top: 2em;
		margin-bottom: 0.5em;
	}

	.codex-prose :global(h1) {
		font-size: var(--codex-text-3xl);
	}

	.codex-prose :global(h2) {
		font-size: var(--codex-text-2xl);
	}

	.codex-prose :global(h3) {
		font-size: var(--codex-text-xl);
	}

	.codex-prose :global(p) {
		margin-bottom: 1.5em;
	}

	.codex-prose :global(p):first-of-type::first-letter {
		float: left;
		font-family: var(--codex-font-display);
		font-size: 3.5em;
		line-height: 0.8;
		padding-right: 0.1em;
		color: var(--codex-accent);
	}

	.codex-article__placeholder {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--codex-ink-muted);
		font-style: italic;
	}

	/* Lists */
	.codex-prose :global(ul),
	.codex-prose :global(ol),
	:global(.codex-prose__list) {
		margin: 0 0 1.5em 2em;
		padding: 0;
	}

	.codex-prose :global(ul),
	:global(.codex-prose__list:not(ol)) {
		list-style-type: disc;
	}

	.codex-prose :global(ol),
	:global(ol.codex-prose__list) {
		list-style-type: decimal;
	}

	.codex-prose :global(li) {
		margin-bottom: 0.5em;
	}

	/* Code blocks */
	.codex-prose :global(pre),
	:global(.codex-prose__code) {
		background: var(--codex-paper-aged);
		border-radius: var(--codex-radius-soft);
		padding: 1em;
		margin: 1.5em 0;
		overflow-x: auto;
		font-family: var(--codex-font-mono, 'Courier New', monospace);
		font-size: 0.9em;
		line-height: 1.5;
	}

	.codex-prose :global(code) {
		font-family: var(--codex-font-mono, 'Courier New', monospace);
		background: var(--codex-paper-aged);
		padding: 0.2em 0.4em;
		border-radius: var(--codex-radius-sharp);
		font-size: 0.9em;
	}

	.codex-prose :global(pre code) {
		background: none;
		padding: 0;
	}

	/* Figures/Images */
	.codex-prose :global(figure),
	:global(.codex-prose__figure) {
		margin: 2em 0;
		text-align: center;
	}

	.codex-prose :global(figure img),
	:global(.codex-prose__figure img) {
		max-width: 100%;
		height: auto;
		border-radius: var(--codex-radius-soft);
		box-shadow: var(--codex-shadow-lifted);
	}

	.codex-prose :global(figcaption) {
		margin-top: 0.5em;
		font-size: var(--codex-text-sm);
		color: var(--codex-ink-muted);
		font-style: italic;
	}

	/* Callouts */
	:global(.codex-prose__callout) {
		margin: 1.5em 0;
		padding: 1em 1.5em;
		border-left: 4px solid var(--codex-accent);
		background: var(--codex-paper-aged);
		border-radius: 0 var(--codex-radius-soft) var(--codex-radius-soft) 0;
	}

	:global(.codex-prose__callout--note) {
		border-left-color: var(--codex-accent);
	}

	:global(.codex-prose__callout--tip) {
		border-left-color: #10b981;
		background: rgba(16, 185, 129, 0.05);
	}

	:global(.codex-prose__callout--warning) {
		border-left-color: #f59e0b;
		background: rgba(245, 158, 11, 0.05);
	}

	:global(.codex-prose__callout--important) {
		border-left-color: #ef4444;
		background: rgba(239, 68, 68, 0.05);
	}

	/* Inline elements */
	.codex-prose :global(strong) {
		font-weight: 600;
		color: var(--codex-ink-black);
	}

	.codex-prose :global(em) {
		font-style: italic;
	}

	.codex-prose :global(del) {
		text-decoration: line-through;
		opacity: 0.7;
	}

	.codex-prose :global(a) {
		color: var(--codex-accent);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	.codex-prose :global(a:hover) {
		text-decoration-thickness: 2px;
	}
</style>
