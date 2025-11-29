<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { getSeasonInfo } from '$lib/codex/utils/season';

	export let data;

	$: ({ currentEdition, featuredProjects, daysUntilLaunch } = data);
	$: seasonInfo = currentEdition
		? getSeasonInfo(currentEdition.season as 'winter' | 'spring' | 'summer' | 'autumn')
		: null;

	let email = '';
	let signupMessage = '';
	let signupSuccess = false;

	async function handleSignup(e: Event) {
		e.preventDefault();
		try {
			const response = await fetch('/api/subscribers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			if (response.ok) {
				signupMessage = `Welcome! You'll receive The Seed Edition on December 21st.`;
				signupSuccess = true;
				email = '';
			} else {
				const result = await response.json();
				signupMessage = result.error || 'Something went wrong. Please try again.';
				signupSuccess = false;
			}
		} catch {
			signupMessage = `Thanks! We'll be in touch at ${email}`;
			signupSuccess = true;
			email = '';
		}
	}

	const features = [
		{
			icon: '📖',
			title: 'Seasonal Editions',
			description:
				'Quarterly guides aligned with solstices and equinoxes. Practical wisdom for regenerative living.',
			href: '/editions'
		},
		{
			icon: '🗺️',
			title: 'Global Directory',
			description:
				'Discover projects, ecovillages, and organizations building regenerative futures worldwide.',
			href: '/directory'
		},
		{
			icon: '🛠️',
			title: 'Practical Tools',
			description:
				'Solar calculators, seed planners, and guides to help you take action today.',
			href: '/tools'
		}
	];
</script>

<SEO
	title="The Solarpunk Almanac"
	description="Launching Winter Solstice 2025. Your guide to building tomorrow, today. Seasonal wisdom, practical tools, and a global community."
	keywords="solarpunk, sustainability, regenerative living, community resilience, renewable energy, permaculture, winter solstice"
/>

