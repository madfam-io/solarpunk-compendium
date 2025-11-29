<script lang="ts">
	/**
	 * SEO Component
	 *
	 * Reusable component for setting page-specific meta tags and Open Graph data.
	 * Import and use in any +page.svelte or layout.
	 */

	// Core meta
	export let title = 'The Solarpunk Almanac';
	export let description =
		'A quarterly publication for the global solarpunk movement. Practical guides for regenerative living, community resilience, and building hopeful futures.';
	export let keywords =
		'solarpunk, sustainability, regenerative, community, permaculture, renewable energy, resilience';

	// Open Graph
	export let ogType: 'website' | 'article' = 'website';
	export let ogImage = '/og-image.svg';
	export let ogUrl = '';

	// Twitter
	export let twitterCard: 'summary' | 'summary_large_image' = 'summary_large_image';
	export let twitterSite = '@solarpunkalmanac';

	// Article-specific (optional)
	export let author = '';
	export let publishedTime = '';
	export let section = '';

	// Canonical URL
	export let canonical = '';

	// Site name
	const siteName = 'The Solarpunk Almanac';

	// Computed full title
	$: fullTitle = title === siteName ? title : `${title} | ${siteName}`;
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="title" content={fullTitle} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />

	<!-- Canonical -->
	{#if canonical}
		<link rel="canonical" href={canonical} />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={ogType} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	{#if ogUrl}
		<meta property="og:url" content={ogUrl} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:site" content={twitterSite} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	<!-- Article-specific -->
	{#if ogType === 'article'}
		{#if author}
			<meta property="article:author" content={author} />
		{/if}
		{#if publishedTime}
			<meta property="article:published_time" content={publishedTime} />
		{/if}
		{#if section}
			<meta property="article:section" content={section} />
		{/if}
	{/if}

	<!-- Additional SEO -->
	<meta name="robots" content="index, follow" />
	<meta name="googlebot" content="index, follow" />
</svelte:head>
