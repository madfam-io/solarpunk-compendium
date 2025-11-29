<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import {
		CodexProvider,
		Page,
		ModeToggle,
		Bookmark,
		PullQuote,
		SectionDivider
	} from '$lib/codex';
	import { getSeasonInfo } from '$lib/codex/utils/season';
	import { browser } from '$app/environment';

	export let data;

	$: ({ article, edition, navigation } = data);
	$: seasonInfo = getSeasonInfo(edition.season as 'winter' | 'spring' | 'summer' | 'autumn');

	// Bookmark state (persisted to localStorage)
	let isBookmarked = false;

	$: if (browser) {
		const bookmarks = JSON.parse(localStorage.getItem('codex-bookmarks') || '{}');
		isBookmarked = !!bookmarks[article.id];
	}

	function handleBookmarkToggle(event: CustomEvent<{ saved: boolean }>) {
		if (!browser) return;
		const bookmarks = JSON.parse(localStorage.getItem('codex-bookmarks') || '{}');
		if (event.detail.saved) {
			bookmarks[article.id] = {
				title: article.title,
				url: `/editions/${edition.slug}/${article.slug}`,
				savedAt: new Date().toISOString()
			};
		} else {
			delete bookmarks[article.id];
		}
		localStorage.setItem('codex-bookmarks', JSON.stringify(bookmarks));
		isBookmarked = event.detail.saved;
	}

	// Parse markdown-ish content into sections
	// This is a simple parser - in production you'd use a proper markdown parser
	function parseContent(content: string) {
		if (!content) return [];

		// Split by double newlines for paragraphs
		const blocks = content.split(/\n\n+/);

		return blocks.map((block) => {
			const trimmed = block.trim();

			// Check for headers
			if (trimmed.startsWith('# ')) {
				return { type: 'h1', content: trimmed.slice(2) };
			}
			if (trimmed.startsWith('## ')) {
				return { type: 'h2', content: trimmed.slice(3) };
			}
			if (trimmed.startsWith('### ')) {
				return { type: 'h3', content: trimmed.slice(4) };
			}

			// Check for blockquote
			if (trimmed.startsWith('> ')) {
				return { type: 'quote', content: trimmed.slice(2) };
			}

			// Check for horizontal rule / section break
			if (trimmed === '---' || trimmed === '***') {
				return { type: 'divider', content: '' };
			}

			// Default to paragraph
			return { type: 'p', content: trimmed };
		});
	}

	$: contentBlocks = parseContent(article.content || '');
</script>

<SEO
	title={article.title}
	description={article.excerpt || article.subtitle || `Read ${article.title} from ${edition.title}`}
	keywords="solarpunk, {edition.season}, {article.section || 'article'}"
	ogType="article"
	articleAuthor={article.author}
	articleSection={article.section}
	articlePublishedTime={article.publishedAt}
/>

