<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { CodexProvider, ModeToggle } from '$lib/codex';
	import { getSeasonInfo } from '$lib/codex/utils/season';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ edition, articles } = data);
	$: seasonInfo = getSeasonInfo(edition.season as 'winter' | 'spring' | 'summer' | 'autumn');

	type Article = typeof articles[number];
	// Group articles by section
	$: articlesBySection = articles.reduce(
		(acc: Record<string, Article[]>, article: Article) => {
			const section = article.section || 'Features';
			if (!acc[section]) acc[section] = [];
			acc[section].push(article);
			return acc;
		},
		{} as Record<string, Article[]>
	);

	$: sections = Object.keys(articlesBySection);
</script>

<SEO
	title="{edition.title} - {seasonInfo.displayName} {edition.year}"
	description={edition.tagline || edition.description || `${seasonInfo.displayName} ${edition.year} edition of The Solarpunk Almanac`}
	keywords="solarpunk, {edition.season}, {edition.year}, almanac, seasonal guide"
	ogType="article"
/>

<CodexProvider mode="flow" season={edition.season}>
	<div class="edition-page">
		<!-- Edition Header -->
		<header class="edition-header" data-season={edition.season}>
			<div class="edition-header__content">
				<span class="edition-header__season">
					{seasonInfo.emoji} {seasonInfo.displayName} {edition.year}
				</span>
				<h1 class="edition-header__title">{edition.title}</h1>
				{#if edition.tagline}
					<p class="edition-header__tagline">{edition.tagline}</p>
				{/if}
				{#if edition.description}
					<p class="edition-header__description">{edition.description}</p>
				{/if}

				<div class="edition-header__meta">
					<span>{articles.length} articles</span>
					{#if edition.publishedAt}
						<span>Published {new Date(edition.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
					{/if}
				</div>
			</div>

			<!-- Reading mode toggle -->
			<div class="edition-header__controls">
				<ModeToggle />
			</div>
		</header>

		<!-- Table of Contents -->
		<nav class="edition-toc">
			<h2 class="edition-toc__title">In This Edition</h2>
			<div class="edition-toc__sections">
				{#each sections as section}
					<div class="edition-toc__section">
						<h3 class="edition-toc__section-title">{section}</h3>
						<ul class="edition-toc__list">
							{#each articlesBySection[section] as article}
								<li>
									<a href="/editions/{edition.slug}/{article.slug}" class="edition-toc__link">
										<span class="edition-toc__article-title">{article.title}</span>
										{#if article.readTime}
											<span class="edition-toc__read-time">{article.readTime} min</span>
										{/if}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</nav>

		<!-- Articles Grid -->
		<section class="edition-articles">
			<h2 class="sr-only">Articles</h2>
			<div class="edition-articles__grid">
				{#each articles as article, index}
					<a
						href="/editions/{edition.slug}/{article.slug}"
						class="article-card"
						class:article-card--featured={index === 0}
					>
						{#if article.coverImage}
							<div class="article-card__image">
								<img src={article.coverImage} alt="" loading="lazy" />
							</div>
						{/if}
						<div class="article-card__content">
							{#if article.section}
								<span class="article-card__section">{article.section}</span>
							{/if}
							<h3 class="article-card__title">{article.title}</h3>
							{#if article.subtitle}
								<p class="article-card__subtitle">{article.subtitle}</p>
							{/if}
							{#if article.excerpt}
								<p class="article-card__excerpt">{article.excerpt}</p>
							{/if}
							<div class="article-card__meta">
								{#if article.author}
									<span>{article.author}</span>
								{/if}
								{#if article.readTime}
									<span>{article.readTime} min read</span>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		</section>

		<!-- Edition Footer -->
		<footer class="edition-footer">
			<a href="/editions" class="edition-footer__back">
				← All Editions
			</a>
		</footer>
	</div>
</CodexProvider>

<style>
	.edition-page {
		min-height: 100vh;
	}

	/* Header */
	.edition-header {
		position: relative;
		padding: 4rem 1.5rem;
		text-align: center;
		background: linear-gradient(
			135deg,
			var(--codex-paper-cream) 0%,
			var(--codex-paper-tint, var(--codex-paper-white)) 100%
		);
		border-bottom: 1px solid var(--codex-ink-light);
	}

	.edition-header[data-season='winter'] {
		background: linear-gradient(135deg, #f0f4f8 0%, #e8f4fc 100%);
	}

	.edition-header[data-season='spring'] {
		background: linear-gradient(135deg, #f0f8f0 0%, #e8fce8 100%);
	}

	.edition-header[data-season='summer'] {
		background: linear-gradient(135deg, #faf8f0 0%, #fcf8e8 100%);
	}

	.edition-header[data-season='autumn'] {
		background: linear-gradient(135deg, #f8f4f0 0%, #fcf0e8 100%);
	}

	.edition-header__content {
		max-width: 800px;
		margin: 0 auto;
	}

	.edition-header__season {
		display: inline-block;
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--codex-accent);
		margin-bottom: 1rem;
	}

	.edition-header__title {
		font-family: var(--codex-font-display);
		font-size: var(--codex-text-4xl);
		font-weight: 700;
		color: var(--codex-ink-black);
		margin: 0 0 1rem;
		line-height: 1.1;
	}

	.edition-header__tagline {
		font-family: var(--codex-font-display);
		font-size: var(--codex-text-xl);
		font-style: italic;
		color: var(--codex-ink-sepia);
		margin: 0 0 1rem;
	}

	.edition-header__description {
		font-size: var(--codex-text-base);
		color: var(--codex-ink-muted);
		max-width: 600px;
		margin: 0 auto 1.5rem;
		line-height: var(--codex-leading-relaxed);
	}

	.edition-header__meta {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
		color: var(--codex-ink-muted);
	}

	.edition-header__controls {
		position: absolute;
		top: 1rem;
		right: 1rem;
	}

	/* Table of Contents */
	.edition-toc {
		max-width: 800px;
		margin: 0 auto;
		padding: 3rem 1.5rem;
		border-bottom: 1px solid var(--codex-ink-light);
	}

	.edition-toc__title {
		font-family: var(--codex-font-display);
		font-size: var(--codex-text-2xl);
		color: var(--codex-ink-black);
		margin: 0 0 2rem;
		text-align: center;
	}

	.edition-toc__sections {
		display: grid;
		gap: 2rem;
	}

	.edition-toc__section-title {
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--codex-ink-muted);
		margin: 0 0 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--codex-ink-light);
	}

	.edition-toc__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.edition-toc__link {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.5rem 0;
		text-decoration: none;
		color: var(--codex-ink-sepia);
		border-bottom: 1px dotted var(--codex-ink-light);
		transition: color 0.2s;
	}

	.edition-toc__link:hover {
		color: var(--codex-accent);
	}

	.edition-toc__article-title {
		font-family: var(--codex-font-body);
	}

	.edition-toc__read-time {
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-xs);
		color: var(--codex-ink-light);
	}

	/* Articles Grid */
	.edition-articles {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 1.5rem;
	}

	.edition-articles__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
	}

	/* Article Card */
	.article-card {
		display: flex;
		flex-direction: column;
		background: var(--codex-paper-white);
		border-radius: var(--codex-radius-soft);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--codex-shadow-page);
		transition:
			box-shadow 0.2s,
			transform 0.2s;
	}

	.article-card:hover {
		box-shadow: var(--codex-shadow-lifted);
		transform: translateY(-2px);
	}

	.article-card--featured {
		grid-column: 1 / -1;
		flex-direction: row;
	}

	.article-card__image {
		aspect-ratio: 16/9;
		overflow: hidden;
		background: var(--codex-paper-aged);
	}

	.article-card--featured .article-card__image {
		flex: 1;
		aspect-ratio: auto;
		min-height: 300px;
	}

	.article-card__image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.article-card__content {
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.article-card__section {
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--codex-accent);
		margin-bottom: 0.5rem;
	}

	.article-card__title {
		font-family: var(--codex-font-display);
		font-size: var(--codex-text-xl);
		font-weight: 600;
		color: var(--codex-ink-black);
		margin: 0 0 0.5rem;
		line-height: 1.2;
	}

	.article-card--featured .article-card__title {
		font-size: var(--codex-text-2xl);
	}

	.article-card__subtitle {
		font-style: italic;
		color: var(--codex-ink-sepia);
		margin: 0 0 0.75rem;
		font-size: var(--codex-text-sm);
	}

	.article-card__excerpt {
		color: var(--codex-ink-muted);
		font-size: var(--codex-text-sm);
		line-height: var(--codex-leading-relaxed);
		margin: 0 0 1rem;
		flex: 1;
	}

	.article-card__meta {
		display: flex;
		gap: 1rem;
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-xs);
		color: var(--codex-ink-light);
		margin-top: auto;
	}

	/* Footer */
	.edition-footer {
		padding: 2rem 1.5rem;
		text-align: center;
		border-top: 1px solid var(--codex-ink-light);
	}

	.edition-footer__back {
		font-family: var(--codex-font-ui);
		font-size: var(--codex-text-sm);
		color: var(--codex-ink-sepia);
		text-decoration: none;
	}

	.edition-footer__back:hover {
		color: var(--codex-accent);
	}

	/* Utility */
	.sr-only {
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

	@media (max-width: 768px) {
		.edition-header__title {
			font-size: var(--codex-text-3xl);
		}

		.article-card--featured {
			flex-direction: column;
		}

		.article-card--featured .article-card__image {
			min-height: 200px;
		}

		.edition-header__controls {
			position: static;
			margin-top: 1.5rem;
		}
	}
</style>