<!-- Hero Section - Launch Announcement -->
<section class="relative min-h-[95vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
	<!-- Subtle seasonal gradient background -->
	<div
		class="absolute inset-0 opacity-20 pointer-events-none"
		style="background: radial-gradient(ellipse at center, #4fc3f7 0%, transparent 70%);"
	></div>

	<div class="relative max-w-4xl mx-auto text-center z-10">
		<!-- Launch badge -->
		{#if daysUntilLaunch > 0}
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 mb-8">
				<span class="text-lg">{seasonInfo?.emoji || '❄️'}</span>
				<span class="text-sm font-medium text-slate-300">
					Launching Winter Solstice · December 21, 2025
				</span>
				<span class="px-2 py-0.5 rounded-full bg-solarpunk-teal/20 text-solarpunk-teal text-xs font-bold">
					{daysUntilLaunch} days
				</span>
			</div>
		{:else}
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-solarpunk-teal/20 border border-solarpunk-teal/30 mb-8">
				<span class="text-lg">✨</span>
				<span class="text-sm font-medium text-solarpunk-teal">Now Live!</span>
			</div>
		{/if}

		<!-- Main heading -->
		<h1 class="font-orbitron text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
			The Solarpunk<br />
			<span class="gradient-text">Almanac</span>
		</h1>

		<!-- Tagline -->
		<p class="text-xl md:text-2xl text-slate-300 mb-4 max-w-2xl mx-auto font-light">
			Practical wisdom for regenerative living
		</p>

		<p class="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
			Seasonal guides, practical tools, and a global community building flourishing futures—aligned with the rhythm of the earth.
		</p>

		<!-- Email signup card -->
		<div class="card max-w-lg mx-auto mb-10 text-left">
			<div class="flex items-start gap-4 mb-4">
				<div class="text-4xl">{seasonInfo?.emoji || '❄️'}</div>
				<div>
					<h2 class="font-orbitron text-lg font-bold">The Seed Edition</h2>
					<p class="text-sm text-slate-400">
						Our inaugural edition plants the first seeds. Be there when the light returns.
					</p>
				</div>
			</div>

			<form on:submit={handleSignup} class="flex flex-col sm:flex-row gap-3">
				<input
					type="email"
					bind:value={email}
					placeholder="your@email.com"
					required
					class="input flex-1"
				/>
				<button type="submit" class="btn-primary whitespace-nowrap">
					Join the First Seed
				</button>
			</form>

			{#if signupMessage}
				<p class="text-sm mt-4 {signupSuccess ? 'text-leaf-green' : 'text-red-400'}">
					{signupMessage}
				</p>
			{/if}

			<p class="text-xs text-slate-500 mt-4">
				No spam. Unsubscribe anytime. We respect your data like we respect the earth.
			</p>
		</div>

		<!-- CTA buttons -->
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/editions" class="btn-primary text-lg px-8 py-4">
				Preview Editions
			</a>
			<a href="/directory" class="btn-secondary text-lg px-8 py-4">
				Explore Directory
			</a>
		</div>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-500">
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
		</svg>
	</div>
</section>

<!-- Current Edition Preview -->
{#if currentEdition && currentEdition.articles && currentEdition.articles.length > 0}
	<section class="py-20 px-4 codex-paper">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-12">
				<span class="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider mb-4 codex-accent-bg text-slate-900">
					{seasonInfo?.displayName} {currentEdition.year}
				</span>
				<h2 class="font-fraunces text-4xl md:text-5xl font-bold mb-4 codex-ink">
					{currentEdition.title}
				</h2>
				{#if currentEdition.tagline}
					<p class="text-xl codex-ink-sepia italic font-literata">
						"{currentEdition.tagline}"
					</p>
				{/if}
			</div>

			<!-- Articles preview -->
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
				{#each currentEdition.articles as article}
					<a
						href="/editions/{currentEdition.slug}/{article.slug}"
						class="group p-6 rounded-lg transition-all bg-white codex-shadow hover:codex-shadow-lifted"
					>
						{#if article.section}
							<span class="text-xs font-medium uppercase tracking-wider codex-accent">
								{article.section}
							</span>
						{/if}
						<h3 class="font-fraunces text-xl font-semibold mt-1 mb-2 codex-ink group-hover:text-solarpunk-teal transition-colors">
							{article.title}
						</h3>
						{#if article.subtitle}
							<p class="text-sm codex-ink-sepia italic mb-3">{article.subtitle}</p>
						{/if}
						{#if article.excerpt}
							<p class="text-sm codex-ink-muted line-clamp-2">{article.excerpt}</p>
						{/if}
						<div class="flex items-center gap-3 mt-4 text-xs codex-ink-muted">
							{#if article.author}
								<span>{article.author}</span>
							{/if}
							{#if article.readTime}
								<span>·</span>
								<span>{article.readTime} min read</span>
							{/if}
						</div>
					</a>
				{/each}
			</div>

			<div class="text-center">
				<a href="/editions/{currentEdition.slug}" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors">
					View Full Edition
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>
	</section>
{/if}

<!-- Features Grid -->
<section class="py-20 px-4">
	<div class="max-w-6xl mx-auto">
		<h2 class="font-orbitron text-3xl font-bold text-center mb-4">
			Open Infrastructure for Solarpunk
		</h2>
		<p class="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
			The Almanac is more than a publication—it's a toolkit for building regenerative futures.
		</p>

		<div class="grid md:grid-cols-3 gap-6">
			{#each features as feature}
				<a href={feature.href} class="card group hover:border-solarpunk-teal/30 transition-all">
					<div class="text-4xl mb-4">{feature.icon}</div>
					<h3 class="font-orbitron font-bold text-lg mb-2 group-hover:text-solarpunk-teal transition-colors">
						{feature.title}
					</h3>
					<p class="text-sm text-slate-400">
						{feature.description}
					</p>
					<span class="inline-flex items-center gap-1 text-sm text-solarpunk-teal mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
						Explore
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Featured Projects -->
{#if featuredProjects && featuredProjects.length > 0}
	<section class="py-20 px-4 bg-slate-900/50">
		<div class="max-w-6xl mx-auto">
			<div class="flex items-center justify-between mb-10">
				<div>
					<h2 class="font-orbitron text-2xl font-bold">Featured Projects</h2>
					<p class="text-slate-400 mt-1">Communities building regenerative futures</p>
				</div>
				<a href="/directory" class="btn-ghost">
					View All →
				</a>
			</div>

			<div class="grid md:grid-cols-3 gap-6">
				{#each featuredProjects as project}
					<a href="/directory/{project.slug}" class="card group hover:border-solarpunk-teal/30 transition-all overflow-hidden">
						{#if project.coverImage}
							<div class="aspect-video -mx-6 -mt-6 mb-4 overflow-hidden bg-slate-800">
								<img
									src={project.coverImage}
									alt=""
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									loading="lazy"
								/>
							</div>
						{/if}
						<h3 class="font-orbitron font-bold group-hover:text-solarpunk-teal transition-colors">
							{project.name}
						</h3>
						{#if project.location}
							<p class="text-xs text-slate-500 mt-1">{project.location}</p>
						{/if}
						{#if project.tagline}
							<p class="text-sm text-slate-400 mt-2 line-clamp-2">{project.tagline}</p>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Philosophy quote -->
<section class="py-20 px-4">
	<div class="max-w-3xl mx-auto text-center">
		<blockquote class="font-literata text-2xl md:text-3xl italic text-slate-300 leading-relaxed mb-6">
			"Move quietly and plant things."
		</blockquote>
		<p class="text-slate-500">— The Solarpunk Ethos</p>
	</div>
</section>

<!-- Final CTA -->
<section class="py-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
	<div class="max-w-2xl mx-auto text-center">
		<div class="text-5xl mb-6">{seasonInfo?.emoji || '🌱'}</div>
		<h2 class="font-orbitron text-3xl font-bold mb-4">
			The Future is Something We Build
		</h2>
		<p class="text-slate-400 mb-8">
			Join the solarpunks working toward regenerative futures. The light returns on December 21st.
		</p>

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/editions" class="btn-primary text-lg px-8 py-4">
				Start Reading
			</a>
			<a href="/community" class="btn-secondary text-lg px-8 py-4">
				Join Community
			</a>
		</div>
	</div>
</section>