<CodexProvider mode="flow" season={edition.season}>
	<article class="codex-article" data-season={edition.season}>
		<!-- Article Header -->
		<header class="codex-article__header">
			<nav class="codex-article__breadcrumb">
				<a href="/editions">Editions</a>
				<span>/</span>
				<a href="/editions/{edition.slug}">{edition.title}</a>
			</nav>

			<div class="codex-article__meta-top">
				<span class="codex-article__season">
					{seasonInfo.emoji} {seasonInfo.displayName} {edition.year}
				</span>
				{#if article.section}
					<span class="codex-article__section">{article.section}</span>
				{/if}
			</div>

			<h1 class="codex-article__title">{article.title}</h1>

			{#if article.subtitle}
				<p class="codex-article__subtitle">{article.subtitle}</p>
			{/if}

			<div class="codex-article__byline">
				{#if article.author}
					<span class="codex-article__author">By {article.author}</span>
				{/if}
				{#if article.readTime}
					<span class="codex-article__read-time">{article.readTime} min read</span>
				{/if}
				{#if article.publishedAt}
					<time datetime={article.publishedAt}>
						{new Date(article.publishedAt).toLocaleDateString('en-US', {
							month: 'long',
							day: 'numeric',
							year: 'numeric'
						})}
					</time>
				{/if}
			</div>

			<!-- Controls -->
			<div class="codex-article__controls">
				<ModeToggle />
			</div>
		</header>

		<!-- Cover Image -->
		{#if article.coverImage}
			<figure class="codex-article__cover">
				<img src={article.coverImage} alt="" />
			</figure>
		{/if}

		<!-- Article Body -->
		<Page>
			<Bookmark
				saved={isBookmarked}
				style="ribbon"
				on:toggle={handleBookmarkToggle}
			/>

			<div class="codex-prose">
				{#each contentBlocks as block, index}
					{#if block.type === 'h1'}
						<h1>{block.content}</h1>
					{:else if block.type === 'h2'}
						<h2>{block.content}</h2>
					{:else if block.type === 'h3'}
						<h3>{block.content}</h3>
					{:else if block.type === 'quote'}
						<PullQuote>
							{block.content}
						</PullQuote>
					{:else if block.type === 'divider'}
						<SectionDivider style="flourish" />
					{:else}
						<p>{block.content}</p>
					{/if}
				{/each}

				{#if !article.content}
					<p class="codex-article__placeholder">
						This article is coming soon. Check back after the {seasonInfo.displayName} {edition.year} launch!
					</p>
				{/if}
			</div>
		</Page>

		<!-- Article Navigation -->
		<nav class="codex-article__nav">
			<div class="codex-article__nav-item codex-article__nav-item--prev">
				{#if navigation.prev}
					<a href="/editions/{edition.slug}/{navigation.prev.slug}">
						<span class="codex-article__nav-label">Previous</span>
						<span class="codex-article__nav-title">{navigation.prev.title}</span>
					</a>
				{/if}
			</div>

			<div class="codex-article__nav-center">
				<span>{navigation.current} of {navigation.total}</span>
				<a href="/editions/{edition.slug}" class="codex-article__nav-toc">
					View Contents
				</a>
			</div>

			<div class="codex-article__nav-item codex-article__nav-item--next">
				{#if navigation.next}
					<a href="/editions/{edition.slug}/{navigation.next.slug}">
						<span class="codex-article__nav-label">Next</span>
						<span class="codex-article__nav-title">{navigation.next.title}</span>
					</a>
				{/if}
			</div>
		</nav>

		<!-- Footer -->
		<footer class="codex-article__footer">
			<a href="/editions/{edition.slug}" class="codex-article__back">
				← Back to {edition.title}
			</a>
		</footer>
	</article>
</CodexProvider>

<style>
	.codex-article {
		min-height: 100vh;
		background: var(--codex-paper-cream);
	}

	/* Header */
	.codex-article__header {
		position: relative;
		max-width: 800px;
		margin: 0 auto;
		padding: 3rem 1.5rem 2rem;
		text-align: center;
	}

	.codex-article__breadcrumb {
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-xs);
		color: var(--codex-ink-muted);
		margin-bottom: 2rem;
	}

	.codex-article__breadcrumb a {
		color: var(--codex-ink-muted);
		text-decoration: none;
	}

	.codex-article__breadcrumb a:hover {
		color: var(--codex-accent);
	}

	.codex-article__breadcrumb span {
		margin: 0 0.5rem;
	}

	.codex-article__meta-top {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.codex-article__season,
	.codex-article__section {
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-xs);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.codex-article__season {
		color: var(--codex-accent);
	}

	.codex-article__section {
		color: var(--codex-ink-muted);
	}

	.codex-article__title {
		font-family: var(--codex-font-display);
		font-size: var(--codex-text-4xl);
		font-weight: 700;
		color: var(--codex-ink-black);
		margin: 0 0 1rem;
		line-height: 1.1;
	}

	.codex-article__subtitle {
		font-family: var(--codex-font-display);
		font-size: var(--codex-text-xl);
		font-style: italic;
		color: var(--codex-ink-sepia);
		margin: 0 0 1.5rem;
	}

	.codex-article__byline {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
		color: var(--codex-ink-muted);
	}

	.codex-article__author {
		font-weight: 500;
		color: var(--codex-ink-sepia);
	}

	.codex-article__controls {
		position: absolute;
		top: 1rem;
		right: 1rem;
	}

	/* Cover Image */
	.codex-article__cover {
		max-width: 1000px;
		margin: 0 auto 2rem;
		padding: 0 1.5rem;
	}

	.codex-article__cover img {
		width: 100%;
		height: auto;
		border-radius: var(--codex-radius-soft);
		box-shadow: var(--codex-shadow-lifted);
	}

	/* Prose Content */
	.codex-prose {
		font-family: var(--codex-font-body);
		font-size: var(--codex-text-lg);
		line-height: var(--codex-leading-loose);
		color: var(--codex-ink-black);
	}

	.codex-prose h1,
	.codex-prose h2,
	.codex-prose h3 {
		font-family: var(--codex-font-display);
		color: var(--codex-ink-black);
		margin-top: 2em;
		margin-bottom: 0.5em;
	}

	.codex-prose h1 {
		font-size: var(--codex-text-3xl);
	}

	.codex-prose h2 {
		font-size: var(--codex-text-2xl);
	}

	.codex-prose h3 {
		font-size: var(--codex-text-xl);
	}

	.codex-prose p {
		margin-bottom: 1.5em;
	}

	.codex-prose p:first-of-type::first-letter {
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

	/* Navigation */
	.codex-article__nav {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 2rem;
		max-width: 1000px;
		margin: 0 auto;
		padding: 3rem 1.5rem;
		border-top: 1px solid var(--codex-ink-light);
	}

	.codex-article__nav-item a {
		display: block;
		text-decoration: none;
		color: inherit;
		padding: 1rem;
		border-radius: var(--codex-radius-soft);
		transition: background-color 0.2s;
	}

	.codex-article__nav-item a:hover {
		background: var(--codex-paper-aged);
	}

	.codex-article__nav-item--prev {
		text-align: left;
	}

	.codex-article__nav-item--next {
		text-align: right;
	}

	.codex-article__nav-label {
		display: block;
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--codex-ink-muted);
		margin-bottom: 0.25rem;
	}

	.codex-article__nav-title {
		font-family: var(--codex-font-display);
		font-size: var(--codex-text-base);
		color: var(--codex-ink-sepia);
	}

	.codex-article__nav-center {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
		color: var(--codex-ink-muted);
	}

	.codex-article__nav-toc {
		color: var(--codex-accent);
		text-decoration: none;
		margin-top: 0.5rem;
	}

	.codex-article__nav-toc:hover {
		text-decoration: underline;
	}

	/* Footer */
	.codex-article__footer {
		padding: 2rem 1.5rem;
		text-align: center;
		border-top: 1px solid var(--codex-ink-light);
	}

	.codex-article__back {
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
		color: var(--codex-ink-sepia);
		text-decoration: none;
	}

	.codex-article__back:hover {
		color: var(--codex-accent);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.codex-article__title {
			font-size: var(--codex-text-3xl);
		}

		.codex-article__controls {
			position: static;
			margin-top: 1.5rem;
		}

		.codex-article__nav {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.codex-article__nav-item--prev,
		.codex-article__nav-item--next {
			text-align: center;
		}

		.codex-article__nav-center {
			order: -1;
		}
	}
</style>
